# -*- coding: utf-8 -*-
import os
import django
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.gmo.models import Panne, Intervention, MaintenancePreventive, ExecutionMaintenance
from apps.production.models import Machine, ChaineProduction
from apps.accounts.models import User
from django.utils import timezone

print("\n" + "="*60)
print("  SEED GMO - Pannes, Interventions, Maintenance Preventive")
print("="*60)

# 0. Nettoyage
print("\n[0] Nettoyage gmo...")
ExecutionMaintenance.objects.all().delete()
MaintenancePreventive.objects.all().delete()
Intervention.objects.all().delete()
Panne.objects.all().delete()
print("    OK")

try:
    user_tech  = User.objects.get(email='technicien@erp.com')
    user_chef  = User.objects.get(email='chef.production@erp.com')
    user_dir   = User.objects.get(email='direction@erp.com')
    user_op1   = User.objects.get(email='operateur1@erp.com')
except User.DoesNotExist:
    user_tech = user_chef = user_dir = user_op1 = User.objects.filter(is_active=True).first()

try:
    machines = {m.code: m for m in Machine.objects.all()}
    chaines  = {c.code: c for c in ChaineProduction.objects.all()}
    if not machines:
        print("    ATTENTION : Machines non trouvees - lancer seed_production.py d abord")
        import sys; sys.exit(1)
except Exception as e:
    print(f"    ERREUR : {e}")
    import sys; sys.exit(1)

aujourd_hui = date.today()
now         = timezone.now()

# Helper pour creer datetime aware
def dt(d, h=8, m=0):
    import datetime
    return timezone.make_aware(datetime.datetime(d.year, d.month, d.day, h, m))

# 1. PANNES HISTORIQUES (resolues)
print("\n[1] Creation des pannes historiques...")

pannes_data = [
    {
        'machine':      machines['MCH-006'],
        'chaine':       chaines.get('CH-03'),
        'declare_par':  user_op1,
        'date_debut':   dt(aujourd_hui - timedelta(days=3), 9, 15),
        'date_fin':     dt(aujourd_hui - timedelta(days=3), 14, 30),
        'type_panne':   'mecanique',
        'gravite':      'haute',
        'description':  'Courroie trapezoidale cassee - arret complet poste soudure 2',
        'statut':       'resolue',
        'arret_production': True,
        'cout_estime':  Decimal('380.000'),
    },
    {
        'machine':      machines['MCH-003'],
        'chaine':       chaines.get('CH-05'),
        'declare_par':  user_chef,
        'date_debut':   dt(aujourd_hui - timedelta(days=7), 14, 0),
        'date_fin':     dt(aujourd_hui - timedelta(days=7), 16, 45),
        'type_panne':   'electronique',
        'gravite':      'moyenne',
        'description':  'Erreur programme CNC - alarme E402 - tour bloque',
        'statut':       'resolue',
        'arret_production': True,
        'cout_estime':  Decimal('120.000'),
    },
    {
        'machine':      machines['MCH-001'],
        'chaine':       chaines.get('CH-01'),
        'declare_par':  user_op1,
        'date_debut':   dt(aujourd_hui - timedelta(days=14), 11, 30),
        'date_fin':     dt(aujourd_hui - timedelta(days=14), 12, 15),
        'type_panne':   'pneumatique',
        'gravite':      'faible',
        'description':  'Fuite air comprime - verin de positionnement',
        'statut':       'resolue',
        'arret_production': False,
        'cout_estime':  Decimal('45.000'),
    },
    {
        'machine':      machines['MCH-004'],
        'chaine':       None,
        'declare_par':  user_chef,
        'date_debut':   dt(aujourd_hui - timedelta(days=20), 8, 0),
        'date_fin':     dt(aujourd_hui - timedelta(days=19), 10, 0),
        'type_panne':   'mecanique',
        'gravite':      'critique',
        'description':  'Broche fraiseuse - roulement defectueux - vibrations anormales',
        'statut':       'resolue',
        'arret_production': True,
        'cout_estime':  Decimal('1250.000'),
    },
    {
        'machine':      machines['MCH-002'],
        'chaine':       chaines.get('CH-02'),
        'declare_par':  user_op1,
        'date_debut':   dt(aujourd_hui - timedelta(days=45), 10, 0),
        'date_fin':     dt(aujourd_hui - timedelta(days=45), 11, 30),
        'type_panne':   'hydraulique',
        'gravite':      'moyenne',
        'description':  'Fuite huile hydraulique - joint presse',
        'statut':       'resolue',
        'arret_production': True,
        'cout_estime':  Decimal('220.000'),
    },
    {
        'machine':      machines['MCH-007'],
        'chaine':       chaines.get('CH-02'),
        'declare_par':  user_op1,
        'date_debut':   dt(aujourd_hui - timedelta(days=60), 15, 0),
        'date_fin':     dt(aujourd_hui - timedelta(days=60), 15, 45),
        'type_panne':   'electrique',
        'gravite':      'faible',
        'description':  'Capteur de position defectueux - faux contact',
        'statut':       'resolue',
        'arret_production': False,
        'cout_estime':  Decimal('85.000'),
    },
]

