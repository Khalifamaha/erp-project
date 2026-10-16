# -*- coding: utf-8 -*-
import os
import sys
import django
import random
from datetime import date, timedelta, datetime
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import Role, User, UserRole, Notification
from apps.hr.models import Employe, Pointage, Conge, PaiementEmploye
from django.utils import timezone

print("\n" + "="*60)
print("  SEED - Remplissage de la base de donnees ERP")
print("="*60)

# 0. Nettoyage
print("\n[0] Nettoyage...")
Notification.objects.all().delete()
UserRole.objects.all().delete()
PaiementEmploye.objects.all().delete()
Conge.objects.all().delete()
Pointage.objects.all().delete()
Employe.objects.all().delete()
User.objects.filter(is_superuser=False).delete()
Role.objects.all().delete()
print("    OK - Tables videes")

# 1. ROLES
print("\n[1] Creation des roles...")

roles_data = [
    {
        'nom': 'Direction',
        'niveau': 'direction',
        'description': 'Acces complet a tous les modules',
        'permissions': {'hr': ['read','write','delete'], 'production': ['read','write','delete']},
        'systeme': True,
    },
    {
        'nom': 'Chef de Production',
        'niveau': 'chef',
        'description': 'Gestion des ordres de fabrication',
        'permissions': {'production': ['read','write'], 'stock': ['read']},
        'systeme': True,
    },
    {
        'nom': 'Responsable RH',
        'niveau': 'rh',
        'description': 'Gestion des employes et paie',
        'permissions': {'hr': ['read','write','delete']},
        'systeme': True,
    },
    {
        'nom': 'Operateur Chaine',
        'niveau': 'operateur',
        'description': 'Interface simplifiee pour les operateurs',
        'permissions': {'production': ['read','write_limited'], 'pointage': ['write']},
        'systeme': True,
    },
    {
        'nom': 'Technicien Maintenance',
        'niveau': 'technicien',
        'description': 'Declaration et resolution de pannes',
        'permissions': {'gmo': ['read','write'], 'production': ['read']},
        'systeme': False,
    },
    {
        'nom': 'Comptable',
        'niveau': 'comptable',
        'description': 'Acces comptabilite et facturation',
        'permissions': {'comptabilite': ['read','write']},
        'systeme': False,
    },
    {
        'nom': 'Responsable Qualite',
        'niveau': 'chef',
        'description': 'Controle qualite et non-conformites',
        'permissions': {'qualite': ['read','write','delete']},
        'systeme': False,
    },
]

roles = {}
for rd in roles_data:
    role = Role.objects.create(**rd)
    roles[rd['nom']] = role
    print(f"    OK - Role : {role.nom} ({role.niveau})")

# 2. UTILISATEURS
print("\n[2] Creation des utilisateurs...")

users_data = [
    {'email':'direction@erp.com',       'nom':'Mansouri', 'prenom':'Karim',  'telephone':'+216 71 000 001', 'langue':'fr', 'is_staff':True,  'password':'Admin2024!',   'role':'Direction'},
    {'email':'chef.production@erp.com', 'nom':'Trabelsi', 'prenom':'Sami',   'telephone':'+216 71 000 002', 'langue':'fr', 'is_staff':False, 'password':'Chef2024!',    'role':'Chef de Production'},
    {'email':'rh@erp.com',              'nom':'Belhaj',   'prenom':'Nadia',  'telephone':'+216 71 000 003', 'langue':'fr', 'is_staff':False, 'password':'RH2024!',      'role':'Responsable RH'},
    {'email':'operateur1@erp.com',      'nom':'Ben Ali',  'prenom':'Mohamed','telephone':'+216 71 000 004', 'langue':'ar', 'is_staff':False, 'password':'Op2024!',      'role':'Operateur Chaine'},
    {'email':'operateur2@erp.com',      'nom':'Sassi',    'prenom':'Fatma',  'telephone':'+216 71 000 005', 'langue':'fr', 'is_staff':False, 'password':'Op2024!',      'role':'Operateur Chaine'},
    {'email':'technicien@erp.com',      'nom':'Gharbi',   'prenom':'Hichem', 'telephone':'+216 71 000 006', 'langue':'fr', 'is_staff':False, 'password':'Tech2024!',    'role':'Technicien Maintenance'},
    {'email':'comptable@erp.com',       'nom':'Jouini',   'prenom':'Ines',   'telephone':'+216 71 000 007', 'langue':'fr', 'is_staff':False, 'password':'Compta2024!',  'role':'Comptable'},
    {'email':'qualite@erp.com',         'nom':'Chaabane', 'prenom':'Rania',  'telephone':'+216 71 000 008', 'langue':'fr', 'is_staff':False, 'password':'Qual2024!',    'role':'Responsable Qualite'},
]

