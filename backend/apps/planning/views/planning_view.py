# -*- coding: utf-8 -*-
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Sum, Q
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from ..models import PlanningProduction, ContrainteMachine
from ..serializers import (
    PlanningProductionSerializer,
    PlanningGanttSerializer,
    PlanningCreateSerializer,
    ContrainteMachineSerializer,
)


class PlanningProductionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/planning/plannings/                    -> liste
    POST   /api/planning/plannings/                    -> creer
    GET    /api/planning/plannings/gantt/              -> format Gantt (frappe-gantt)
    GET    /api/planning/plannings/semaine/            -> planning semaine courante
    GET    /api/planning/plannings/conflits/           -> detecter conflits
    POST   /api/planning/plannings/{id}/confirmer/     -> confirmer
    POST   /api/planning/plannings/{id}/reporter/      -> reporter
    POST   /api/planning/plannings/{id}/annuler/       -> annuler
    GET    /api/planning/plannings/charge_machine/     -> taux occupation machines
    GET    /api/planning/plannings/charge_chaine/      -> taux occupation chaines
    POST   /api/planning/plannings/generer_auto/       -> generation automatique depuis OF
    """
    queryset = PlanningProduction.objects.select_related(
        'ordre__produit', 'ordre__gamme', 'chaine', 'machine', 'planifie_par'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['chaine', 'machine', 'statut', 'shift', 'date_planifiee', 'ordre']
    search_fields      = ['ordre__numero', 'ordre__produit__reference', 'chaine__code']
    ordering_fields    = ['date_planifiee', 'sequence', 'heure_debut_prev']

    def get_serializer_class(self):
        if self.action == 'create':
            return PlanningCreateSerializer
        return PlanningProductionSerializer

    def perform_create(self, serializer):
        serializer.save(planifie_par=self.request.user)

    # ── Gantt ──────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='gantt')
    def gantt(self, request):
        """
        Retourne les donnees au format frappe-gantt / dhtmlx.
        Parametres optionnels : date_debut, date_fin, chaine_id
        """
        date_debut = request.query_params.get('date_debut')
        date_fin   = request.query_params.get('date_fin')
        chaine_id  = request.query_params.get('chaine_id')

        qs = PlanningProduction.objects.select_related(
            'ordre__produit', 'chaine', 'machine'
        ).exclude(statut='annule')

        if date_debut:
            qs = qs.filter(date_planifiee__gte=date_debut)
        if date_fin:
            qs = qs.filter(date_planifiee__lte=date_fin)
        if chaine_id:
            qs = qs.filter(chaine_id=chaine_id)

        # Format Gantt : taches + ressources
        taches    = PlanningGanttSerializer(qs.order_by('heure_debut_prev'), many=True).data
        ressources= list(
            PlanningProduction.objects.values(
                'chaine__id', 'chaine__code', 'chaine__nom'
            ).distinct()
        )
        return Response({
            'taches':     taches,
            'ressources': ressources,
            'total':      len(taches),
        })

    # ── Semaine ────────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='semaine')
    def semaine(self, request):
        """Planning de la semaine courante (ou d'une date donnee)."""
        date_ref  = request.query_params.get('date', str(timezone.now().date()))
        from datetime import date as dt_date
        try:
            d = dt_date.fromisoformat(date_ref)
        except ValueError:
            d = timezone.now().date()
        lundi  = d - timedelta(days=d.weekday())
        vendredi = lundi + timedelta(days=4)

        qs = PlanningProduction.objects.filter(
            date_planifiee__gte=lundi,
            date_planifiee__lte=vendredi,
        ).select_related('ordre__produit', 'chaine', 'machine').order_by(
            'date_planifiee', 'sequence'
        )

        # Grouper par jour
        result = {}
        for p in qs:
            jour = str(p.date_planifiee)
            if jour not in result:
                result[jour] = []
            result[jour].append(PlanningProductionSerializer(p).data)

        return Response({
            'semaine_debut': str(lundi),
            'semaine_fin':   str(vendredi),
            'jours':         result,
            'total':         qs.count(),
        })

    # ── Conflits ───────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='conflits')
    def conflits(self, request):
        """Detecte les chevauchements machine et chaine dans le planning."""
        date_debut = request.query_params.get('date_debut', str(timezone.now().date()))
        date_fin   = request.query_params.get('date_fin',
                     str(timezone.now().date() + timedelta(days=14)))

        qs = PlanningProduction.objects.filter(
            date_planifiee__gte=date_debut,
            date_planifiee__lte=date_fin,
            statut__in=['brouillon', 'confirme', 'en_cours'],
        ).select_related('ordre', 'chaine', 'machine').order_by('heure_debut_prev')

        conflits_trouves = []

        # Verifier conflits machine
        plannings_list = list(qs)
        for i, p1 in enumerate(plannings_list):
            for p2 in plannings_list[i+1:]:
                if p1.machine and p2.machine and p1.machine == p2.machine:
                    if (p1.heure_debut_prev < p2.heure_fin_prev and
                            p1.heure_fin_prev > p2.heure_debut_prev):
                        conflits_trouves.append({
                            'type':      'machine',
                            'machine':   p1.machine.code,
                            'planning1': PlanningProductionSerializer(p1).data,
                            'planning2': PlanningProductionSerializer(p2).data,
                        })

                if (p1.chaine == p2.chaine and p1.shift == p2.shift and
                        p1.date_planifiee == p2.date_planifiee):
                    if (p1.heure_debut_prev < p2.heure_fin_prev and
                            p1.heure_fin_prev > p2.heure_debut_prev):
                        conflits_trouves.append({
                            'type':      'chaine',
                            'chaine':    p1.chaine.code,
                            'planning1': PlanningProductionSerializer(p1).data,
                            'planning2': PlanningProductionSerializer(p2).data,
                        })

        return Response({
            'nb_conflits': len(conflits_trouves),
            'conflits':    conflits_trouves,
        })

    # ── Transitions statut ─────────────────────────────────────────────────────
    def _transition(self, pk, nouveau_statut, statuts_autorises, message):
        planning = self.get_object()
        if planning.statut not in statuts_autorises:
            return Response(
                {'error': f"Impossible depuis le statut '{planning.statut}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        planning.statut = nouveau_statut
        planning.save(update_fields=['statut'])
        return Response({'message': message, 'statut': nouveau_statut})

    @action(detail=True, methods=['post'], url_path='confirmer')
    def confirmer(self, request, pk=None):
        return self._transition(pk, 'confirme', ['brouillon'], 'Planning confirme.')

    @action(detail=True, methods=['post'], url_path='reporter')
    def reporter(self, request, pk=None):
        planning      = self.get_object()
        nouvelle_date = request.data.get('nouvelle_date')
        if not nouvelle_date:
            return Response({'error': 'nouvelle_date requis.'}, status=status.HTTP_400_BAD_REQUEST)
        from datetime import date as dt_date
        try:
            planning.date_planifiee = dt_date.fromisoformat(nouvelle_date)
        except ValueError:
            return Response({'error': 'Format date invalide (YYYY-MM-DD).'}, status=status.HTTP_400_BAD_REQUEST)
        planning.statut = 'reporte'
        planning.save(update_fields=['date_planifiee', 'statut'])
        return Response({'message': f"Reporte au {nouvelle_date}.", 'statut': 'reporte'})

    @action(detail=True, methods=['post'], url_path='annuler')
    def annuler(self, request, pk=None):
        return self._transition(pk, 'annule', ['brouillon', 'confirme', 'reporte'], 'Planning annule.')

    # ── Charge machines ────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='charge_machine')
    def charge_machine(self, request):
        """Taux d occupation des machines sur une periode."""
        date_debut = request.query_params.get('date_debut', str(timezone.now().date()))
        date_fin   = request.query_params.get('date_fin',
                     str(timezone.now().date() + timedelta(days=7)))

        from apps.production.models import Machine
        machines   = Machine.objects.filter(statut='disponible')
        result     = []
        nb_jours   = (timezone.now().date() + timedelta(days=7) - timezone.now().date()).days or 1

        for machine in machines:
            plannings_m = PlanningProduction.objects.filter(
                machine=machine,
                date_planifiee__gte=date_debut,
                date_planifiee__lte=date_fin,
                statut__in=['confirme', 'en_cours'],
            )
            heures_planifiees = sum(p.duree_prevue_heures for p in plannings_m)
            heures_dispo      = nb_jours * float(machine.cadence_horaire) / float(machine.cadence_horaire) * 8
            taux              = round((heures_planifiees / heures_dispo * 100), 1) if heures_dispo > 0 else 0
            result.append({
                'machine_code':      machine.code,
                'machine_nom':       machine.nom,
                'heures_planifiees': round(heures_planifiees, 2),
                'heures_disponibles':round(heures_dispo, 2),
                'taux_occupation':   min(taux, 100),
                'nb_of_planifies':   plannings_m.count(),
            })

        result.sort(key=lambda x: x['taux_occupation'], reverse=True)
        return Response({
            'periode': {'debut': date_debut, 'fin': date_fin},
            'machines': result,
        })

    # ── Charge chaines ─────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='charge_chaine')
    def charge_chaine(self, request):
        """Taux d occupation des chaines de production."""
        date_debut = request.query_params.get('date_debut', str(timezone.now().date()))
        date_fin   = request.query_params.get('date_fin',
                     str(timezone.now().date() + timedelta(days=7)))

        from apps.production.models import ChaineProduction
        chaines = ChaineProduction.objects.filter(statut='active')
        result  = []

        for chaine in chaines:
            plannings_c = PlanningProduction.objects.filter(
                chaine=chaine,
                date_planifiee__gte=date_debut,
                date_planifiee__lte=date_fin,
                statut__in=['confirme', 'en_cours'],
            )
            total_pieces = sum(float(p.quantite_planifiee) for p in plannings_c)
            result.append({
                'chaine_code':    chaine.code,
                'chaine_nom':     chaine.nom,
                'nb_of_planifies':plannings_c.count(),
                'total_pieces':   round(total_pieces, 0),
                'objectif_jour':  chaine.objectif_jour,
                'shifts_planifies': list(
                    plannings_c.values_list('shift', flat=True).distinct()
                ),
            })

        return Response({
            'periode': {'debut': date_debut, 'fin': date_fin},
            'chaines': result,
        })

    # ── Generation automatique ──────────────────────────────────────────────────
    @action(detail=False, methods=['post'], url_path='generer_auto')
    def generer_auto(self, request):
        """
        Genere automatiquement le planning depuis les OF en attente.
        Assigne chaque OF a une chaine disponible selon la gamme.
        """
        date_debut_str = request.data.get('date_debut', str(timezone.now().date()))
        from datetime import date as dt_date, datetime, time
        try:
            date_debut = dt_date.fromisoformat(date_debut_str)
        except ValueError:
            return Response({'error': 'Format date invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.production.models import OrdreFabrication, ChaineProduction
        ofs_en_attente = OrdreFabrication.objects.filter(
            statut__in=['brouillon', 'planifie']
        ).select_related('produit', 'gamme').order_by('priorite', 'date_debut_prev')

        if not ofs_en_attente.exists():
            return Response({'message': 'Aucun OF en attente de planification.', 'crees': 0})

        chaines_actives = list(ChaineProduction.objects.filter(statut='active'))
        if not chaines_actives:
            return Response({'error': 'Aucune chaine active disponible.'}, status=status.HTTP_400_BAD_REQUEST)

        plannings_crees = []
        date_courante   = date_debut
        chaine_idx      = 0

        for of in ofs_en_attente:
            chaine = chaines_actives[chaine_idx % len(chaines_actives)]

            # Calcul duree estimee depuis la gamme
            temps_total_min = float(of.gamme.temps_total_min) * float(of.quantite_prevue)
            duree_heures    = temps_total_min / 60

            heure_debut = timezone.make_aware(
                datetime.combine(date_courante, time(8, 0))
            )
            heure_fin = heure_debut + timedelta(hours=min(duree_heures, 8))

            # Verifier pas de conflit
            conflit = PlanningProduction.objects.filter(
                chaine=chaine,
                date_planifiee=date_courante,
                shift='matin',
                statut__in=['brouillon', 'confirme'],
                heure_debut_prev__lt=heure_fin,
                heure_fin_prev__gt=heure_debut,
            ).exists()

            if conflit:
                date_courante += timedelta(days=1)
                heure_debut = timezone.make_aware(datetime.combine(date_courante, time(8, 0)))
                heure_fin   = heure_debut + timedelta(hours=min(duree_heures, 8))

            try:
                planning = PlanningProduction(
                    ordre=of,
                    chaine=chaine,
                    date_planifiee=date_courante,
                    heure_debut_prev=heure_debut,
                    heure_fin_prev=heure_fin,
                    sequence=len(plannings_crees) + 1,
                    quantite_planifiee=of.quantite_prevue,
                    shift='matin',
                    statut='brouillon',
                    planifie_par=request.user,
                    notes=f"Genere automatiquement le {timezone.now().date()}",
                )
                planning.save()
                plannings_crees.append(str(planning.id))

                # Mettre a jour le statut OF
                of.statut = 'planifie'
                of.save(update_fields=['statut'])

            except Exception as e:
                pass  # Ignorer conflits restants

            chaine_idx    += 1
            date_courante  = date_courante if chaine_idx % len(chaines_actives) != 0 else date_courante + timedelta(days=1)

        return Response({
            'message':   f"{len(plannings_crees)} planning(s) cree(s) automatiquement.",
            'crees':     len(plannings_crees),
            'ids':       plannings_crees,
        }, status=status.HTTP_201_CREATED)