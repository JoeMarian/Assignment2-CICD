from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/mood', methods=['POST'])
def set_mood():
    data = request.json
    mood = data.get('mood', '')
    # For demo, just return the received mood
    return jsonify({'success': True, 'mood': mood})

@app.route('/status', methods=['GET'])
def status():
    return jsonify({'status': 'API running'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
