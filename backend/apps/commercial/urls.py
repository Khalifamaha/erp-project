from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientViewSet,
    CommandeClientViewSet,
    CamionViewSet,
    ExpeditionViewSet,
)

router = DefaultRouter()
router.register(r'clients',     ClientViewSet,        basename='client')
router.register(r'commandes',   CommandeClientViewSet,basename='commande-client')
router.register(r'camions',     CamionViewSet,        basename='camion')
router.register(r'expeditions', ExpeditionViewSet,    basename='expedition')

urlpatterns = [
    path('', include(router.urls)),
]