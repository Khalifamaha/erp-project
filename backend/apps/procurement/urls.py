from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FournisseurViewSet, CommandeAchatViewSet,
    ReceptionViewSet, FactureAchatViewSet,
)

router = DefaultRouter()
router.register(r'fournisseurs', FournisseurViewSet,    basename='fournisseur')
router.register(r'commandes',    CommandeAchatViewSet,  basename='commande-achat')
router.register(r'receptions',   ReceptionViewSet,      basename='reception')
router.register(r'factures',     FactureAchatViewSet,   basename='facture-achat')

urlpatterns = [
    path('', include(router.urls)),
]