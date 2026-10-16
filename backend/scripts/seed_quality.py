# -*- coding: utf-8 -*-
import os
import django
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.quality.models import CritereQualite, ControleQualite, FicheNC, SuiviActionNC
from apps.inventory.models import Produit, Lot
from apps.production.models import OrdreFabrication
from apps.accounts.models import User
from django.utils import timezone

print("\n" + "="*60)
print("  SEED QUALITY - Criteres, Controles, Fiches NC")
print("="*60)

# 0. Nettoyage
print("\n[0] Nettoyage quality...")
SuiviActionNC.objects.all().delete()
FicheNC.objects.all().delete()
ControleQualite.objects.all().delete()
CritereQualite.objects.all().delete()
print("    OK")

try:
    user_qual  = User.objects.get(email='qualite@erp.com')
    user_chef  = User.objects.get(email='chef.production@erp.com')
    user_dir   = User.objects.get(email='direction@erp.com')
except User.DoesNotExist:
    user_qual = user_chef = user_dir = User.objects.filter(is_active=True).first()

try:
    pf001 = Produit.objects.get(reference='PF-001')
    pf002 = Produit.objects.get(reference='PF-002')
    pf003 = Produit.objects.get(reference='PF-003')
except Produit.DoesNotExist:
    print("    ATTENTION : Produits non trouves - lancer seed_inventory.py d abord")
    import sys; sys.exit(1)

try:
    ordres = {of.numero: of for of in OrdreFabrication.objects.all()}
    if not ordres:
        print("    ATTENTION : OF non trouves - lancer seed_production.py d abord")
        import sys; sys.exit(1)
except Exception as e:
    print(f"    ERREUR : {e}")
    import sys; sys.exit(1)

aujourd_hui = date.today()

# 1. CRITERES QUALITE
print("\n[1] Creation des criteres qualite...")

criteres_data = [
    # Chassis PF-001
    {'produit':pf001,'nom':'Cote longueur chassis','type_mesure':'dimensionnel','valeur_min':Decimal('499.5'),'valeur_max':Decimal('500.5'),'valeur_cible':Decimal('500.0'),'unite':'mm','critique':True, 'methode_controle':'Pied a coulisse 0.01mm - mesure sur 3 points','frequence':'1 piece / lot'},
    {'produit':pf001,'nom':'Cote largeur chassis', 'type_mesure':'dimensionnel','valeur_min':Decimal('299.5'),'valeur_max':Decimal('300.5'),'valeur_cible':Decimal('300.0'),'unite':'mm','critique':True, 'methode_controle':'Pied a coulisse 0.01mm','frequence':'1 piece / lot'},
    {'produit':pf001,'nom':'Epaisseur tole',        'type_mesure':'dimensionnel','valeur_min':Decimal('1.9'),  'valeur_max':Decimal('2.1'),  'valeur_cible':Decimal('2.0'),  'unite':'mm','critique':False,'methode_controle':'Micrometre 0.001mm','frequence':'5% par lot'},
    {'produit':pf001,'nom':'Aspect soudure',        'type_mesure':'visuel',     'valeur_min':None,           'valeur_max':None,            'valeur_cible':None,            'unite':'',  'critique':True, 'methode_controle':'Controle visuel - cordon continu sans porosite','frequence':'100%'},
    {'produit':pf001,'nom':'Masse chassis',         'type_mesure':'masse',      'valeur_min':Decimal('11.8'), 'valeur_max':Decimal('13.2'), 'valeur_cible':Decimal('12.5'), 'unite':'kg','critique':False,'methode_controle':'Balance industrielle 0.1kg','frequence':'1 piece / lot'},

    # Boitier PF-002
    {'produit':pf002,'nom':'Cote hauteur boitier',  'type_mesure':'dimensionnel','valeur_min':Decimal('149.3'),'valeur_max':Decimal('150.7'),'valeur_cible':Decimal('150.0'),'unite':'mm','critique':True, 'methode_controle':'Calibre colonne','frequence':'1/10 pieces'},
    {'produit':pf002,'nom':'Epaisseur paroi',        'type_mesure':'dimensionnel','valeur_min':Decimal('2.8'),  'valeur_max':Decimal('3.2'),  'valeur_cible':Decimal('3.0'),  'unite':'mm','critique':True, 'methode_controle':'Micrometre','frequence':'1/20 pieces'},
    {'produit':pf002,'nom':'Test fermeture couvercle','type_mesure':'fonctionnel','valeur_min':None,           'valeur_max':None,            'valeur_cible':None,            'unite':'',  'critique':True, 'methode_controle':'Fermeture manuelle - doit clipper sans force excessive','frequence':'100%'},
    {'produit':pf002,'nom':'Aspect visuel surface',  'type_mesure':'visuel',     'valeur_min':None,           'valeur_max':None,            'valeur_cible':None,            'unite':'',  'critique':False,'methode_controle':'Eclairage 1000 lux - aucune rayure visible','frequence':'100%'},

    # Support fixation PF-003
    {'produit':pf003,'nom':'Angle pliage',           'type_mesure':'dimensionnel','valeur_min':Decimal('89.0'), 'valeur_max':Decimal('91.0'), 'valeur_cible':Decimal('90.0'), 'unite':'deg','critique':True, 'methode_controle':'Rapporteur digital','frequence':'1/10 pieces'},
    {'produit':pf003,'nom':'Longueur aile',          'type_mesure':'dimensionnel','valeur_min':Decimal('49.5'), 'valeur_max':Decimal('50.5'), 'valeur_cible':Decimal('50.0'), 'unite':'mm','critique':False,'methode_controle':'Pied a coulisse','frequence':'1/20 pieces'},
    {'produit':pf003,'nom':'Masse support',          'type_mesure':'masse',      'valeur_min':Decimal('0.30'), 'valeur_max':Decimal('0.35'), 'valeur_cible':Decimal('0.32'), 'unite':'kg','critique':False,'methode_controle':'Balance 0.001kg','frequence':'1/50 pieces'},
]

