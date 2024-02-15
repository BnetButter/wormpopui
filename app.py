from flask import Flask, render_template, request
import subprocess
import json
import os

app = Flask(__name__)

@app.route('/')
def form():
    with open('simulation/constants.json') as f:
        default_params = json.load(f)
    return render_template('index.html', default_params=default_params)

@app.route('/run-simulation', methods=['POST'])
def run_simulation():
    parameters = request.form.to_dict()
    directory_name = parameters.pop('directory')  
    database_name = parameters.pop('database')  
    
    
    with open('simulation/constants.json') as f:
        types = json.load(f)
    for key, value in parameters.items():
        if isinstance(types[key], int):
            parameters[key] = int(value)
        elif isinstance(types[key], float):
            parameters[key] = float(value)
    
    temp_params_file = 'temp_constants.json'
    with open(temp_params_file, 'w') as f:
        json.dump(parameters, f)
    
    command = [
        'python', 'simulation/wormpop.py',
        '--parameters=' + temp_params_file,
        '--database=' + database_name,
        '--directory=' + directory_name
    ]
    
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, cwd=os.getcwd())
    stdout, stderr = process.communicate()

    response = f'<pre>{stdout}</pre>'
    if stderr:
        response += f'<pre>Error: {stderr}</pre>'
    return response

if __name__ == '__main__':
    app.run(debug=True)
