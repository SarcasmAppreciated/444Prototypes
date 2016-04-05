from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from models import *

from flask.ext.heroku import Heroku

app = Flask(__name__, static_url_path='')
app.config['SECRET_KEY'] = 'secret!'
heroku = Heroku(app)

socketio = SocketIO(app)

@app.route('/')
def root():
    return render_template('index.html') 

def get_static():
    return send_from_directory('')

    
@app.route('/_set_playlist_id')
def set_playlist_id():
    playlistID = request.args.get('playlist')
    cur.execute("INSERT INTO querate ( playlist_id, current_song) VALUES (%(playlist)s, %(current)s)", {'playlist' : playlistID, 'current' : 0})
    db_conn.commit()
    
    return jsonify({"result" : "Tuple inserted"})

@app.route('/_set_current_song')
def set_current_song():
    playlistID = request.args.get('playlist')
    currentSong = request.args.get('current')
    cur.execute("UPDATE querate SET current_song = %(current)s WHERE playlist_id = %(playlist)s", {'current' : currentSong, 'playlist' : playlistID})
    db_conn.commit()
    
    return jsonify({"result" : currentSong})    

@app.route('/_get_current_song')
def get_current_song():
    playlistID = request.args.get('playlist')    
    
    result = Querate.query.filter_by(playlist_id=playlistID).first()
    retVal = result.current_song
    
    return jsonify({"result" : retVal})   
    
@socketio.on('my broadcast event', namespace='/test')
def test_message(message):
    emit('my response', {'data': message['data']}, broadcast=True)
    
@socketio.on('connect', namespace='/test')
def test_connect():
    emit('my response', {'data': 'Connected'})

@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, debug=True)
    
    


