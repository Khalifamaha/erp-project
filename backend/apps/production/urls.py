from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MachineViewSet,
    GammeOperatoireViewSet, OperationViewSet,
    OrdreFabricationViewSet, ConsommationOFViewSet,
    ChaineProductionViewSet, SessionProductionViewSet,
    AffectationEmployeViewSet,
)

router = DefaultRouter()
router.register(r'machines',      MachineViewSet,          basename='machine')
router.register(r'gammes',        GammeOperatoireViewSet,  basename='gamme')
router.register(r'operations',    OperationViewSet,        basename='operation')
router.register(r'ordres',        OrdreFabricationViewSet, basename='of')
router.register(r'consommations', ConsommationOFViewSet,   basename='consommation')
router.register(r'chaines',       ChaineProductionViewSet, basename='chaine')
router.register(r'sessions',      SessionProductionViewSet,basename='session')
router.register(r'affectations',  AffectationEmployeViewSet, basename='affectation')

urlpatterns = [
    path('', include(router.urls)),
]