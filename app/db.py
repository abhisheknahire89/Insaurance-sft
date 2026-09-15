from __future__ import annotations
import sqlite3, json, os
from pathlib import Path
from datetime import datetime, timezone

try:
    import psycopg
    from psycopg.rows import dict_row
except ImportError:
    psycopg = None

SCHEMA_SQLITE = '''
 CREATE TABLE IF NOT EXISTS corrections(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_norm TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  master_product_id TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  UNIQUE(raw_norm,master_product_id)
);
CREATE TABLE IF NOT EXISTS orders(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 created_at TEXT NOT NULL,
 pharmacy_name TEXT,
 status TEXT NOT NULL DEFAULT 'PLACED',
 payload_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS invoices(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 order_id INTEGER,
 created_at TEXT NOT NULL,
 invoice_number TEXT,
 supplier_name TEXT,
 payload_json TEXT NOT NULL,
 reconciliation_json TEXT,
 FOREIGN KEY(order_id) REFERENCES orders(id)
);
'''

SCHEMA_POSTGRES = '''
 CREATE TABLE IF NOT EXISTS corrections(
  id SERIAL PRIMARY KEY,
  raw_norm TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  master_product_id TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  UNIQUE(raw_norm,master_product_id)
);
CREATE TABLE IF NOT EXISTS orders(
 id SERIAL PRIMARY KEY,
 created_at TEXT NOT NULL,
 pharmacy_name TEXT,
 status TEXT NOT NULL DEFAULT 'PLACED',
 payload_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS invoices(
 id SERIAL PRIMARY KEY,
 order_id INTEGER,
 created_at TEXT NOT NULL,
 invoice_number TEXT,
 supplier_name TEXT,
 payload_json TEXT NOT NULL,
 reconciliation_json TEXT,
 FOREIGN KEY(order_id) REFERENCES orders(id)
);
'''

