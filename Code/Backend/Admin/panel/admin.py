from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from django.urls import path, reverse
from django.http import HttpResponseRedirect
from django.db import connection
from django.contrib import messages
import pymongo
import os
from datetime import datetime, timezone as tz
from .models import SolicitudVendedor, Producto, Usuario, Role


def _enviar_notificacion(id_usuario, tipo, titulo, mensaje):
    """Inserta una notificación en la colección 'notificaciones' de MongoDB."""
    try:
        user = os.environ.get('MONGO_INITDB_ROOT_USERNAME', 'mongouser')
        pwd = os.environ.get('MONGO_INITDB_ROOT_PASSWORD', 'mongopassword')
        port = os.environ.get('MONGO_PORT', '27017')
        host = 'localhost' if os.environ.get('POSTGRES_HOST') == 'localhost' else 'mongodb'

        client = pymongo.MongoClient(
            f"mongodb://{user}:{pwd}@{host}:{port}/?authSource=admin"
        )
        db = client['ugc_marketplace']
        db.notificaciones.insert_one({
            'id_usuario': id_usuario,
            'tipo': tipo,
            'titulo': titulo,
            'mensaje': mensaje,
            'leida': False,
            'fecha_creacion': datetime.now(tz.utc),
        })
        client.close()
    except Exception as e:
        print(f"Error al enviar notificación a MongoDB: {e}")


