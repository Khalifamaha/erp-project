from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategorieViewSet, EmplacementViewSet, ProduitViewSet,
    LotViewSet, MouvementViewSet,
)

router = DefaultRouter()
router.register(r'categories',  CategorieViewSet,   basename='categorie')
router.register(r'emplacements',EmplacementViewSet, basename='emplacement')
router.register(r'produits',    ProduitViewSet,     basename='produit')
router.register(r'lots',        LotViewSet,         basename='lot')
router.register(r'mouvements',  MouvementViewSet,   basename='mouvement')

urlpatterns = [
    path('', include(router.urls)),
]