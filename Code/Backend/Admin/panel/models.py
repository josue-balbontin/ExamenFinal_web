from django.db import models

class Role(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = '"esquema_usuarios"."roles"'

    def __str__(self):
        return self.nombre

class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    id_rol = models.ForeignKey(Role, models.DO_NOTHING, db_column='id_rol')
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.CharField(max_length=150)
    password_hash = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion_principal = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField()
    estado_eliminado = models.BooleanField()

    class Meta:
        managed = False
        db_table = '"esquema_usuarios"."usuarios"'

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

class SolicitudVendedor(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada')
    ]
    
    id_solicitud = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuario, models.DO_NOTHING, db_column='id_usuario', related_name='solicitudes')
    id_rrhh_aprobador = models.ForeignKey(Usuario, models.DO_NOTHING, db_column='id_rrhh_aprobador', related_name='aprobaciones', blank=True, null=True)
    documentacion_url = models.CharField(max_length=255, blank=True, null=True)
    fecha_solicitud = models.DateTimeField()
    fecha_resolucion = models.DateTimeField(blank=True, null=True)
    observaciones_rrhh = models.TextField(blank=True, null=True)
    estado_eliminado = models.BooleanField()
    estado = models.CharField(max_length=50, choices=ESTADO_CHOICES)

    class Meta:
        managed = False
        db_table = '"esquema_marketplace"."solicitudes_vendedor"'

class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = '"esquema_marketplace"."categorias"'

    def __str__(self):
        return self.nombre

class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True)
    id_vendedor = models.ForeignKey(Usuario, models.DO_NOTHING, db_column='id_vendedor')
    id_categoria = models.ForeignKey(Categoria, models.DO_NOTHING, db_column='id_categoria')
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    precio_base = models.FloatField()
    stock = models.IntegerField()
    url_imagen = models.CharField(max_length=255, blank=True, null=True)
    fecha_creacion = models.DateTimeField()
    estado_eliminado = models.BooleanField()

    class Meta:
        managed = False
        db_table = '"esquema_marketplace"."productos"'

    def __str__(self):
        return self.nombre
