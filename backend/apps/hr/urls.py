# -*- coding: utf-8 -*-
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeViewSet, HabilitationViewSet,
    PointageViewSet, CongeViewSet, PaiementViewSet,
)

router = DefaultRouter()
router.register(r'employes',      EmployeViewSet,      basename='employe')
router.register(r'habilitations', HabilitationViewSet, basename='habilitation')
router.register(r'pointages',     PointageViewSet,     basename='pointage')
router.register(r'conges',        CongeViewSet,        basename='conge')
router.register(r'paiements',     PaiementViewSet,     basename='paiement')

urlpatterns = [
    path('', include(router.urls)),
]