pannes = []
for pd in pannes_data:
    cadence = pd['machine'].cadence_horaire
    p = Panne(
        machine=pd['machine'],
        chaine=pd.get('chaine'),
        declare_par=pd['declare_par'],
        date_debut=pd['date_debut'],
        date_fin=pd['date_fin'],
        type_panne=pd['type_panne'],
        gravite=pd['gravite'],
        description=pd['description'],
        statut=pd['statut'],
        arret_production=pd['arret_production'],
        cout_estime=pd['cout_estime'],
        cadence_ref=cadence,
    )
    # Calcul manuel pour eviter le save() qui modifie le statut machine
    if p.date_fin and p.date_debut:
        delta = p.date_fin - p.date_debut
        p.duree_minutes = round(delta.total_seconds() / 60, 2)
        heures = float(p.duree_minutes) / 60
        p.pieces_perdues = round(heures * float(cadence), 2)
    p.save()
    pannes.append(p)
    print(f"    OK - {p.machine.code} | {p.type_panne} | {p.gravite} | {p.duree_minutes} min | {p.pieces_perdues} pcs perdues")

# 2. PANNE ACTIVE (en cours)
print("\n[2] Creation panne active en cours...")

panne_active = Panne(
    machine=machines['MCH-006'],
    chaine=chaines.get('CH-03'),
    declare_par=user_op1,
    date_debut=dt(aujourd_hui, 10, 30),
    type_panne='mecanique',
    gravite='haute',
    description='Nouvelle courroie cassee poste soudure 2 - arret production chaine 3',
    statut='assignee',
    arret_production=True,
    cadence_ref=machines['MCH-006'].cadence_horaire,
    cout_estime=Decimal('400.000'),
)
panne_active.save()
print(f"    OK - PANNE ACTIVE : {panne_active.machine.code} | {panne_active.gravite} | {panne_active.statut}")

# 3. INTERVENTIONS
print("\n[3] Creation des interventions...")

