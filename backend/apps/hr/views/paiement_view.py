# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import PaiementEmploye, Employe
from ..serializers import PaiementSerializer, PaiementBulkSerializer


class PaiementViewSet(viewsets.ModelViewSet):
    """
    GET  /api/hr/paiements/                    → liste
    POST /api/hr/paiements/                    → créer un bulletin
    POST /api/hr/paiements/generer_bulk/       → générer tous les bulletins du mois
    POST /api/hr/paiements/{id}/valider/       → valider un bulletin
    POST /api/hr/paiements/{id}/marquer_paye/  → marquer comme payé
    GET  /api/hr/paiements/resume_mensuel/     → résumé masse salariale
    """
    queryset           = PaiementEmploye.objects.select_related('employe').all()
    serializer_class   = PaiementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['employe', 'statut', 'mode_paiement']
    ordering_fields    = ['periode_debut', 'net_paye']

    @action(detail=False, methods=['post'], url_path='generer_bulk')
    def generer_bulk(self, request):
        """Générer les bulletins de paie pour tous les employés actifs d'une période."""
        serializer = PaiementBulkSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data        = serializer.validated_data
        departement = data.get('departement')
        employes_qs = Employe.objects.filter(statut='actif')
        if departement:
            employes_qs = employes_qs.filter(departement=departement)

        crees, ignores = 0, 0
        for employe in employes_qs:
            _, created = PaiementEmploye.objects.get_or_create(
                employe=employe,
                periode_debut=data['periode_debut'],
                periode_fin=data['periode_fin'],
                defaults={
                    'salaire_base': employe.salaire_base,
                    'statut': 'brouillon',
                }
            )
            if created:
                crees += 1
            else:
                ignores += 1

        return Response({
            'message': f"{crees} bulletin(s) créé(s), {ignores} existaient déjà.",
            'crees': crees,
            'ignores': ignores,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='valider')
    def valider(self, request, pk=None):
        paiement = self.get_object()
        if paiement.statut not in ['brouillon', 'calcule']:
            return Response(
                {'error': 'Seul un bulletin en brouillon ou calculé peut être validé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        paiement.statut = 'valide'
        paiement.save(update_fields=['statut'])
        return Response({'message': 'Bulletin validé.', 'net_paye': str(paiement.net_paye)})

    @action(detail=True, methods=['post'], url_path='marquer_paye')
    def marquer_paye(self, request, pk=None):
        from django.utils import timezone
        paiement = self.get_object()
        if paiement.statut != 'valide':
            return Response(
                {'error': 'Seul un bulletin validé peut être marqué comme payé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        paiement.statut        = 'paye'
        paiement.date_paiement = timezone.now().date()
        paiement.reference_virement = request.data.get('reference_virement', '')
        paiement.save(update_fields=['statut', 'date_paiement', 'reference_virement'])
        return Response({'message': 'Paiement enregistré.'})

    @action(detail=False, methods=['get'], url_path='resume_mensuel')
    def resume_mensuel(self, request):
        """Masse salariale totale par période."""
        from django.db.models import Sum, Count
        periode = request.query_params.get('periode_debut')
        qs = PaiementEmploye.objects.filter(statut__in=['valide', 'paye'])
        if periode:
            qs = qs.filter(periode_debut=periode)
        resume = qs.aggregate(
            total_net=Sum('net_paye'),
            total_cnss=Sum('cotisation_cnss'),
            total_primes=Sum('primes'),
            nombre_bulletins=Count('id'),
        )
        return Response(resume)