from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PanneViewSet,
    InterventionViewSet,
    MaintenancePreventiveViewSet,
    ExecutionMaintenanceViewSet,
)

router = DefaultRouter()
router.register(r'pannes',       PanneViewSet,                basename='panne')
router.register(r'interventions',InterventionViewSet,         basename='intervention')
router.register(r'maintenances', MaintenancePreventiveViewSet,basename='maintenance')
router.register(r'executions',   ExecutionMaintenanceViewSet, basename='execution')

urlpatterns = [
    path('', include(router.urls)),
]