interventions_data = [
    # Sur panne 0 (courroie MCH-006 historique)
    {
        'panne': pannes[0],
        'technicien': user_tech,
        'debut_intervention': dt(aujourd_hui - timedelta(days=3), 9, 30),
        'fin_intervention':   dt(aujourd_hui - timedelta(days=3), 14, 30),
        'actions_effectuees': 'Remplacement courroie trapezoidale A-65. Verification tension courroie et alignement poulie. Test fonctionnel OK.',
        'resultat': 'resolu',
        'pieces_utilisees': 'Courroie A-65 x1 (ref PR-002)',
        'cout_pieces': Decimal('22.000'),
        'cout_main_oeuvre': Decimal('80.000'),
        'resolu': True,
        'observations': 'Courroie usee - prevoir remplacement preventif tous les 3 mois',
    },
    # Sur panne 1 (erreur CNC MCH-003)
    {
        'panne': pannes[1],
        'technicien': user_tech,
        'debut_intervention': dt(aujourd_hui - timedelta(days=7), 14, 15),
        'fin_intervention':   dt(aujourd_hui - timedelta(days=7), 16, 45),
        'actions_effectuees': 'Reset programme CNC. Recalibrage origine piece. Mise a jour parametres usinage. Test cycle complet.',
        'resultat': 'resolu',
        'pieces_utilisees': '',
        'cout_pieces': Decimal('0'),
        'cout_main_oeuvre': Decimal('60.000'),
        'resolu': True,
        'observations': 'Probleme logiciel - fichier programme corrompu. Restauration backup.',
    },
    # Sur panne 2 (fuite pneumatique MCH-001)
    {
        'panne': pannes[2],
        'technicien': user_tech,
        'debut_intervention': dt(aujourd_hui - timedelta(days=14), 11, 40),
        'fin_intervention':   dt(aujourd_hui - timedelta(days=14), 12, 15),
        'actions_effectuees': 'Remplacement joint torique verin position X. Reserrage raccords pneumatiques. Test etancheite OK.',
        'resultat': 'resolu',
        'pieces_utilisees': 'Joint torique 20x3 x2',
        'cout_pieces': Decimal('3.500'),
        'cout_main_oeuvre': Decimal('35.000'),
        'resolu': True,
        'observations': 'Joints pneumatiques a prevoir dans le plan maintenance preventive.',
    },
    # Sur panne 3 (broche MCH-004 - critique)
    {
        'panne': pannes[3],
        'technicien': user_tech,
        'debut_intervention': dt(aujourd_hui - timedelta(days=20), 8, 30),
        'fin_intervention':   dt(aujourd_hui - timedelta(days=19), 10, 0),
        'actions_effectuees': 'Depose broche principale. Remplacement roulement ref 6205-2RS x2. Reequilibrage dynamique broche. Remontage et reglage jeux. Test a vide 2h puis test piece.',
        'resultat': 'resolu',
        'pieces_utilisees': 'Roulement SKF 6205-2RS x2 (ref PR-001)',
        'cout_pieces': Decimal('31.000'),
        'cout_main_oeuvre': Decimal('200.000'),
        'resolu': True,
        'observations': 'Roulement broche a duree de vie estimee 2 ans. Planifier remplacement preventif.',
    },
    # Sur panne active (intervention en cours)
    {
        'panne': panne_active,
        'technicien': user_tech,
        'debut_intervention': dt(aujourd_hui, 10, 45),
        'fin_intervention':   None,
        'actions_effectuees': 'Diagnostic en cours - identification courroie defectueuse',
        'resultat': 'resolu',
        'pieces_utilisees': '',
        'cout_pieces': Decimal('0'),
        'cout_main_oeuvre': Decimal('0'),
        'resolu': False,
        'observations': '',
    },
]

interventions = []
for id_data in interventions_data:
    inter = Intervention.objects.create(**id_data)
    interventions.append(inter)
    statut = 'en cours' if not inter.fin_intervention else f"{inter.duree_intervention_min} min"
    print(f"    OK - {inter.panne.machine.code} | {inter.resultat} | {statut} | cout: {inter.cout_total} DT")

# 4. MAINTENANCE PREVENTIVE
print("\n[4] Creation des plans de maintenance preventive...")

