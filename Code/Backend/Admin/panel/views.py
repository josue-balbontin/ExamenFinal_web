from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
import clickhouse_connect
import pymongo
import os

@staff_member_required
def mongo_view(request):
    try:
        user = os.environ.get('MONGO_INITDB_ROOT_USERNAME', 'ugc_user')
        pwd = os.environ.get('MONGO_INITDB_ROOT_PASSWORD', 'ugc_password')
        port = os.environ.get('MONGO_PORT', '27017')
        # Si corremos local apuntamos a localhost, si estamos en docker deberia ser 'mongodb'
        host = 'localhost' if os.environ.get('POSTGRES_HOST') == 'localhost' else 'mongodb'
        
        client = pymongo.MongoClient(f"mongodb://{user}:{pwd}@{host}:{port}/?authSource=admin")
        db = client['ugc_marketplace']
        resenas = list(db.resenas_productos.find())
    except Exception as e:
        resenas = []
        print(f"Mongo Error: {e}")
    
    return render(request, "admin/mongo_view.html", {
        "resenas": resenas, 
        "title": "Visor MongoDB",
        "has_permission": True,
        "site_header": "Marketplace Admin"
    })

@staff_member_required
def clickhouse_view(request):
    try:
        user = os.environ.get('CLICKHOUSE_USER', 'default')
        pwd = os.environ.get('CLICKHOUSE_PASSWORD', '')
        db = os.environ.get('CLICKHOUSE_DB', 'default')
        port = int(os.environ.get('CLICKHOUSE_PORT', '8123'))
        host = 'localhost' if os.environ.get('POSTGRES_HOST') == 'localhost' else 'clickhouse'
        
        client = clickhouse_connect.get_client(host=host, port=port, username=user, password=pwd, database=db)
        result = client.query('SELECT fecha, termino, region FROM busquedas_log ORDER BY fecha DESC LIMIT 100')
        logs = result.result_rows
    except Exception as e:
        logs = []
        print(f"ClickHouse Error: {e}")
        
    return render(request, "admin/clickhouse_view.html", {
        "logs": logs, 
        "title": "Visor ClickHouse",
        "has_permission": True,
        "site_header": "Marketplace Admin"
    })