users = {}
for ud in users_data:
    role_nom = ud.pop('role')
    password = ud.pop('password')
    user = User.objects.create_user(password=password, **ud)
    UserRole.objects.create(utilisateur=user, role=roles[role_nom], actif=True)
    users[user.email] = user
    print(f"    OK - {user.prenom} {user.nom} -> {role_nom} | mdp: {password}")

# 3. EMPLOYES
print("\n[3] Creation des employes...")

employes_data = [
    {'matricule':'EMP001','nom':'Mansouri','prenom':'Karim',  'cin':'09123456','poste':'Directeur General',        'departement':'direction',   'type_contrat':'cdi','statut':'actif','date_embauche':date(2015,3,1), 'salaire_base':Decimal('4500.000'),'num_cnss':'CNSS001','rib_bancaire':'TN5900100001234567890184','niveau_qualification':'Master Management',    'solde_conge':25,'telephone':'+216 71 000 001','telephone_urgence':'+216 71 000 099','contact_urgence':'Epouse Sonia'},
    {'matricule':'EMP002','nom':'Trabelsi','prenom':'Sami',   'cin':'09234567','poste':'Chef de Production',       'departement':'production',  'type_contrat':'cdi','statut':'actif','date_embauche':date(2017,6,15),'salaire_base':Decimal('3200.000'),'num_cnss':'CNSS002','rib_bancaire':'TN5900100001234567890185','niveau_qualification':'Ingenieur Industriel','solde_conge':18,'telephone':'+216 71 000 002','telephone_urgence':'+216 71 000 098','contact_urgence':'Pere Moncef'},
    {'matricule':'EMP003','nom':'Belhaj',  'prenom':'Nadia',  'cin':'09345678','poste':'Responsable RH',           'departement':'rh',          'type_contrat':'cdi','statut':'actif','date_embauche':date(2018,1,10),'salaire_base':Decimal('2800.000'),'num_cnss':'CNSS003','rib_bancaire':'TN5900100001234567890186','niveau_qualification':'Licence GRH',         'solde_conge':22,'telephone':'+216 71 000 003','telephone_urgence':'+216 71 000 097','contact_urgence':'Mari Tarek'},
    {'matricule':'EMP004','nom':'Ben Ali', 'prenom':'Mohamed','cin':'09456789','poste':'Operateur Laser',          'departement':'production',  'type_contrat':'cdi','statut':'actif','date_embauche':date(2019,4,1), 'salaire_base':Decimal('1800.000'),'num_cnss':'CNSS004','rib_bancaire':'TN5900100001234567890187','niveau_qualification':'BTS Electromecanique','solde_conge':15,'telephone':'+216 71 000 004','telephone_urgence':'+216 71 000 096','contact_urgence':'Mere Fatma'},
    {'matricule':'EMP005','nom':'Sassi',   'prenom':'Fatma',  'cin':'09567890','poste':'Operatrice Decoupe',       'departement':'production',  'type_contrat':'cdi','statut':'actif','date_embauche':date(2020,2,15),'salaire_base':Decimal('1750.000'),'num_cnss':'CNSS005','rib_bancaire':'TN5900100001234567890188','niveau_qualification':'CAP Production',      'solde_conge':12,'telephone':'+216 71 000 005','telephone_urgence':'+216 71 000 095','contact_urgence':'Frere Ali'},
    {'matricule':'EMP006','nom':'Gharbi',  'prenom':'Hichem', 'cin':'09678901','poste':'Technicien Maintenance',   'departement':'maintenance', 'type_contrat':'cdi','statut':'actif','date_embauche':date(2018,9,1), 'salaire_base':Decimal('2200.000'),'num_cnss':'CNSS006','rib_bancaire':'TN5900100001234567890189','niveau_qualification':'BTS Maintenance',     'solde_conge':20,'telephone':'+216 71 000 006','telephone_urgence':'+216 71 000 094','contact_urgence':'Femme Sonia'},
    {'matricule':'EMP007','nom':'Jouini',  'prenom':'Ines',   'cin':'09789012','poste':'Comptable',                'departement':'comptabilite','type_contrat':'cdi','statut':'actif','date_embauche':date(2019,11,1),'salaire_base':Decimal('2400.000'),'num_cnss':'CNSS007','rib_bancaire':'TN5900100001234567890190','niveau_qualification':'Licence Comptabilite','solde_conge':16,'telephone':'+216 71 000 007','telephone_urgence':'+216 71 000 093','contact_urgence':'Mari Walid'},
    {'matricule':'EMP008','nom':'Chaabane','prenom':'Rania',  'cin':'09890123','poste':'Responsable Qualite',      'departement':'qualite',     'type_contrat':'cdi','statut':'actif','date_embauche':date(2020,7,1), 'salaire_base':Decimal('2600.000'),'num_cnss':'CNSS008','rib_bancaire':'TN5900100001234567890191','niveau_qualification':'Ingenieure Qualite',  'solde_conge':14,'telephone':'+216 71 000 008','telephone_urgence':'+216 71 000 092','contact_urgence':'Pere Nour'},
    {'matricule':'EMP009','nom':'Hamdi',   'prenom':'Yassine','cin':'09901234','poste':'Operateur Soudure',        'departement':'production',  'type_contrat':'cdi','statut':'actif','date_embauche':date(2021,3,1), 'salaire_base':Decimal('1850.000'),'num_cnss':'CNSS009','rib_bancaire':'TN5900100001234567890192','niveau_qualification':'CAP Soudure',         'solde_conge':10,'telephone':'+216 71 000 009','telephone_urgence':'+216 71 000 091','contact_urgence':'Mere Zohra'},
    {'matricule':'EMP010','nom':'Khelifa', 'prenom':'Asma',   'cin':'09012345','poste':'Assistante Logistique',    'departement':'logistique',  'type_contrat':'cdd','statut':'actif','date_embauche':date(2023,1,15),'salaire_base':Decimal('1600.000'),'num_cnss':'CNSS010','rib_bancaire':'TN5900100001234567890193','niveau_qualification':'BTS Logistique',      'solde_conge':8, 'telephone':'+216 71 000 010','telephone_urgence':'+216 71 000 090','contact_urgence':'Soeur Mariem','date_fin_contrat':date(2024,12,31)},
]

