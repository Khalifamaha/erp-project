# -*- coding: utf-8 -*-
from django.db.models import Avg, Sum, Count
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import ControleQualite, CritereQualite
from apps.production.models import OrdreFabrication
from apps.inventory.models import Lot
from ..serializers import ControleQualiteSerializer, SaisieControleSerializer


class ControleQualiteViewSet(viewsets.ModelViewSet):
    """
    GET    /api/quality/controles/                     -> liste
    POST   /api/quality/controles/                     -> creer
    POST   /api/quality/controles/saisie_rapide/       -> saisie multi-criteres
    GET    /api/quality/controles/stats/               -> taux conformite global
    GET    /api/quality/controles/non_conformes/       -> controles NC uniquement
    GET    /api/quality/controles/par_of/{of_id}/      -> controles d un OF
    """
    queryset = ControleQualite.objects.select_related(
        'ordre', 'employe', 'critere', 'lot'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['ordre', 'critere', 'resultat', 'lot']
    ordering_fields    = ['date_controle']

    def get_serializer_class(self):
        return ControleQualiteSerializer

    def perform_create(self, serializer):
        serializer.save(employe=self.request.user)

    @action(detail=False, methods=['post'], url_path='saisie_rapide')
    def saisie_rapide(self, request):
        """
        Saisie d un controle qualite depuis l interface qualite.
        Cree le controle et ouvre automatiquement une fiche NC si non conforme critique.
        """
        serializer = SaisieControleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            ordre   = OrdreFabrication.objects.get(id=data['ordre_id'])
            critere = CritereQualite.objects.get(id=data['critere_id'])
        except (OrdreFabrication.DoesNotExist, CritereQualite.DoesNotExist) as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

        lot = None
        if data.get('lot_id'):
            try:
                lot = Lot.objects.get(id=data['lot_id'])
            except Lot.DoesNotExist:
                pass

        qte_conforme = float(data['quantite_controlee']) - float(data.get('quantite_rebut', 0))

        controle = ControleQualite.objects.create(
            ordre=ordre,
            employe=request.user,
            critere=critere,
            lot=lot,
            valeur_mesuree=data.get('valeur_mesuree'),
            quantite_controlee=data['quantite_controlee'],
            quantite_rebut=data.get('quantite_rebut', 0),
            quantite_conforme=max(0, qte_conforme),
            observations=data.get('observations', ''),
            action_corrective=data.get('action_corrective', ''),
        )

        response_data = ControleQualiteSerializer(controle).data
        response_data['fiche_nc_creee'] = (
            controle.resultat == 'non_conforme' and critere.critique
        )
        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='non_conformes')
    def non_conformes(self, request):
        qs = ControleQualite.objects.filter(
            resultat='non_conforme'
        ).select_related('ordre', 'critere', 'lot').order_by('-date_controle')
        return Response(ControleQualiteSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='par_of')
    def par_of(self, request):
        of_id = request.query_params.get('of_id')
        if not of_id:
            return Response({'error': 'of_id requis.'}, status=400)
        qs = ControleQualite.objects.filter(
            ordre_id=of_id
        ).select_related('critere', 'employe').order_by('date_controle')
        return Response(ControleQualiteSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        qs        = ControleQualite.objects.all()
        total     = qs.count()
        conformes = qs.filter(resultat='conforme').count()
        nc        = qs.filter(resultat='non_conforme').count()
        taux_moy  = round((conformes / total * 100), 1) if total > 0 else 0

        pieces_total  = qs.aggregate(t=Sum('quantite_controlee'))['t'] or 0
        pieces_rebut  = qs.aggregate(t=Sum('quantite_rebut'))['t'] or 0
        taux_rebut    = round(float(pieces_rebut) / float(pieces_total) * 100, 2) if float(pieces_total) > 0 else 0

        par_type = list(
            qs.values('resultat').annotate(nombre=Count('id')).order_by('resultat')
        )
        top_nc = list(
            qs.filter(resultat='non_conforme')
            .values('critere__nom')
            .annotate(nombre=Count('id'))
            .order_by('-nombre')[:5]
        )
        return Response({
            'total_controles':    total,
            'conformes':          conformes,
            'non_conformes':      nc,
            'taux_conformite':    taux_moy,
            'pieces_controlees':  float(pieces_total),
            'pieces_rebutees':    float(pieces_rebut),
            'taux_rebut':         taux_rebut,
            'par_resultat':       par_type,
            'top5_nc_criteres':   top_nc,
        })