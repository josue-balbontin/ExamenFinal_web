from django.contrib import admin
from django.utils import timezone
from .models import SolicitudVendedor, Producto, Usuario, Role

@admin.register(SolicitudVendedor)
class SolicitudVendedorAdmin(admin.ModelAdmin):
    list_display = ('id_solicitud', 'id_usuario', 'fecha_solicitud', 'estado')
    list_filter = ('estado',)
    actions = ['aprobar_solicitudes', 'rechazar_solicitudes']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.groups.filter(name='Recursos Humanos').exists() or request.user.is_superuser:
            return qs
        return qs.none()

    @admin.action(description='Aprobar solicitudes seleccionadas')
    def aprobar_solicitudes(self, request, queryset):
        try:
            rol_vendedor = Role.objects.get(nombre='Vendedor')
        except Role.DoesNotExist:
            self.message_user(request, "No existe el rol 'Vendedor' en la BD.", level='ERROR')
            return

        count = 0
        for solicitud in queryset.filter(estado='Pendiente'):
            solicitud.estado = 'Aprobada'
            solicitud.fecha_resolucion = timezone.now()
            solicitud.save()

            usuario = solicitud.id_usuario
            usuario.id_rol = rol_vendedor
            usuario.save()
            count += 1

        self.message_user(request, f"{count} solicitudes aprobadas exitosamente.")

    @admin.action(description='Rechazar solicitudes seleccionadas')
    def rechazar_solicitudes(self, request, queryset):
        count = 0
        for solicitud in queryset.filter(estado='Pendiente'):
            solicitud.estado = 'Rechazada'
            solicitud.fecha_resolucion = timezone.now()
            solicitud.save()
            count += 1
        self.message_user(request, f"{count} solicitudes rechazadas.")

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
        qs = super().get_queryset(request)
        if request.user.groups.filter(name='Control de Stock').exists() or request.user.is_superuser:
            return qs
        return qs.none()