criteres = []
for cd in criteres_data:
    c = CritereQualite.objects.create(actif=True, **cd)
    criteres.append(c)
    crit_label = ' [CRITIQUE]' if c.critique else ''
    print(f"    OK - {c.produit.reference} | {c.nom}{crit_label}")

# 2. CONTROLES QUALITE
print("\n[2] Creation des controles qualite...")

of004 = ordres.get('OF-2024-004')
of005 = ordres.get('OF-2024-005')
of001 = ordres.get('OF-2024-001')
of002 = ordres.get('OF-2024-002')
of003 = ordres.get('OF-2024-003')

try:
    lot_pf001 = Lot.objects.filter(produit=pf001).first()
    lot_pf002 = Lot.objects.filter(produit=pf002).first()
except Exception:
    lot_pf001 = lot_pf002 = None

controles_data = [
    # Controles OF termines (conformes)
    {'ordre':of001,'critere':criteres[0],'lot':lot_pf001,'valeur_mesuree':Decimal('500.1'),'quantite_controlee':Decimal('5'),'quantite_rebut':Decimal('0'),'observations':'Mesures OK - dans tolerance'},
    {'ordre':of001,'critere':criteres[1],'lot':lot_pf001,'valeur_mesuree':Decimal('300.0'),'quantite_controlee':Decimal('5'),'quantite_rebut':Decimal('0'),'observations':'Conformes'},
    {'ordre':of001,'critere':criteres[3],'lot':lot_pf001,'valeur_mesuree':None,            'quantite_controlee':Decimal('50'),'quantite_rebut':Decimal('2'),'observations':'2 pieces avec micro-porosite soudure - rebutees'},
    {'ordre':of002,'critere':criteres[5],'lot':lot_pf002,'valeur_mesuree':Decimal('149.8'),'quantite_controlee':Decimal('20'),'quantite_rebut':Decimal('0'),'observations':'Conformes - cotes OK'},
    {'ordre':of002,'critere':criteres[7],'lot':lot_pf002,'valeur_mesuree':None,            'quantite_controlee':Decimal('200'),'quantite_rebut':Decimal('5'),'observations':'5 boitiers refus - couvercle dur a fermer'},

    # Controles OF en cours
    {'ordre':of004,'critere':criteres[0],'lot':lot_pf001,'valeur_mesuree':Decimal('501.2'),'quantite_controlee':Decimal('5'),'quantite_rebut':Decimal('5'),'observations':'HORS TOLERANCE - longueur +1.2mm - NC critique ouverte','action_corrective':'Reglage origine laser en cours'},
    {'ordre':of004,'critere':criteres[3],'lot':lot_pf001,'valeur_mesuree':None,            'quantite_controlee':Decimal('45'),'quantite_rebut':Decimal('0'),'observations':'Soudure conforme shift matin'},
    {'ordre':of005,'critere':criteres[5],'lot':lot_pf002,'valeur_mesuree':Decimal('150.2'),'quantite_controlee':Decimal('10'),'quantite_rebut':Decimal('0'),'observations':'Conformes'},
    {'ordre':of005,'critere':criteres[7],'lot':lot_pf002,'valeur_mesuree':None,            'quantite_controlee':Decimal('120'),'quantite_rebut':Decimal('3'),'observations':'3 pieces rebutees - clips casses'},
]