maintenances_data = [
    {
        'machine': machines['MCH-001'],
        'type_maintenance': 'graissage',
        'frequence_jours': 30,
        'derniere_execution': aujourd_hui - timedelta(days=12),
        'prochaine_execution': aujourd_hui + timedelta(days=18),
        'description': 'Graissage guides lineaires et vis a billes laser',
        'duree_prevue_min': Decimal('45'),
        'statut': 'planifiee',
        'active': True,
        'pieces_requises': 'Graisse Kluber Isoflex x100g',
        'cout_estime': Decimal('25.000'),
    },
    {
        'machine': machines['MCH-001'],
        'type_maintenance': 'nettoyage',
        'frequence_jours': 7,
        'derniere_execution': aujourd_hui - timedelta(days=2),
        'prochaine_execution': aujourd_hui + timedelta(days=5),
        'description': 'Nettoyage optique laser et soufflage copeaux',
        'duree_prevue_min': Decimal('30'),
        'statut': 'planifiee',
        'active': True,
        'pieces_requises': 'Lingettes optique x10, air comprime',
        'cout_estime': Decimal('8.000'),
    },
    {
        'machine': machines['MCH-002'],
        'type_maintenance': 'inspection',
        'frequence_jours': 90,
        'derniere_execution': aujourd_hui - timedelta(days=40),
        'prochaine_execution': aujourd_hui + timedelta(days=50),
        'description': 'Inspection generale presse hydraulique - verins, joints, flexible',
        'duree_prevue_min': Decimal('120'),
        'statut': 'planifiee',
        'active': True,
        'pieces_requises': 'Kit joints presse ref JH-002, huile hydraulique 5L',
        'cout_estime': Decimal('150.000'),
    },
    {
        'machine': machines['MCH-003'],
        'type_maintenance': 'calibrage',
        'frequence_jours': 180,
        'derniere_execution': aujourd_hui - timedelta(days=95),
        'prochaine_execution': aujourd_hui + timedelta(days=85),
        'description': 'Etalonnage geometrique tour CNC - mesure conique, cylindricite',
        'duree_prevue_min': Decimal('240'),
        'statut': 'planifiee',
        'active': True,
        'pieces_requises': 'Palpeur de mesure, laser tracker',
        'cout_estime': Decimal('800.000'),
    },
    {
        'machine': machines['MCH-004'],
        'type_maintenance': 'remplacement',
        'frequence_jours': 365,
        'derniere_execution': aujourd_hui - timedelta(days=19),
        'prochaine_execution': aujourd_hui + timedelta(days=346),
        'description': 'Remplacement roulements broche fraiseuse',
        'duree_prevue_min': Decimal('480'),
        'statut': 'planifiee',
        'active': True,
        'pieces_requises': 'Roulement SKF 6205-2RS x2 (ref PR-001)',
        'cout_estime': Decimal('250.000'),
    },
    {
        'machine': machines['MCH-005'],
        'type_maintenance': 'controle',
        'frequence_jours': 90,
        'derniere_execution': aujourd_hui - timedelta(days=10),
        'prochaine_execution': aujourd_hui + timedelta(days=80),
        'description': 'Controle electrique poste soudure MIG - masse, torche, devidoir',
        'duree_prevue_min': Decimal('60'),
        'statut': 'planifiee',
        'active': True,
        'pieces_requises': 'Buse contact x5, diffuseur x2',
        'cout_estime': Decimal('45.000'),
    },
    {
        'machine': machines['MCH-006'],
        'type_maintenance': 'remplacement',
        'frequence_jours': 90,
        'derniere_execution': aujourd_hui - timedelta(days=3),
        'prochaine_execution': aujourd_hui + timedelta(days=87),
        'description': 'Remplacement courroie trapezoidale A-65 poste soudure 2',
        'duree_prevue_min': Decimal('120'),
        'statut': 'planifiee',
        'active': True,
        'pieces_requises': 'Courroie A-65 x2 (ref PR-002)',
        'cout_estime': Decimal('80.000'),
    },
    {
        'machine': machines['MCH-007'],
        'type_maintenance': 'graissage',
        'frequence_jours': 30,
        'derniere_execution': aujourd_hui - timedelta(days=35),
        'prochaine_execution': aujourd_hui - timedelta(days=5),  # EN RETARD
        'description': 'Graissage verin pliage et glissieres',
        'duree_prevue_min': Decimal('30'),
        'statut': 'planifiee',
        'active': True,
        'pieces_requises': 'Graisse Molykote x50g',
        'cout_estime': Decimal('15.000'),
    },
    {
        'machine': machines['MCH-010'],
        'type_maintenance': 'calibrage',
        'frequence_jours': 365,
        'derniere_execution': aujourd_hui - timedelta(days=120),
        'prochaine_execution': aujourd_hui + timedelta(days=245),
        'description': 'Etalonnage annuel CMM - certification ISO 10360',
        'duree_prevue_min': Decimal('480'),
        'statut': 'planifiee',
        'active': True,
        'pieces_requises': 'Certificat etalonnage externe',
        'cout_estime': Decimal('2500.000'),
    },
]

