
CREATE DATABASE IF NOT EXISTS analitica_marketplace;

USE analitica_marketplace;

CREATE TABLE IF NOT EXISTS eventos_actividad (
    id_evento UUID,
    fecha_hora DateTime,
    id_usuario Nullable(UInt32), 
    tipo_evento String, 
    valor_evento String, 
    ip_cliente String,
    user_agent String
) ENGINE = MergeTree()
ORDER BY (fecha_hora, tipo_evento);