controles = []
for cd in controles_data:
    action_cor = cd.pop('action_corrective', '')
    qte_conforme = float(cd['quantite_controlee']) - float(cd['quantite_rebut'])
    # Creer directement sans passer par save() pour eviter creation NC auto sur seed
    ctrl = ControleQualite(
        employe=user_qual,
        quantite_conforme=max(0, qte_conforme),
        action_corrective=action_cor,
        **cd
    )
    # Determiner resultat manuellement
    if cd['valeur_mesuree'] is not None and cd['critere']:
        ctrl.resultat = 'conforme' if cd['critere'].est_dans_tolerance(cd['valeur_mesuree']) else 'non_conforme'
    elif float(cd['quantite_rebut']) > 0:
        ctrl.resultat = 'non_conforme'
    else:
        ctrl.resultat = 'conforme'
    # Sauvegarder sans full validation pour le seed
    ControleQualite.objects.bulk_create([ctrl])
    ctrl_saved = ControleQualite.objects.filter(
        ordre=cd['ordre'], critere=cd['critere']
    ).last()
    if ctrl_saved:
        controles.append(ctrl_saved)
    print(f"    OK - {cd['ordre'].numero} | {cd['critere'].nom} | {ctrl.resultat} | rebut: {cd['quantite_rebut']}")

# 3. FICHES NC
print("\n[3] Creation des fiches NC...")

fiches_data = [
    {
        'produit': pf001,
        'lot': lot_pf001,
        'numero_nc': 'NC-2024-001',
        'gravite': 'haute',
        'type_nc': 'produit',
        'description_defaut': 'Longueur chassis hors tolerance - valeur mesuree 501.2mm pour tolerance 499.5-500.5mm. 5 pieces non conformes.',
        'cause_racine': 'Derive origine laser apres 3h de production - dilatation thermique non compensee',
        'action_immediate': 'Mise en quarantaine des 5 pieces NC. Arret production chassis jusqu a reglage.',
        'action_corrective': 'Recalibrage origine laser toutes les 2h. Procedure de controle intermediate mise en place.',
        'action_preventive': 'Capteur temperature ajout pour compensation automatique derive thermique.',
        'statut': 'en_cours',
        'lot_bloque': True,
        'delai_resolution': aujourd_hui + timedelta(days=3),
        'ouverte_par': user_qual,
        'responsable': user_chef,
    },
    {
        'produit': pf001,
        'lot': lot_pf001,
        'numero_nc': 'NC-2024-002',
        'gravite': 'moyenne',
        'type_nc': 'produit',
        'description_defaut': 'Micro-porosite soudure sur 2 chassis OF-2024-001 - controle visuel shift apres-midi',
        'cause_racine': 'Humidite electrodes soudure - stockage non conforme',
        'action_immediate': 'Rebus des 2 pieces. Remplacement electrodes.',
        'action_corrective': 'Procedure stockage electrodes revisee - boite hermetique obligatoire',
        'action_preventive': 'Controle visuel electrodes avant chaque shift. Formation operateurs.',
        'statut': 'cloturee',
        'lot_bloque': False,
        'delai_resolution': aujourd_hui - timedelta(days=15),
        'date_cloture': aujourd_hui - timedelta(days=10),
        'ouverte_par': user_qual,
        'responsable': user_chef,
        'cloturee_par': user_dir,
    },
    {
        'produit': pf002,
        'lot': lot_pf002,
        'numero_nc': 'NC-2024-003',
        'gravite': 'moyenne',
        'type_nc': 'produit',
        'description_defaut': '5 boitiers B200 avec couvercle difficile a fermer - force de clippage excessive',
        'cause_racine': 'Variation epaisseur paroi +0.3mm sur lot production - reglage moule derive',
        'action_immediate': 'Tri 100% du lot - mise en quarantaine boitiers hors tolerance',
        'action_corrective': '',
        'action_preventive': '',
        'statut': 'ouverte',
        'lot_bloque': True,
        'delai_resolution': aujourd_hui + timedelta(days=7),
        'ouverte_par': user_qual,
        'responsable': user_qual,
    },
]

