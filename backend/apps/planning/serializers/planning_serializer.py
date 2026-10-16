# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import PlanningProduction


class PlanningProductionSerializer(serializers.ModelSerializer):
    ordre_numero        = serializers.CharField(source='ordre.numero', read_only=True)
    produit_reference   = serializers.CharField(source='ordre.produit.reference', read_only=True)
    produit_designation = serializers.CharField(source='ordre.produit.designation', read_only=True)
    chaine_nom          = serializers.CharField(source='chaine.nom',  read_only=True)
    chaine_code         = serializers.CharField(source='chaine.code', read_only=True)
    machine_nom         = serializers.CharField(source='machine.nom', read_only=True)
    machine_code        = serializers.CharField(source='machine.code',read_only=True)
    planifie_par_nom    = serializers.SerializerMethodField()
    duree_prevue_heures = serializers.ReadOnlyField()
    # Champs Gantt (format lisible)
    taux_avancement_of  = serializers.DecimalField(
        source='ordre.taux_avancement', max_digits=5, decimal_places=1, read_only=True
    )

    class Meta:
        model  = PlanningProduction
        fields = [
            'id', 'ordre', 'ordre_numero', 'produit_reference', 'produit_designation',
            'chaine', 'chaine_nom', 'chaine_code',
            'machine', 'machine_nom', 'machine_code',
            'date_planifiee', 'heure_debut_prev', 'heure_fin_prev',
            'duree_prevue_heures', 'sequence', 'quantite_planifiee',
            'shift', 'statut', 'planifie_par', 'planifie_par_nom',
            'notes', 'taux_avancement_of', 'date_creation',
        ]
        read_only_fields = ['id', 'date_creation']

    def get_planifie_par_nom(self, obj):
        if obj.planifie_par:
            return f"{obj.planifie_par.prenom} {obj.planifie_par.nom}"
        return None

    def validate(self, data):
        debut = data.get('heure_debut_prev')
        fin   = data.get('heure_fin_prev')
        if debut and fin and fin <= debut:
            raise serializers.ValidationError(
                "L heure de fin doit etre apres l heure de debut."
            )
        return data


class PlanningGanttSerializer(serializers.ModelSerializer):
    """
    Serializer optimise pour le Gantt — frappe-gantt / dhtmlx format.
    Chaque tache = une ligne du planning.
    """
    id_gantt        = serializers.CharField(source='id', read_only=True)
    text            = serializers.SerializerMethodField()
    start_date      = serializers.DateTimeField(source='heure_debut_prev', format='%Y-%m-%d %H:%M')
    end_date        = serializers.DateTimeField(source='heure_fin_prev',   format='%Y-%m-%d %H:%M')
    progress        = serializers.SerializerMethodField()
    resource        = serializers.CharField(source='chaine.code', read_only=True)
    color           = serializers.SerializerMethodField()
    parent          = serializers.SerializerMethodField()

    class Meta:
        model  = PlanningProduction
        fields = [
            'id_gantt', 'text', 'start_date', 'end_date',
            'progress', 'resource', 'color', 'parent',
            'statut', 'shift', 'quantite_planifiee',
        ]

    def get_text(self, obj):
        return f"{obj.ordre.numero} — {obj.ordre.produit.reference} ({obj.quantite_planifiee} pcs)"

    def get_progress(self, obj):
        return round(float(obj.ordre.taux_avancement) / 100, 2)

    def get_color(self, obj):
        couleurs = {
            'brouillon': '#9CA3AF',
            'confirme':  '#3B82F6',
            'en_cours':  '#F59E0B',
            'termine':   '#10B981',
            'reporte':   '#F97316',
            'annule':    '#EF4444',
        }
        return couleurs.get(obj.statut, '#6B7280')

    def get_parent(self, obj):
        return str(obj.ordre.id)


class PlanningCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PlanningProduction
        fields = [
            'ordre', 'chaine', 'machine', 'date_planifiee',
            'heure_debut_prev', 'heure_fin_prev', 'sequence',
            'quantite_planifiee', 'shift', 'notes',
        ]

    def validate(self, data):
        debut = data.get('heure_debut_prev')
        fin   = data.get('heure_fin_prev')
        if debut and fin and fin <= debut:
            raise serializers.ValidationError("Heure fin doit etre apres heure debut.")

        # Verifier conflit machine
        machine = data.get('machine')
        if machine:
            conflits = PlanningProduction.objects.filter(
                machine=machine,
                date_planifiee=data.get('date_planifiee'),
                statut__in=['brouillon', 'confirme', 'en_cours'],
                heure_debut_prev__lt=fin,
                heure_fin_prev__gt=debut,
            )
            if self.instance:
                conflits = conflits.exclude(pk=self.instance.pk)
            if conflits.exists():
                numeros = list(conflits.values_list('ordre__numero', flat=True))
                raise serializers.ValidationError(
                    f"Conflit machine {machine.code} avec : {numeros}"
                )

        # Verifier conflit chaine
        chaine  = data.get('chaine')
        if chaine:
            conflits_chaine = PlanningProduction.objects.filter(
                chaine=chaine,
                date_planifiee=data.get('date_planifiee'),
                shift=data.get('shift'),
                statut__in=['brouillon', 'confirme', 'en_cours'],
                heure_debut_prev__lt=fin,
                heure_fin_prev__gt=debut,
            )
            if self.instance:
                conflits_chaine = conflits_chaine.exclude(pk=self.instance.pk)
            if conflits_chaine.exists():
                numeros = list(conflits_chaine.values_list('ordre__numero', flat=True))
                raise serializers.ValidationError(
                    f"Conflit chaine {chaine.code} avec : {numeros}"
                )
        return data