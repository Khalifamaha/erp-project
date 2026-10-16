# -*- coding: utf-8 -*-
import os
import django
from datetime import date, timedelta, datetime, time
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.planning.models import PlanningProduction, ContrainteMachine
from apps.production.models import OrdreFabrication, ChaineProduction, Machine
from apps.accounts.models import User
from django.utils import timezone

print("\n" + "="*60)
print("  SEED PLANNING - Plannings, Contraintes Machine")
print("="*60)

# 0. Nettoyage
print("\n[0] Nettoyage planning...")
PlanningProduction.objects.all().delete()
ContrainteMachine.objects.all().delete()
print("    OK")

try:
    user_chef = User.objects.get(email='chef.production@erp.com')
    user_dir  = User.objects.get(email='direction@erp.com')
except User.DoesNotExist:
    user_chef = user_dir = User.objects.filter(is_active=True).first()

try:
    ordres   = {of.numero: of for of in OrdreFabrication.objects.all()}
    chaines  = {c.code: c for c in ChaineProduction.objects.all()}
    machines = {m.code: m for m in Machine.objects.all()}
    if not ordres:
        print("    ATTENTION : OF non trouves - lancer seed_production.py d abord")
        import sys; sys.exit(1)
except Exception as e:
    print(f"    ERREUR : {e}")
    import sys; sys.exit(1)

aujourd_hui = date.today()

def dt_aware(d, h=8, m=0):
    return timezone.make_aware(datetime(d.year, d.month, d.day, h, m))

# 1. CONTRAINTES MACHINE
print("\n[1] Creation des contraintes machine...")

contraintes_data = [
    {
        'machine':        machines['MCH-001'],
        'heure_debut':    dt_aware(aujourd_hui + timedelta(days=15), 7, 0),
        'heure_fin':      dt_aware(aujourd_hui + timedelta(days=15), 11, 0),
        'type_contrainte':'maintenance',
        'motif':          'Maintenance preventive mensuelle - graissage guides laser',
    },
    {
        'machine':        machines['MCH-003'],
        'heure_debut':    dt_aware(aujourd_hui + timedelta(days=7), 8, 0),
        'heure_fin':      dt_aware(aujourd_hui + timedelta(days=7), 12, 0),
        'type_contrainte':'calibrage',
        'motif':          'Etalonnage geometrique tour CNC semi-annuel',
    },
    {
        'machine':        machines['MCH-006'],
        'heure_debut':    dt_aware(aujourd_hui, 10, 30),
        'heure_fin':      dt_aware(aujourd_hui + timedelta(days=1), 8, 0),
        'type_contrainte':'panne',
        'motif':          'Panne courroie - machine indisponible jusqu a reparation',
    },
    {
        'machine':        machines['MCH-004'],
        'heure_debut':    dt_aware(aujourd_hui + timedelta(days=3), 6, 0),
        'heure_fin':      dt_aware(aujourd_hui + timedelta(days=3), 9, 0),
        'type_contrainte':'formation',
        'motif':          'Formation nouvel operateur fraiseuse CNC',
    },
    {
        'machine':        machines['MCH-007'],
        'heure_debut':    dt_aware(aujourd_hui + timedelta(days=5), 7, 0),
        'heure_fin':      dt_aware(aujourd_hui + timedelta(days=5), 8, 0),
        'type_contrainte':'maintenance',
        'motif':          'Graissage verin pliage - retard maintenance preventive',
    },
]

contraintes = []
for cd in contraintes_data:
    c = ContrainteMachine.objects.create(cree_par=user_chef, **cd)
    contraintes.append(c)
    print(f"    OK - {c.machine.code} | {c.type_contrainte} | {c.heure_debut.strftime('%d/%m %H:%M')} -> {c.heure_fin.strftime('%d/%m %H:%M')}")

# 2. PLANNINGS
print("\n[2] Creation des plannings de production...")

