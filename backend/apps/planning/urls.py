from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanningProductionViewSet, ContrainteMachineViewSet

router = DefaultRouter()
router.register(r'plannings',   PlanningProductionViewSet, basename='planning')
router.register(r'contraintes', ContrainteMachineViewSet,  basename='contrainte')

urlpatterns = [
    path('', include(router.urls)),
]