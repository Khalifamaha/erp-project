# -*- coding: utf-8 -*-
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import (
    ChaineProduction, AffectationEmployeChaine,
    AffectationChaine, SessionProduction,
)
from ..serializers import (
    ChaineProductionSerializer, SessionProductionSerializer,
    AffectationEmployeSerializer, AffectationChaineSerializer,
    IncrementCompteurSerializer,
)


class ChaineProductionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/production/chaines/                          -> liste
    POST   /api/production/chaines/                          -> creer
    GET    /api/production/chaines/{id}/                     -> detail + session en cours
    GET    /api/production/chaines/{id}/sessions/            -> historique sessions
    POST   /api/production/chaines/{id}/demarrer_session/    -> demarrer shift
    POST   /api/production/chaines/{id}/terminer_session/    -> terminer shift
    GET    /api/production/chaines/{id}/employes/            -> employes affectes
    GET    /api/production/chaines/dashboard/                -> vue temps reel toutes chaines
    """
    queryset           = ChaineProduction.objects.select_related('chef').all()
    serializer_class   = ChaineProductionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields   = ['statut', 'type_shift']
    search_fields      = ['code', 'nom']

    @action(detail=True, methods=['post'], url_path='demarrer_session')
    def demarrer_session(self, request, pk=None):
        chaine = self.get_object()
        # Verifier qu il n y a pas de session en cours
        session_active = chaine.sessions.filter(statut='en_cours').first()
        if session_active:
            return Response(
                {'error': f"Session deja en cours : {session_active.shift} — {session_active.date_session}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        shift          = request.data.get('shift', 'matin')
        ordre_id       = request.data.get('ordre_id')
        objectif       = request.data.get('objectif_session', chaine.objectif_shift)
        aujourd_hui    = timezone.now().date()

        ordre = None
        if ordre_id:
            from ..models import OrdreFabrication
            try:
                ordre = OrdreFabrication.objects.get(id=ordre_id)
            except OrdreFabrication.DoesNotExist:
                pass

        session = SessionProduction.objects.create(
            chaine=chaine,
            ordre=ordre,
            date_session=aujourd_hui,
            shift=shift,
            heure_debut=timezone.now(),
            objectif_session=objectif,
            statut='en_cours',
            chef=request.user,
        )
        return Response(
            SessionProductionSerializer(session).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='terminer_session')
    def terminer_session(self, request, pk=None):
        chaine  = self.get_object()
        session = chaine.sessions.filter(statut='en_cours').first()
        if not session:
            return Response(
                {'error': "Aucune session en cours sur cette chaine."},
                status=status.HTTP_400_BAD_REQUEST
            )
        session.heure_fin = timezone.now()
        session.statut    = 'terminee'
        session.observations = request.data.get('observations', '')
        session.save(update_fields=['heure_fin', 'statut', 'observations'])

        # Mettre a jour l OF si lie
        if session.ordre:
            of = session.ordre
            of.quantite_produite = float(of.quantite_produite) + session.compteur_pieces
            if of.statut == 'lance':
                of.statut = 'en_cours'
            of.save(update_fields=['quantite_produite', 'statut'])

        return Response({
            'message':          'Session terminee.',
            'compteur_pieces':  session.compteur_pieces,
            'taux_realisation': str(session.taux_realisation),
            'statut':           'terminee',
        })

    @action(detail=True, methods=['post'], url_path='incrementer')
    def incrementer(self, request, pk=None):
        """Incrementer le compteur de pieces de la session en cours."""
        chaine  = self.get_object()
        session = chaine.sessions.filter(statut='en_cours').first()
        if not session:
            return Response(
                {'error': "Aucune session en cours."},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = IncrementCompteurSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        quantite = serializer.validated_data['quantite']
        session.incrementer_compteur(quantite)

        return Response({
            'compteur_pieces':  session.compteur_pieces,
            'objectif_session': session.objectif_session,
            'taux_realisation': str(session.taux_realisation),
            'objectif_heure':   chaine.objectif_heure,
        })

    @action(detail=True, methods=['get'], url_path='sessions')
    def sessions(self, request, pk=None):
        chaine = self.get_object()
        qs     = chaine.sessions.order_by('-date_session', '-heure_debut')[:30]
        return Response(SessionProductionSerializer(qs, many=True).data)

    @action(detail=True, methods=['get'], url_path='employes')
    def employes(self, request, pk=None):
        chaine = self.get_object()
        qs     = chaine.affectations_employes.filter(actif=True).select_related('employe')
        return Response(AffectationEmployeSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        """Vue temps reel de toutes les chaines — pour le dashboard direction."""
        chaines = ChaineProduction.objects.select_related('chef').all()
        result  = []
        for chaine in chaines:
            session = chaine.sessions.filter(statut='en_cours').first()
            result.append({
                'id':           str(chaine.id),
                'code':         chaine.code,
                'nom':          chaine.nom,
                'statut':       chaine.statut,
                'objectif_heure': chaine.objectif_heure,
                'session_en_cours': SessionProductionSerializer(session).data if session else None,
                'employes_actifs': chaine.affectations_employes.filter(actif=True).count(),
            })
        return Response(result)


class SessionProductionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = SessionProduction.objects.select_related('chaine', 'ordre', 'chef').all()
    serializer_class   = SessionProductionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['chaine', 'statut', 'shift', 'date_session']
    ordering_fields    = ['date_session', 'heure_debut']


class AffectationEmployeViewSet(viewsets.ModelViewSet):
    queryset           = AffectationEmployeChaine.objects.select_related('employe', 'chaine').all()
    serializer_class   = AffectationEmployeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['chaine', 'employe', 'shift', 'actif']