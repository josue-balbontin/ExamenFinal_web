from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from panel.models import Usuario


class CustomUsuarioBackend(BaseBackend):
    """
    Backend de autenticación que valida credenciales contra la tabla
    esquema_usuarios.usuarios y su password_hash (formato pbkdf2_sha256).
    Solo permite acceso al panel a usuarios con rol Admin o RRHH.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            usuario = Usuario.objects.get(email=username)

            if not check_password(password, usuario.password_hash):
                return None

            # Crear o recuperar el usuario espejo en auth_user
            user, created = User.objects.get_or_create(
                username=usuario.email,
                defaults={'email': usuario.email,
                          'first_name': usuario.nombre,
                          'last_name': usuario.apellido},
            )

            if not created:
                # Sincronizar datos por si cambiaron
                user.email = usuario.email
                user.first_name = usuario.nombre
                user.last_name = usuario.apellido

            rol_nombre = usuario.id_rol.nombre if usuario.id_rol else ''

            if rol_nombre == 'Admin':
                # Acceso total, igual que el superusuario de Django
                user.is_staff = True
                user.is_superuser = True
                user.save()
                return user

            if rol_nombre == 'RRHH':
                user.is_staff = True
                user.is_superuser = False
                user.save()
                # Asignar al grupo Recursos Humanos con permisos sobre los modelos del panel
                group, _ = Group.objects.get_or_create(name='Recursos Humanos')
                self._assign_panel_permissions(group)
                user.groups.add(group)
                return user

            # Cualquier otro rol (Vendedor, Cliente) no tiene acceso al panel
            return None

        except Usuario.DoesNotExist:
            return None
        except Exception as e:
            print(f"Authentication error: {e}")
            return None

    @staticmethod
    def _assign_panel_permissions(group):
        """
        Crea (si no existen) y asigna los permisos CRUD sobre
        SolicitudVendedor y Producto al grupo.
        Los modelos son managed=False, así que Django no genera
        automáticamente sus Permission; los creamos aquí.
        """
        from panel.models import SolicitudVendedor, Producto

        for model in [SolicitudVendedor, Producto]:
            ct = ContentType.objects.get_for_model(model)
            model_name = model.__name__.lower()
            for action in ['add', 'change', 'delete', 'view']:
                codename = f'{action}_{model_name}'
                perm, _ = Permission.objects.get_or_create(
                    codename=codename,
                    content_type=ct,
                    defaults={'name': f'Can {action} {model_name}'},
                )
                group.permissions.add(perm)

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