fiches = []
for fd in fiches_data:
    f = FicheNC.objects.create(**fd)
    fiches.append(f)
    print(f"    OK - {f.numero_nc} | {f.produit.reference} | {f.gravite} | {f.statut}")

# 4. ACTIONS SUR FICHES NC
print("\n[4] Creation des actions suivi NC...")

actions_data = [
    # Actions sur NC-2024-001 (en cours)
    {'fiche_nc':fiches[0],'type_action':'immediate',  'description':'Mise en quarantaine 5 pieces chassis hors tolerance',   'responsable':user_qual, 'date_prevue':aujourd_hui-timedelta(days=1),'date_realisation':aujourd_hui-timedelta(days=1),'statut':'realisee', 'resultat':'5 pieces mises en zone quarantaine ref lot LOT-PF-001'},
    {'fiche_nc':fiches[0],'type_action':'corrective',  'description':'Recalibrage origine laser et procedure controle 2h',    'responsable':user_chef, 'date_prevue':aujourd_hui,                  'date_realisation':None,                         'statut':'en_cours', 'resultat':''},
    {'fiche_nc':fiches[0],'type_action':'preventive',  'description':'Installation capteur temperature compensation derive',   'responsable':user_chef, 'date_prevue':aujourd_hui+timedelta(days=3),'date_realisation':None,                         'statut':'planifiee','resultat':''},
    # Actions sur NC-2024-002 (cloturee)
    {'fiche_nc':fiches[1],'type_action':'immediate',  'description':'Remplacement electrodes soudure - lot incrimine rebute', 'responsable':user_qual, 'date_prevue':aujourd_hui-timedelta(days=20),'date_realisation':aujourd_hui-timedelta(days=20),'statut':'verifiee','resultat':'Electrodes remplacees - production reprise OK'},
    {'fiche_nc':fiches[1],'type_action':'corrective',  'description':'Revision procedure stockage electrodes soudure',         'responsable':user_chef, 'date_prevue':aujourd_hui-timedelta(days=18),'date_realisation':aujourd_hui-timedelta(days=16),'statut':'verifiee','resultat':'Procedure STD-SOUD-001 mise a jour et validee'},
    # Actions sur NC-2024-003 (ouverte)
    {'fiche_nc':fiches[2],'type_action':'immediate',  'description':'Tri 100% lot boitiers - separation conformes / NC',      'responsable':user_qual, 'date_prevue':aujourd_hui,                  'date_realisation':None,                         'statut':'en_cours', 'resultat':''},
]

for ad in actions_data:
    a = SuiviActionNC.objects.create(**ad)
    print(f"    OK - {a.fiche_nc.numero_nc} | {a.type_action} | {a.statut}")

# RESUME
print("\n" + "="*60)
print("  SEED QUALITY TERMINE")
print("="*60)
print(f"  Criteres qualite  : {CritereQualite.objects.count()}")
print(f"    - Critiques     : {CritereQualite.objects.filter(critique=True).count()}")
print(f"  Controles         : {ControleQualite.objects.count()}")
print(f"    - Conformes     : {ControleQualite.objects.filter(resultat='conforme').count()}")
print(f"    - Non conformes : {ControleQualite.objects.filter(resultat='non_conforme').count()}")
print(f"  Fiches NC         : {FicheNC.objects.count()}")
print(f"    - Ouvertes      : {FicheNC.objects.filter(statut__in=['ouverte','en_cours']).count()}")
print(f"    - Lots bloques  : {FicheNC.objects.filter(lot_bloque=True).count()}")
print(f"  Actions NC        : {SuiviActionNC.objects.count()}")
print("="*60)