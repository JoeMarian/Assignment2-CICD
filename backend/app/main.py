from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return """
    <div style='font-family: Arial; text-align: center; margin-top: 100px;'>
        <h2>🚀 Backend Successfully Deployed on EC2! test 2</h2>
        <p>This Flask API is running inside a Docker container managed via Jenkins CI/CD.</p>
        <p>Check <a href='/status'>/status</a> for API health.</p>
    </div>
    """

@app.route('/status', methods=['GET'])
def status():
    return jsonify({'status': 'API is up and running!', 'service': 'Flask Backend'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)