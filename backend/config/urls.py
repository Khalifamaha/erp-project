from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/',              include('apps.accounts.urls')),
    path('api/hr/',           include('apps.hr.urls')),
    path('api/inventory/',    include('apps.inventory.urls')),
    path('api/procurement/',  include('apps.procurement.urls')),
    path('api/production/',   include('apps.production.urls')),
    path('api/gmo/',          include('apps.gmo.urls')),
    path('api/planning/',     include('apps.planning.urls')),
    path('api/quality/',      include('apps.quality.urls')),
    path('api/comptabilite/', include('apps.comptabilite.urls')),
    path('api/commercial/',   include('apps.commercial.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)