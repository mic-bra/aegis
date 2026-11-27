import json
import os
import urllib.request
import urllib.parse
from flask import Flask, render_template, send_from_directory, jsonify

CACHE_STAZIONI = 'cache_stazioni.json'

app = Flask(__name__)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/conferma')
def conferma():
    return render_template('conferma.html')

@app.route('/offline')
def offline():
    return render_template('offline.html')

@app.route('/manifest.json')
def manifest():
    return send_from_directory('.', 'manifest.json')

@app.route('/sw.js')
def service_worker():
    return send_from_directory('.', 'sw.js', mimetype='application/javascript')

@app.route('/api/stazioni', methods=['GET'])
def get_stazioni():
    if os.path.exists(CACHE_STAZIONI):
        with open(CACHE_STAZIONI, 'r', encoding="utf-8") as f:
            return jsonify(json.load(f))

    query = """
    [out:json][timeout:25][bbox:40.78,14.13,40.92,14.35];
    nwr["railway"="station"];
    out meta center;
    """
    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({"data":query}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={'User-Agent':"Aegis-App/1.0"})

    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            risultato = json.loads(response.read().decode("utf-8"))
            with open(CACHE_STAZIONI, 'w', encoding="utf-8") as f:
                json.dump(risultato, f, ensure_ascii=False)
        return jsonify(risultato)
    except Exception as e:
        return jsonify({"errore": str(e)}), 502


if __name__ == '__main__':
    app.run(debug=True)