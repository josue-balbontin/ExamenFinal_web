import os
import clickhouse_connect

try:
    host = 'localhost'
    port = 8123
    user = 'default'
    pwd = ''
    db = 'default'
    client = clickhouse_connect.get_client(host=host, port=port, username=user, password=pwd, database=db)
    result = client.query('SELECT fecha, termino, region FROM busquedas_log ORDER BY fecha DESC LIMIT 100')
    print("SUCCESS")
    print(result.result_rows)
except Exception as e:
    print(f"ERROR: {e}")
