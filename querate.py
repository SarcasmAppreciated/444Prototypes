# async_mode = None

# if async_mode is None:
    # try:
        # import eventlet
        # async_mode = 'eventlet'
    # except ImportError:
        # pass

    # if async_mode is None:
        # try:
            # from gevent import monkey
            # async_mode = 'gevent'
        # except ImportError:
            # pass

    # if async_mode is None:
        # async_mode = 'threading'

    # print('async_mode is ' + async_mode)

# # monkey patching is necessary because this application uses a background
# # thread
# if async_mode == 'eventlet':
    # import eventlet
    # eventlet.monkey_patch()
# elif async_mode == 'gevent':
    # from gevent import monkey
    # monkey.patch_all()


import time
from threading import Thread
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from models import *

app = Flask(__name__, static_url_path='')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
# socketio = SocketIO(app, async_mode=async_mode)
# thread = None

# def background_thread():
    # """Example of how to send server generated events to clients."""
    # count = 0
    # while True:
        # time.sleep(10)
        # count += 1
        # socketio.emit('my response',
                      # {'data': 'Server generated event', 'count': count},
                      # namespace='/test')


@app.route('/')
def root():
    # global thread
    # if thread is None:
        # thread = Thread(target=background_thread)
        # thread.daemon = True
        # thread.start()
    return render_template('index.html') 

def get_static():
    return send_from_directory('')

    
@app.route('/_set_playlist_id')
def set_playlist_id():
    playlistID = request.args.get('playlist')
    # cur.execute("SELECT current_song FROM querate WHERE playlist_id = %(playlist)s", {'playlist' : playlistID})
    # rows = cur.fetchall()
    # if not rows:
    cur.execute("INSERT INTO querate ( playlist_id, current_song) VALUES (%(playlist)s, %(current)s)", {'playlist' : playlistID, 'current' : 0})
    db_conn.commit()
    # else:
        # return jsonify({"result" : "Tuple already exists"})
    
    return jsonify({"result" : "Tuple inserted"})

@app.route('/_set_current_song')
def set_current_song():
    playlistID = request.args.get('playlist')
    currentSong = request.args.get('current')
    cur.execute("UPDATE querate SET current_song = %(current)s WHERE playlist_id = %(playlist)s", {'current' : currentSong, 'playlist' : playlistID})
    db_conn.commit()
    return jsonify({"result" : "Set current song as " + currentSong})    
    
@app.route('/_get_current_song')
def get_current_song():
    playlistID = request.args.get('playlist')
    cur.execute("SELECT current_song FROM querate WHERE playlist_id = %(playlist)s", {'playlist' : playlistID})
    rows = cur.fetchall()
    print rows
    return jsonify({"result" : rows})
    
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
    
    