# Plannings semaine courante + suivante
plannings_data = [
    # Hier - termines
    {
        'ordre': ordres.get('OF-2024-004'),
        'chaine': chaines['CH-01'],
        'machine': machines['MCH-001'],
        'date_planifiee': aujourd_hui - timedelta(days=1),
        'heure_debut_prev': dt_aware(aujourd_hui - timedelta(days=1), 6, 0),
        'heure_fin_prev':   dt_aware(aujourd_hui - timedelta(days=1), 14, 0),
        'sequence': 1, 'quantite_planifiee': Decimal('40'),
        'shift': 'matin', 'statut': 'termine',
        'notes': 'Shift matin - decoupe chassis J-1',
    },
    {
        'ordre': ordres.get('OF-2024-005'),
        'chaine': chaines['CH-02'],
        'machine': machines['MCH-007'],
        'date_planifiee': aujourd_hui - timedelta(days=1),
        'heure_debut_prev': dt_aware(aujourd_hui - timedelta(days=1), 14, 0),
        'heure_fin_prev':   dt_aware(aujourd_hui - timedelta(days=1), 22, 0),
        'sequence': 1, 'quantite_planifiee': Decimal('120'),
        'shift': 'aprem', 'statut': 'termine',
        'notes': 'Shift apres-midi - pliage boitiers J-1',
    },
    # Aujourd hui - en cours
    {
        'ordre': ordres.get('OF-2024-004'),
        'chaine': chaines['CH-01'],
        'machine': machines['MCH-001'],
        'date_planifiee': aujourd_hui,
        'heure_debut_prev': dt_aware(aujourd_hui, 6, 0),
        'heure_fin_prev':   dt_aware(aujourd_hui, 14, 0),
        'sequence': 1, 'quantite_planifiee': Decimal('35'),
        'shift': 'matin', 'statut': 'en_cours',
        'notes': 'Shift matin - decoupe chassis OF-004',
    },
    {
        'ordre': ordres.get('OF-2024-005'),
        'chaine': chaines['CH-02'],
        'machine': machines['MCH-002'],
        'date_planifiee': aujourd_hui,
        'heure_debut_prev': dt_aware(aujourd_hui, 6, 0),
        'heure_fin_prev':   dt_aware(aujourd_hui, 14, 0),
        'sequence': 1, 'quantite_planifiee': Decimal('150'),
        'shift': 'matin', 'statut': 'en_cours',
        'notes': 'Presse pliage boitier B200',
    },
    {
        'ordre': ordres.get('OF-2024-004'),
        'chaine': chaines['CH-03'],
        'machine': machines['MCH-005'],
        'date_planifiee': aujourd_hui,
        'heure_debut_prev': dt_aware(aujourd_hui, 14, 0),
        'heure_fin_prev':   dt_aware(aujourd_hui, 22, 0),
        'sequence': 2, 'quantite_planifiee': Decimal('35'),
        'shift': 'aprem', 'statut': 'confirme',
        'notes': 'Soudure chassis apres decoupe',
    },
    # Demain - confirme
    {
        'ordre': ordres.get('OF-2024-006'),
        'chaine': chaines['CH-01'],
        'machine': machines['MCH-001'],
        'date_planifiee': aujourd_hui + timedelta(days=1),
        'heure_debut_prev': dt_aware(aujourd_hui + timedelta(days=1), 6, 0),
        'heure_fin_prev':   dt_aware(aujourd_hui + timedelta(days=1), 14, 0),
        'sequence': 1, 'quantite_planifiee': Decimal('200'),
        'shift': 'matin', 'statut': 'confirme',
        'notes': 'Debut OF-006 supports fixation',
    },
    {
        'ordre': ordres.get('OF-2024-006'),
        'chaine': chaines['CH-02'],
        'machine': machines['MCH-007'],
        'date_planifiee': aujourd_hui + timedelta(days=1),
        'heure_debut_prev': dt_aware(aujourd_hui + timedelta(days=1), 14, 0),
        'heure_fin_prev':   dt_aware(aujourd_hui + timedelta(days=1), 22, 0),
        'sequence': 2, 'quantite_planifiee': Decimal('200'),
        'shift': 'aprem', 'statut': 'confirme',
        'notes': 'Pliage supports apres decoupe',
    },
    # Semaine prochaine - brouillon
    {
        'ordre': ordres.get('OF-2024-007'),
        'chaine': chaines['CH-01'],
        'machine': machines['MCH-001'],
        'date_planifiee': aujourd_hui + timedelta(days=8),
        'heure_debut_prev': dt_aware(aujourd_hui + timedelta(days=8), 6, 0),
        'heure_fin_prev':   dt_aware(aujourd_hui + timedelta(days=8), 14, 0),
        'sequence': 1, 'quantite_planifiee': Decimal('60'),
        'shift': 'matin', 'statut': 'brouillon',
        'notes': 'OF urgence client - a confirmer',
    },
    {
        'ordre': ordres.get('OF-2024-006'),
        'chaine': chaines['CH-01'],
        'machine': machines['MCH-001'],
        'date_planifiee': aujourd_hui + timedelta(days=2),
        'heure_debut_prev': dt_aware(aujourd_hui + timedelta(days=2), 6, 0),
        'heure_fin_prev':   dt_aware(aujourd_hui + timedelta(days=2), 14, 0),
        'sequence': 1, 'quantite_planifiee': Decimal('300'),
        'shift': 'matin', 'statut': 'confirme',
        'notes': 'Suite OF-006 decoupe J+2',
    },
    {
        'ordre': ordres.get('OF-2024-005'),
        'chaine': chaines['CH-04'],
        'machine': machines['MCH-008'],
        'date_planifiee': aujourd_hui + timedelta(days=2),
        'heure_debut_prev': dt_aware(aujourd_hui + timedelta(days=2), 8, 0),
        'heure_fin_prev':   dt_aware(aujourd_hui + timedelta(days=2), 17, 0),
        'sequence': 1, 'quantite_planifiee': Decimal('180'),
        'shift': 'journee', 'statut': 'confirme',
        'notes': 'Assemblage final boitier B200',
    },
]

