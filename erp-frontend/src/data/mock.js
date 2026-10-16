// Données de démonstration, calquées sur scripts/seed_commercial.py côté backend.
// À remplacer par les appels à l'API Django (DRF) une fois les endpoints branchés.

export const kpis = {
  caTotal: { valeur: 62450, devise: 'TND', variation: 12.4 },
  commandesEnCours: { valeur: 8, variation: 3.1 },
  camionsDisponibles: { valeur: 2, total: 4 },
  expeditionsEnRoute: { valeur: 1, variation: -1 },
}

export const caEvolution = [
  { mois: 'Fév', ca: 31200 },
  { mois: 'Mar', ca: 38900 },
  { mois: 'Avr', ca: 35400 },
  { mois: 'Mai', ca: 44100 },
  { mois: 'Juin', ca: 52300 },
  { mois: 'Juil', ca: 62450 },
]

export const statutsCommandes = [
  { statut: 'Livrée', valeur: 2, color: '#22c55e' },
  { statut: 'En cours', valeur: 1, color: '#5b5fef' },
  { statut: 'Confirmée', valeur: 1, color: '#06b6d4' },
  { statut: 'Brouillon', valeur: 1, color: '#cbd0dd' },
]

export const commandesRecentes = [
  { numero: 'CC-2024-005', client: 'Delta SARL Nabeul', montant: 12750, devise: 'TND', statut: 'brouillon', date: '27 juil.' },
  { numero: 'CC-2024-004', client: 'Epsilon France SAS', montant: 6180, devise: 'EUR', statut: 'confirmee', date: '24 juil.' },
  { numero: 'CC-2024-003', client: 'Gamma Export Sousse', montant: 5500, devise: 'EUR', statut: 'livree', date: '14 juin' },
  { numero: 'CC-2024-002', client: 'Beta Industries Sfax', montant: 20905, devise: 'TND', statut: 'en_cours', date: '09 juil.' },
  { numero: 'CC-2024-001', client: 'Alpha Corp Tunis', montant: 13775, devise: 'TND', statut: 'livree', date: '29 juin' },
]

export const statutStyle = {
  brouillon: { label: 'Brouillon', module: 'production', tone: 'neutral' },
  confirmee: { label: 'Confirmée', module: 'finance' },
  en_cours: { label: 'En cours', module: 'commercial' },
  livree: { label: 'Livrée', module: 'production', tone: 'success' },
}

export const expeditionsEnCours = [
  {
    numero: 'EXP-2024-003',
    destination: 'Sfax Centre',
    pays: 'Tunisie',
    camion: '200TU5002 · Volvo FH 500',
    chauffeur: 'Trabelsi Hichem',
    statut: 'en_route',
    depart: 'Aujourd\'hui',
    arriveePrev: 'Dans 2 jours',
  },
]

export const camions = [
  { immat: '100TU5001', modele: 'Mercedes Actros 2545', statut: 'disponible', chauffeur: 'Ben Salah Mohamed' },
  { immat: '200TU5002', modele: 'Volvo FH 500', statut: 'en_route', chauffeur: 'Trabelsi Hichem' },
  { immat: '300TU5003', modele: 'MAN TGX 18.500', statut: 'en_route', chauffeur: 'Gharbi Nabil' },
  { immat: '400TU5004', modele: 'DAF XF 480', statut: 'maintenance', chauffeur: 'Sassi Slim' },
]

export const utilisateur = {
  nom: 'Mohamed Direction',
  role: 'Direction Générale',
  initiales: 'MD',
}