maintenances = []
for md in maintenances_data:
    m = MaintenancePreventive.objects.create(responsable=user_tech, **md)
    maintenances.append(m)
    retard = ' *** EN RETARD ***' if m.est_en_retard else ''
    print(f"    OK - {m.machine.code} | {m.type_maintenance} | tous les {m.frequence_jours}j | Prochain: {m.prochaine_execution}{retard}")

# 5. EXECUTIONS HISTORIQUES
print("\n[5] Creation des executions historiques...")

executions_data = [
    {
        'maintenance': maintenances[0],  # graissage laser
        'technicien': user_tech,
        'date_execution': aujourd_hui - timedelta(days=12),
        'duree_reelle_min': Decimal('50'),
        'observations': 'Graissage effectue - etat guides bon',
        'pieces_remplacees': 'Graisse Kluber 100g',
        'cout_reel': Decimal('28.000'),
    },
    {
        'maintenance': maintenances[1],  # nettoyage laser
        'technicien': user_tech,
        'date_execution': aujourd_hui - timedelta(days=2),
        'duree_reelle_min': Decimal('25'),
        'observations': 'Nettoyage optique - legere contamination poussiere acier',
        'pieces_remplacees': 'Lingettes x8',
        'cout_reel': Decimal('6.000'),
    },
    {
        'maintenance': maintenances[3],  # calibrage tour
        'technicien': user_tech,
        'date_execution': aujourd_hui - timedelta(days=95),
        'duree_reelle_min': Decimal('270'),
        'observations': 'Etalonnage OK - tolerances dans normes ISO',
        'pieces_remplacees': '',
        'cout_reel': Decimal('820.000'),
    },
    {
        'maintenance': maintenances[6],  # courroie MCH-006
        'technicien': user_tech,
        'date_execution': aujourd_hui - timedelta(days=3),
        'duree_reelle_min': Decimal('130'),
        'observations': 'Remplacement courroie apres panne - plan de remplacement preventif mis en place',
        'pieces_remplacees': 'Courroie A-65 x1',
        'cout_reel': Decimal('85.000'),
    },
]

for ed in executions_data:
    e = ExecutionMaintenance.objects.create(**ed)
    print(f"    OK - {e.maintenance.machine.code} | {e.maintenance.type_maintenance} | {e.date_execution} | {e.cout_reel} DT")

# RESUME
print("\n" + "="*60)
print("  SEED GMO TERMINE")
print("="*60)
print(f"  Pannes totales      : {Panne.objects.count()}")
print(f"    - Resolues        : {Panne.objects.filter(statut='resolue').count()}")
print(f"    - Actives         : {Panne.objects.filter(statut__in=['declaree','assignee','en_cours']).count()}")
from django.db.models import Sum, Avg
moy_dur = Panne.objects.filter(statut='resolue').aggregate(m=Avg('duree_minutes'))['m'] or 0
tot_pcs = Panne.objects.aggregate(t=Sum('pieces_perdues'))['t'] or 0
print(f"    - Duree moy       : {round(float(moy_dur), 1)} min")
print(f"    - Pieces perdues  : {float(tot_pcs)} pcs")
print(f"  Interventions       : {Intervention.objects.count()}")
print(f"  Maintenances prev.  : {MaintenancePreventive.objects.count()}")
en_retard = MaintenancePreventive.objects.filter(
    active=True, statut='planifiee',
    prochaine_execution__lt=date.today()
).count()
print(f"    - En retard       : {en_retard}")
print(f"  Executions          : {ExecutionMaintenance.objects.count()}")
print("="*60)