plannings_crees = []
for pd in plannings_data:
    if not pd.get('ordre'):
        continue
    try:
        # Creer sans full_clean pour le seed (eviter conflits sur donnees test)
        p = PlanningProduction(planifie_par=user_chef, **pd)
        PlanningProduction.objects.bulk_create([p], ignore_conflicts=True)
        # Recharger depuis DB
        p_saved = PlanningProduction.objects.filter(
            ordre=pd['ordre'],
            date_planifiee=pd['date_planifiee'],
            shift=pd['shift'],
            chaine=pd['chaine'],
        ).first()
        if p_saved:
            plannings_crees.append(p_saved)
            print(f"    OK - {p_saved.date_planifiee} | {p_saved.chaine.code} | {p_saved.ordre.numero} | {p_saved.shift} | {p_saved.statut}")
    except Exception as e:
        # Fallback sans validation
        try:
            p = PlanningProduction.__new__(PlanningProduction)
            for k, v in pd.items():
                setattr(p, k, v)
            p.planifie_par = user_chef
            PlanningProduction.objects.filter(
                ordre=pd['ordre'], date_planifiee=pd['date_planifiee'],
                shift=pd['shift'], chaine=pd['chaine']
            ).delete()
            p.save()
            plannings_crees.append(p)
            print(f"    OK - {p.date_planifiee} | {p.chaine.code} | {p.ordre.numero} | {p.shift} | {p.statut}")
        except Exception as e2:
            print(f"    IGNORE - {pd.get('ordre','?')} {pd.get('date_planifiee','?')} : {e2}")

# RESUME
print("\n" + "="*60)
print("  SEED PLANNING TERMINE")
print("="*60)
print(f"  Plannings          : {PlanningProduction.objects.count()}")
print(f"    - En cours        : {PlanningProduction.objects.filter(statut='en_cours').count()}")
print(f"    - Confirmes       : {PlanningProduction.objects.filter(statut='confirme').count()}")
print(f"    - Termines        : {PlanningProduction.objects.filter(statut='termine').count()}")
print(f"    - Brouillons      : {PlanningProduction.objects.filter(statut='brouillon').count()}")
print(f"  Contraintes machine : {ContrainteMachine.objects.count()}")
print("="*60)
print("\n  URLs disponibles :")
print("  GET  /api/planning/plannings/gantt/")
print("  GET  /api/planning/plannings/semaine/")
print("  GET  /api/planning/plannings/conflits/")
print("  GET  /api/planning/plannings/charge_machine/")
print("  POST /api/planning/plannings/generer_auto/")
print("  GET  /api/planning/contraintes/disponibilite/?machine_id=...&heure_debut=...&heure_fin=...")
print("="*60)