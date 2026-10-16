# -*- coding: utf-8 -*-
# Ce fichier est CRITIQUE — il expose tous les modèles depuis le dossier models/
# Django cherche les modèles via accounts.models.X → doit tout importer ici

from .role import Role
from .user import User, UserManager, UserRole, Notification, HistoriqueStatut, DocumentJoint

__all__ = [
    'Role',
    'User',
    'UserManager',
    'UserRole',
    'Notification',
    'HistoriqueStatut',
    'DocumentJoint',
]