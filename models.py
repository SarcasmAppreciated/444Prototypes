import psycopg2
from flask import Flask, jsonify, request
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint

app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db_conn_create = 'postgresql+psycopg2://querateuser:ih8python@localhost/queratedb'
# db_conn = "host='localhost' dbname='queratedb' user='querateuser' password='ih8python'"  
# app.config['SQLALCHEMY_DATABASE_URI'] = db_conn_create
db = SQLAlchemy(app)

class Querate (db.Model):
    __tablename__ = "querate"
    id = db.Column('id', db.Integer, primary_key=True)
    playlist_id = db.Column('playlist_id', db.Unicode)
    current_song = db.Column('current_song', db.Integer)
    
    __table_args__ = (UniqueConstraint('playlist_id', name='uq_playlist_id'),)
    
db.create_all()    

db_conn = psycopg2.connect(db_conn)
cur = db_conn.cursor()

# cur.execute("SELECT current_song FROM querate WHERE playlist_id = 'PL5qjstFaIeLz8fw0koxtYfEB5nA6-lAh0'")
# rows = cur.fetchall()
# print rows

# cur.execute("INSERT INTO querate ( playlist_id, current_song) VALUES (%s, %s)", ("TESTVAR", 50));
# cur.execute("INSERT INTO querate ( playlist_id, current_song) VALUES (%s, %s)", ("TESTVAR1", 51));
# cur.execute("INSERT INTO querate ( playlist_id, current_song) VALUES (%s, %s)", [request.form['playlist_id'], request.form['current_song']])
# cur.execute("Truncate querate")
# db_conn.commit()