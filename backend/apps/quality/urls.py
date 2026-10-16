from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CritereQualiteViewSet,
    ControleQualiteViewSet,
    FicheNCViewSet,
    SuiviActionNCViewSet,
)

router = DefaultRouter()
router.register(r'criteres',   CritereQualiteViewSet,  basename='critere')
router.register(r'controles',  ControleQualiteViewSet, basename='controle')
router.register(r'fiches-nc',  FicheNCViewSet,         basename='fiche-nc')
router.register(r'actions-nc', SuiviActionNCViewSet,   basename='action-nc')

urlpatterns = [
    path('', include(router.urls)),
]