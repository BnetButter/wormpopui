from flask import Flask, render_template, request, send_from_directory
import subprocess
import json
import os
import uuid
import sqlite3
import signal


app = Flask(__name__)

@app.route('/')
def form():
    with open('simulation/constants.json') as f:
        default_params = json.load(f)
    return render_template('index.html', default_params=default_params)

# Route for serving files from the public directory
@app.route('/<path:filename>')
def public_files(filename):
    return send_from_directory('public', filename)

@app.route('/run-simulation', methods=['POST'])
def run_simulation():
    parameters = request.form.to_dict()
    #directory_name = parameters.pop('directory')  uuid.uuid4()
    
    
    
    #os.mkdir("instances")
    guid = str(uuid.uuid4())
    #directory_name = "instances/" + guid
    #directory_name = os.path.join(os.getcwd(), directory_name)
    parameters.pop('database')
    parameters.pop('directory')

    directory_name = os.path.join(os.getcwd(), "instances", guid)
    database_name = os.path.join(directory_name, "database.sqlite")

    os.makedirs(directory_name)

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
    
    platform = os.name
    if(platform == 'nt'):
        command = [
            'python', 'simulation/wormpop.py',
            '--parameters=' + temp_params_file,
            '--database=' + database_name,
            '--directory=' + directory_name
        ]
    elif(platform == 'posix'):
        command = [
            'python3', 'simulation/wormpop.py',
            '--parameters=' + temp_params_file,
            '--database=' + database_name,
            '--directory=' + directory_name
        ]
    else:
        print("You did something very wrong!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    
    print(os.name)
    print("----------------------------------------------------!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

    if os.name == 'posix':
        # Start the subprocess detached from its parent, running in a new process group
        subprocess.Popen(command, 
                         stdout=subprocess.DEVNULL, 
                         stderr=subprocess.STDOUT, 
                         stdin=subprocess.DEVNULL,
                         preexec_fn=os.setsid)
    # On Windows
    elif os.name == 'nt':
        # Start the subprocess detached from its parent and in a new console window
        subprocess.Popen(command, 
                         stdout=subprocess.DEVNULL, 
                         stderr=subprocess.STDOUT, 
                         stdin=subprocess.DEVNULL,
                         creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS)
    else:
        raise RuntimeError("Unsupported operating system")
    



    #stdout, stderr = process.communicate()

    #response = f'<pre>{stdout}</pre>'
    #if stderr:
    #    response += f'<pre>Error: {stderr}</pre>'
    #return response
    return "hello"



# Function to create the ProcessTable
def create_process_table(db_connection):
    cursor = db_connection.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ProcessTable (
            pid INTEGER PRIMARY KEY,
            guid TEXT NOT NULL,
            start_time DATETIME,
            end_time DATETIME
        )
    ''')
    db_connection.commit()

def kill_all_processes():
    # Use a with statement to ensure the database connection is automatically closed
    with sqlite3.connect('processtable.sqlite') as conn:
        cursor = conn.cursor()

        # Select all pids from the ProcessTable
        cursor.execute("SELECT pid FROM ProcessTable")
        processes = cursor.fetchall()

        for process in processes:
            pid = process[0]
            try:
                # Send the SIGTERM signal to gracefully terminate the process
                os.kill(pid, signal.SIGTERM)
            except OSError as e:
                print(f"Error killing process {pid}: {e}")


if __name__ == '__main__':
    
    with sqlite3.connect('processtable.sqlite') as conn:
        # Create the ProcessTable if it doesn't exist
        create_process_table(conn)
    app.run(debug=True)
