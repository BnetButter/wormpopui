from flask import Flask, request, jsonify
import subprocess
import json
import uuid
from threading import Thread
import os
from flask import render_template

app = Flask(__name__)

simulations = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-defaults', methods=['GET'])
def get_defaults():
    with open('simulation/constants.json') as f:
        constants = json.load(f)
    return jsonify(constants)

def start_simulation_process(sim_id, parameters):
    parameters_path = f'simulation/tmp_{sim_id}.json'
    with open(parameters_path, 'w') as f:
        json.dump(parameters, f)
    
    command = ['python3', 'simulation/wormpop.py', f'--parameters={parameters_path}']
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    
    simulations[sim_id] = {'status': 'Completed', 'output': stdout.decode()}
    
    os.remove(parameters_path)
    # Save the output to a results file
    with open(f'simulation/results_{sim_id}.txt', 'w') as f:
        f.write(stdout.decode())

@app.route('/new-simulation', methods=['POST'])
def new_simulation():
    data = request.json
    sim_id = str(uuid.uuid4())
    Thread(target=start_simulation_process, args=(sim_id, data)).start()
    return jsonify({'simulation_id': sim_id})

@app.route('/simulation-details/<simulation_id>', methods=['GET'])
def simulation_details(simulation_id):
    try:
        with open(f'simulation/results_{simulation_id}.txt') as f:
            results = f.read()
        return jsonify({'results': results})
    except FileNotFoundError:
        return jsonify({'error': 'Results not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