employes = {}
user_list = list(users.values())
for i, ed in enumerate(employes_data):
    if i < len(user_list):
        ed['utilisateur'] = user_list[i]
    emp = Employe.objects.create(**ed)
    employes[emp.matricule] = emp
    print(f"    OK - [{emp.matricule}] {emp.prenom} {emp.nom} - {emp.poste}")

# 4. POINTAGES
print("\n[4] Creation des pointages (7 derniers jours)...")

aujourd_hui = date.today()
user_dir = users['direction@erp.com']

heures_entree = ['07:45', '07:50', '07:55', '08:00', '08:05']
heures_sortie = ['16:30', '17:00', '17:30', '18:00']

for emp_key in ['EMP004', 'EMP005', 'EMP006', 'EMP009']:
    emp = employes[emp_key]
    for j in range(1, 8):
        jour = aujourd_hui - timedelta(days=j)
        if jour.weekday() >= 5:
            continue
        he = random.choice(heures_entree)
        hs = random.choice(heures_sortie)
        h_entree = datetime(jour.year, jour.month, jour.day, int(he.split(':')[0]), int(he.split(':')[1]))
        h_sortie = datetime(jour.year, jour.month, jour.day, int(hs.split(':')[0]), int(hs.split(':')[1]))
        h_entree = timezone.make_aware(h_entree)
        h_sortie = timezone.make_aware(h_sortie)
        statut = 'valide' if j > 2 else 'termine'
        Pointage.objects.create(
            employe=emp,
            date=jour,
            heure_entree=h_entree,
            heure_sortie=h_sortie,
            type='normal',
            statut=statut,
            valide_par=user_dir if statut == 'valide' else None,
        )

# Pointage en cours aujourd'hui
now = timezone.now()
debut = now.replace(hour=8, minute=0, second=0, microsecond=0)
Pointage.objects.create(
    employe=employes['EMP004'],
    date=aujourd_hui,
    heure_entree=debut,
    type='normal',
    statut='en_cours',
)
print(f"    OK - Pointages crees pour EMP004, EMP005, EMP006, EMP009")
print(f"    OK - Pointage en cours cree pour EMP004 aujourd'hui")

# 5. CONGES
print("\n[5] Creation des conges...")

rh_user = users['rh@erp.com']

conges_data = [
    {'employe':employes['EMP005'],'date_debut':aujourd_hui+timedelta(days=5), 'date_fin':aujourd_hui+timedelta(days=12),'type_conge':'annuel',     'statut':'en_attente','motif':'Vacances familiales',        'approuve_par':None,    'commentaire_rh':''},
    {'employe':employes['EMP004'],'date_debut':aujourd_hui-timedelta(days=20),'date_fin':aujourd_hui-timedelta(days=15),'type_conge':'annuel',     'statut':'approuve',  'motif':'Conge annuel',              'approuve_par':rh_user,'commentaire_rh':'Approuve - effectifs suffisants'},
    {'employe':employes['EMP009'],'date_debut':aujourd_hui-timedelta(days=3), 'date_fin':aujourd_hui-timedelta(days=1), 'type_conge':'maladie',    'statut':'approuve',  'motif':'Grippe',                    'approuve_par':rh_user,'commentaire_rh':'Certificat medical recu'},
    {'employe':employes['EMP007'],'date_debut':aujourd_hui+timedelta(days=30),'date_fin':aujourd_hui+timedelta(days=60),'type_conge':'maternite',  'statut':'approuve',  'motif':'Conge maternite',           'approuve_par':rh_user,'commentaire_rh':'Approuve - droit legal'},
    {'employe':employes['EMP006'],'date_debut':aujourd_hui+timedelta(days=2), 'date_fin':aujourd_hui+timedelta(days=2), 'type_conge':'exceptionnel','statut':'refuse',   'motif':'Affaire personnelle',       'approuve_par':rh_user,'commentaire_rh':'Refuse - charge importante'},
]