@admin.register(SolicitudVendedor)
class SolicitudVendedorAdmin(admin.ModelAdmin):
    list_display = ('id_solicitud', 'get_usuario_nombre', 'get_usuario_email',
                    'fecha_solicitud', 'estado', 'acciones_botones')
    list_filter = ('estado',)
    actions = None  # Deshabilitamos las acciones del dropdown

    def get_usuario_nombre(self, obj):
        return str(obj.id_usuario)
    get_usuario_nombre.short_description = 'Usuario'

    def get_usuario_email(self, obj):
        return obj.id_usuario.email
    get_usuario_email.short_description = 'Email'

    def acciones_botones(self, obj):
        """Muestra botones de Aprobar/Rechazar solo para solicitudes pendientes."""
        if obj.estado == 'pendiente':
            url_aprobar = reverse('admin:panel_solicitudvendedor_aprobar', args=[obj.pk])
            url_rechazar = reverse('admin:panel_solicitudvendedor_rechazar', args=[obj.pk])
            return format_html(
                '<a href="{}" class="button" style="background-color:#28a745;color:white;'
                'padding:4px 12px;border-radius:4px;text-decoration:none;margin-right:6px;">'
                '✓ Aprobar</a>'
                '<a href="{}" class="button" style="background-color:#dc3545;color:white;'
                'padding:4px 12px;border-radius:4px;text-decoration:none;">'
                '✗ Rechazar</a>',
                url_aprobar, url_rechazar,
            )
        elif obj.estado == 'aprobada':
            return format_html('<span style="color:#28a745;font-weight:bold;">✓ Aprobada</span>')
        else:
            return format_html('<span style="color:#dc3545;font-weight:bold;">✗ Rechazada</span>')
    acciones_botones.short_description = 'Acciones'

    def get_urls(self):
        """Registra las URLs personalizadas para aprobar/rechazar."""
        custom_urls = [
            path('<int:solicitud_id>/aprobar/',
                 self.admin_site.admin_view(self.aprobar_view),
                 name='panel_solicitudvendedor_aprobar'),
            path('<int:solicitud_id>/rechazar/',
                 self.admin_site.admin_view(self.rechazar_view),
                 name='panel_solicitudvendedor_rechazar'),
        ]
        return custom_urls + super().get_urls()

    def aprobar_view(self, request, solicitud_id):
        """Aprueba una solicitud y cambia el rol del usuario a Vendedor con SQL directo."""
        try:
            solicitud = SolicitudVendedor.objects.get(pk=solicitud_id)
            if solicitud.estado != 'pendiente':
                messages.warning(request, 'Esta solicitud ya fue procesada.')
                return HttpResponseRedirect(reverse('admin:panel_solicitudvendedor_changelist'))

            now = timezone.now()
            usuario_id = solicitud.id_usuario_id

            # Obtener el id del rol Vendedor
            rol_vendedor = Role.objects.get(nombre='Vendedor')

            # SQL directo para garantizar que ambos cambios se ejecuten
            with connection.cursor() as cursor:
                # 1. Cambiar estado de la solicitud
                cursor.execute(
                    'UPDATE "esquema_marketplace"."solicitudes_vendedor" '
                    'SET estado = %s, fecha_resolucion = %s '
                    'WHERE id_solicitud = %s',
                    ['aprobada', now, solicitud_id]
                )
                # 2. Cambiar rol del usuario a Vendedor
                cursor.execute(
                    'UPDATE "esquema_usuarios"."usuarios" '
                    'SET id_rol = %s '
                    'WHERE id_usuario = %s',
                    [rol_vendedor.id_rol, usuario_id]
                )

            # Notificar al usuario via MongoDB
            _enviar_notificacion(
                id_usuario=usuario_id,
                tipo='solicitud_aprobada',
                titulo='¡Solicitud Aprobada!',
                mensaje='Tu solicitud para ser vendedor ha sido aprobada. '
                        'Ya puedes publicar productos en el catálogo.',
            )

            messages.success(request, f'Solicitud #{solicitud_id} aprobada. '
                             f'El usuario ahora es Vendedor.')

        except Role.DoesNotExist:
            messages.error(request, "No existe el rol 'Vendedor' en la BD.")
        except SolicitudVendedor.DoesNotExist:
            messages.error(request, 'Solicitud no encontrada.')
        except Exception as e:
            messages.error(request, f'Error al aprobar: {e}')

        return HttpResponseRedirect(reverse('admin:panel_solicitudvendedor_changelist'))

    def rechazar_view(self, request, solicitud_id):
        """Rechaza una solicitud sin cambiar el rol del usuario."""
        try:
            solicitud = SolicitudVendedor.objects.get(pk=solicitud_id)
            if solicitud.estado != 'pendiente':
                messages.warning(request, 'Esta solicitud ya fue procesada.')
                return HttpResponseRedirect(reverse('admin:panel_solicitudvendedor_changelist'))

            now = timezone.now()

            with connection.cursor() as cursor:
                cursor.execute(
                    'UPDATE "esquema_marketplace"."solicitudes_vendedor" '
                    'SET estado = %s, fecha_resolucion = %s '
                    'WHERE id_solicitud = %s',
                    ['rechazada', now, solicitud_id]
                )

            # Notificar al usuario via MongoDB
            _enviar_notificacion(
                id_usuario=solicitud.id_usuario_id,
                tipo='solicitud_rechazada',
                titulo='Solicitud Rechazada',
                mensaje='Tu solicitud para ser vendedor ha sido rechazada. '
                        'Contacta a RRHH para más información.',
            )

            messages.success(request, f'Solicitud #{solicitud_id} rechazada.')

        except SolicitudVendedor.DoesNotExist:
            messages.error(request, 'Solicitud no encontrada.')
        except Exception as e:
            messages.error(request, f'Error al rechazar: {e}')

        return HttpResponseRedirect(reverse('admin:panel_solicitudvendedor_changelist'))

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.groups.filter(name='Recursos Humanos').exists() or request.user.is_superuser:
            return qs
        return qs.none()

    def changelist_view(self, request, extra_context=None):
        if not request.GET and not request.META.get('QUERY_STRING'):
            q = request.GET.copy()
            q['estado__exact'] = 'pendiente'
            request.GET = q
            request.META['QUERY_STRING'] = request.GET.urlencode()
        return super().changelist_view(request, extra_context=extra_context)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class StockCriticoFilter(admin.SimpleListFilter):
    title = 'Alerta de Stock'
    parameter_name = 'stock_critico'

    def lookups(self, request, model_admin):
        return (
            ('si', 'Stock menor a 5'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'si':
            return queryset.filter(stock__lt=5)
        return queryset


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id_producto', 'nombre', 'id_vendedor', 'stock', 'precio_base')
    list_filter = (StockCriticoFilter, 'id_categoria')
    search_fields = ('nombre',)

    def get_queryset(self, request):
        # Admin (superuser) y cualquier staff ven todos los productos
        return super().get_queryset(request)
