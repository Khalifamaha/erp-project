# -*- coding: utf-8 -*-
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    login_view, login_employe_view, logout_view, refresh_view,
    change_password_view, me_view,
    UserViewSet, RoleViewSet, NotificationViewSet,
)

router = DefaultRouter()
router.register(r'users',         UserViewSet,         basename='user')
router.register(r'roles',         RoleViewSet,         basename='role')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Auth
    path('auth/login/',           login_view,           name='auth-login'),
    path('auth/login-employe/',   login_employe_view,   name='auth-login-employe'),
    path('auth/logout/',          logout_view,          name='auth-logout'),
    path('auth/refresh/',         refresh_view,         name='auth-refresh'),
    path('auth/change-password/', change_password_view, name='auth-change-password'),
    path('auth/me/',              me_view,              name='auth-me'),

    # CRUD via router
    path('', include(router.urls)),
]