for cd in conges_data:
    delta = cd['date_fin'] - cd['date_debut']
    cd['nombre_jours'] = delta.days + 1
    conge = Conge.objects.create(**cd)
    print(f"    OK - Conge : {conge.employe.prenom} {conge.employe.nom} - {conge.type_conge} ({conge.statut})")

# 6. PAIEMENTS
print("\n[6] Creation des bulletins de paie...")

from dateutil.relativedelta import relativedelta
m_debut = (aujourd_hui.replace(day=1) - relativedelta(months=1))
m_fin   = aujourd_hui.replace(day=1) - timedelta(days=1)

for emp in employes.values():
    primes     = Decimal(str(random.choice([0, 100, 150, 200]))) if emp.departement == 'production' else Decimal('0')
    heures_sup = Decimal(str(random.choice([0, 0, 50, 100])))
    p = PaiementEmploye.objects.create(
        employe=emp,
        periode_debut=m_debut,
        periode_fin=m_fin,
        salaire_base=emp.salaire_base,
        heures_sup_montant=heures_sup,
        primes=primes,
        deductions=Decimal('0'),
        statut='paye',
        date_paiement=m_fin,
        mode_paiement='virement',
        reference_virement=f'VIR{m_debut.strftime("%Y%m")}{emp.matricule}',
    )
    print(f"    OK - {emp.nom_complet} - Net: {p.net_paye} DT")

# 7. NOTIFICATIONS
print("\n[7] Creation des notifications...")

notifs = [
    {'destinataire':users['direction@erp.com'],       'type':'INFO',          'titre':'Systeme ERP initialise',      'message':'Le systeme ERP a ete initialise avec succes.',                               'priorite':'normale','module_source':'core','lue':True,  'data':{}},
    {'destinataire':users['rh@erp.com'],              'type':'CONGE_DEMANDE', 'titre':'Nouvelle demande de conge',   'message':'Sassi Fatma a soumis une demande de conge annuel.',                         'priorite':'normale','module_source':'hr',  'lue':False, 'data':{'matricule':'EMP005'}},
    {'destinataire':users['direction@erp.com'],       'type':'PAIEMENT',      'titre':'Bulletins de paie generes',   'message':f'Les bulletins de {m_debut.strftime("%B %Y")} ont ete generes.',             'priorite':'haute',  'module_source':'hr',  'lue':False, 'data':{'nombre':10}},
    {'destinataire':users['chef.production@erp.com'], 'type':'INFO',          'titre':'Pointage en cours EMP004',    'message':'Mohamed Ben Ali a pointe son entree a 08h00.',                               'priorite':'basse',  'module_source':'hr',  'lue':False, 'data':{}},
]

for nd in notifs:
    Notification.objects.create(**nd)
    print(f"    OK - [{nd['type']}] {nd['titre']}")

# RESUME
print("\n" + "="*60)
print("  SEED TERMINE")
print("="*60)
print(f"  Roles         : {Role.objects.count()}")
print(f"  Utilisateurs  : {User.objects.count()}")
print(f"  Employes      : {Employe.objects.count()}")
print(f"  Pointages     : {Pointage.objects.count()}")
print(f"  Conges        : {Conge.objects.count()}")
print(f"  Bulletins paie: {PaiementEmploye.objects.count()}")
print(f"  Notifications : {Notification.objects.count()}")
print("\n  Comptes de test (email) :")
print("  direction@erp.com        -> Admin2024!")
print("  chef.production@erp.com  -> Chef2024!")
print("  rh@erp.com               -> RH2024!")
print("  operateur1@erp.com       -> Op2024!")
print("  technicien@erp.com       -> Tech2024!")
print("  comptable@erp.com        -> Compta2024!")
print("\n  Connexion employe (matricule + meme mot de passe) :")
print("  EMP004 -> Op2024!   (operateur Mohamed Ben Ali)")
print("  EMP006 -> Tech2024! (technicien Hichem Gharbi)")
print("="*60)