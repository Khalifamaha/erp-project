from .machine_view import MachineViewSet
from .gamme_view import GammeOperatoireViewSet, OperationViewSet
from .ordre_fabrication_view import OrdreFabricationViewSet, ConsommationOFViewSet
from .chaine_view import (
    ChaineProductionViewSet, SessionProductionViewSet,
    AffectationEmployeViewSet,
)

__all__ = [
    'MachineViewSet',
    'GammeOperatoireViewSet', 'OperationViewSet',
    'OrdreFabricationViewSet', 'ConsommationOFViewSet',
    'ChaineProductionViewSet', 'SessionProductionViewSet',
    'AffectationEmployeViewSet',
]