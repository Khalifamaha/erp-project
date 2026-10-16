from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExerciceComptableViewSet,
    PlanComptableViewSet,
    EcritureComptableViewSet,
    FactureViewSet,
)

router = DefaultRouter()
router.register(r'exercices',  ExerciceComptableViewSet, basename='exercice')
router.register(r'comptes',    PlanComptableViewSet,     basename='compte')
router.register(r'ecritures',  EcritureComptableViewSet, basename='ecriture')
router.register(r'factures',   FactureViewSet,           basename='facture')

urlpatterns = [
    path('', include(router.urls)),
]