set -e

echo "=== Restaurando base de datos desde backup.sql ==="


pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges -1 /tmp/backup.sql || true

echo "=== Restauración completada ==="
