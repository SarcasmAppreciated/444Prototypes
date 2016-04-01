from flask import Flask
app = Flask(__name__, static_url_path='')

@app.route('/')
def root():
    return app.send_static_file('index.html') 

def get_static():
    return send_from_directory('')
    


if __name__ == '__main__':
    app.run()