class DB:
    def __init__(self, path:str):
        self.db_url = os.getenv('DATABASE_URL')
        if self.db_url:
            if not psycopg:
                raise ImportError("psycopg not installed but DATABASE_URL is set.")
            self.is_pg = True
            with psycopg.connect(self.db_url) as c:
                with c.cursor() as cur:
                    cur.execute(SCHEMA_POSTGRES)
                c.commit()
        else:
            self.is_pg = False
            self.path = path
            p = Path(path)
            p.parent.mkdir(parents=True, exist_ok=True)
            c = sqlite3.connect(str(p))
            c.executescript(SCHEMA_SQLITE)
            c.close()

    def _conn(self):
        if self.is_pg:
            return psycopg.connect(self.db_url, row_factory=dict_row)
        else:
            c = sqlite3.connect(self.path)
            c.row_factory = sqlite3.Row
            return c

    def correction_for(self, raw_norm:str):
        with self._conn() as conn:
            cur = conn.execute('SELECT master_product_id,count FROM corrections WHERE raw_norm=? ORDER BY count DESC' if not self.is_pg else 'SELECT master_product_id,count FROM corrections WHERE raw_norm=%s ORDER BY count DESC', (raw_norm,))
            rows = cur.fetchall()
            if not rows: return None
            if len(rows)==1 or rows[0]['count']>=2*rows[1]['count']:
                return rows[0]['master_product_id']
            return None

    def save_correction(self, raw_norm:str, raw_text:str, master_product_id:str):
        now = datetime.now(timezone.utc).isoformat()
        with self._conn() as conn:
            if self.is_pg:
                conn.execute('''INSERT INTO corrections(raw_norm,raw_text,master_product_id,count,updated_at) VALUES(%s,%s,%s,%s,%s)
                  ON CONFLICT(raw_norm,master_product_id) DO UPDATE SET count=corrections.count+1,raw_text=EXCLUDED.raw_text,updated_at=EXCLUDED.updated_at''', (raw_norm,raw_text,master_product_id,1,now))
            else:
                conn.execute('''INSERT INTO corrections(raw_norm,raw_text,master_product_id,count,updated_at) VALUES(?,?,?,?,?)
                  ON CONFLICT(raw_norm,master_product_id) DO UPDATE SET count=count+1,raw_text=excluded.raw_text,updated_at=excluded.updated_at''', (raw_norm,raw_text,master_product_id,1,now))
            conn.commit()

    def create_order(self, pharmacy_name:str, payload:dict)->int:
        now = datetime.now(timezone.utc).isoformat()
        with self._conn() as conn:
            if self.is_pg:
                cur = conn.execute('INSERT INTO orders(created_at,pharmacy_name,status,payload_json) VALUES(%s,%s,%s,%s) RETURNING id', (now,pharmacy_name,'PLACED',json.dumps(payload)))
                oid = cur.fetchone()['id']
            else:
                cur = conn.execute('INSERT INTO orders(created_at,pharmacy_name,status,payload_json) VALUES(?,?,?,?)', (now,pharmacy_name,'PLACED',json.dumps(payload)))
                oid = cur.lastrowid
            conn.commit()
            return int(oid)

    def list_orders(self):
        with self._conn() as conn:
            rows = conn.execute('SELECT * FROM orders ORDER BY id DESC').fetchall()
            out = []
            for r in rows:
                d = dict(r)
                d['payload'] = json.loads(d.pop('payload_json'))
                out.append(d)
            return out

    def get_order(self, order_id:int):
        with self._conn() as conn:
            cur = conn.execute('SELECT * FROM orders WHERE id=?' if not self.is_pg else 'SELECT * FROM orders WHERE id=%s', (order_id,))
            r = cur.fetchone()
            if not r: return None
            d = dict(r)
            d['payload'] = json.loads(d.pop('payload_json'))
            return d

    def update_order_status(self, order_id:int, status:str):
        with self._conn() as conn:
            conn.execute('UPDATE orders SET status=? WHERE id=?' if not self.is_pg else 'UPDATE orders SET status=%s WHERE id=%s', (status, order_id))
            conn.commit()

    def save_invoice(self, order_id:int|None, header:dict, payload:dict, reconciliation:dict|None)->int:
        now = datetime.now(timezone.utc).isoformat()
        with self._conn() as conn:
            if self.is_pg:
                cur = conn.execute('INSERT INTO invoices(order_id,created_at,invoice_number,supplier_name,payload_json,reconciliation_json) VALUES(%s,%s,%s,%s,%s,%s) RETURNING id',
                  (order_id, now, header.get('invoice_number'), header.get('supplier_name'), json.dumps(payload), json.dumps(reconciliation) if reconciliation else None))
                iid = cur.fetchone()['id']
            else:
                cur = conn.execute('INSERT INTO invoices(order_id,created_at,invoice_number,supplier_name,payload_json,reconciliation_json) VALUES(?,?,?,?,?,?)',
                  (order_id, now, header.get('invoice_number'), header.get('supplier_name'), json.dumps(payload), json.dumps(reconciliation) if reconciliation else None))
                iid = cur.lastrowid
            conn.commit()
            return int(iid)

_db_instance = None
def get_db(path:str):
    global _db_instance
    if _db_instance is None:
        _db_instance = DB(path)
    return _db_instance

# Adapters to keep existing code functioning
def connect(path:str): return get_db(path)
def correction_for(conn, raw_norm:str): return conn.correction_for(raw_norm)
def save_correction(conn, raw_norm:str, raw_text:str, master_product_id:str): return conn.save_correction(raw_norm, raw_text, master_product_id)
def create_order(conn, pharmacy_name:str, payload:dict)->int: return conn.create_order(pharmacy_name, payload)
def list_orders(conn): return conn.list_orders()
def get_order(conn, order_id:int): return conn.get_order(order_id)
def update_order_status(conn, order_id:int, status:str): return conn.update_order_status(order_id, status)
def save_invoice(conn, order_id:int|None, header:dict, payload:dict, reconciliation:dict|None)->int: return conn.save_invoice(order_id, header, payload, reconciliation)
