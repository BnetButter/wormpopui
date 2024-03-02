from flask import Flask, render_template, request, send_from_directory, redirect, jsonify
import subprocess
import json
import os
import uuid
import sqlite3
import signal
from datetime import datetime


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
    name = parameters.pop('name')

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
            '--directory=' + directory_name,
            
        ]
    elif(platform == 'posix'):
        command = [
            'python3', 'simulation/wormpop.py',
            '--parameters=' + temp_params_file,
            '--database=' + database_name,
            '--directory=' + directory_name,
            
        ]
    else:
        print("You did something very wrong!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    
    print(os.name)
    print("----------------------------------------------------!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

    child = None
    if os.name == 'posix':
        # Start the subprocess detached from its parent, running in a new process group
        child = subprocess.Popen(command, 
                         stdout=subprocess.DEVNULL, 
                         stderr=subprocess.STDOUT, 
                         stdin=subprocess.DEVNULL,
                         preexec_fn=os.setsid)
    # On Windows
    elif os.name == 'nt':
        # Start the subprocess detached from its parent and in a new console window
        child = subprocess.Popen(command, 
                         stdout=subprocess.DEVNULL, 
                         stderr=subprocess.STDOUT, 
                         stdin=subprocess.DEVNULL,
                         creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS)
    else:
        raise RuntimeError("Unsupported operating system")
    
    if not child:
        raise RuntimeError("Shouldn't Happen")

    # Get the PID of the child process
    pid = child.pid

    # Get the current time as start_time
    start_time = datetime.now()

    # Use a with statement to ensure the database connection is automatically managed
    with sqlite3.connect('processtable.sqlite') as conn:
        cursor = conn.cursor()

        # Insert a new row into the ProcessTable with the pid, guid, and start_time
        cursor.execute("INSERT INTO ProcessTable (pid, guid, name, start_time) VALUES (?, ?, ?, ?)",
                    (pid, guid, name, start_time))

        # Commit the changes to the database
        conn.commit()

    #stdout, stderr = process.communicate()

    #response = f'<pre>{stdout}</pre>'
    #if stderr:
    #    response += f'<pre>Error: {stderr}</pre>'
    #return response

    # redirect to the /jobs page
    return redirect('/jobs.html')


@app.route('/api/job-status')
def job_status_all():
    
    # TODO implement pagination

    with sqlite3.connect('processtable.sqlite') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM ProcessTable")
        rows = cursor.fetchall()
        results = []
    
        for row in rows:
            pid, guid, name, start_time, _ = row
            try:
                # Try sending signal 0, this does not kill the process but checks if it's possible to send signals
                os.kill(pid, 0)
                status = 'RUNNING'
            except OSError:
                # If an error occurs, it means the process is stopped or doesn't exist
                status = 'STOPPED'

            # Calculate time elapsed since the start_time
            start_time_obj = datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S.%f')  # Adjust the format if necessary
            time_elapsed = datetime.now() - start_time_obj
            time_elapsed_str = str(time_elapsed)  # Convert to string if you want in 'HH:MM:SS' format

            results.append({
                'guid': guid,
                'start_time': start_time,
                'time_elapsed': time_elapsed_str,
                'status': status,
                'name': name
            })

        return jsonify({'result': results})



@app.route('/job-status/<guid>')
def job_status(guid):
    with sqlite3.connect('processtable.sqlite') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM ProcessTable WHERE guid=?", (guid,))
        row = cursor.fetchone()
        if row is None:
            return "No such job"
        pid = row[0]

    try:
        os.kill(pid, 0)
    except OSError as e:
        if e.errno == 3:
            return "Job has finished"
        else:
            return f"Error: {e}"
    else:
        return "Job is still running"


@app.route('/api/data/<guid>/<file>')
def simulation_file(guid, file):
    directory_name = os.path.join(os.getcwd(), "instances", guid)
    return send_from_directory(directory_name, file)



# Function to create the ProcessTable
def create_process_table(db_connection):
    cursor = db_connection.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ProcessTable (
            pid INTEGER PRIMARY KEY,
            guid TEXT NOT NULL,
            name TEXT,
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


def print_all_processes():
    # Use a with statement to ensure the database connection is automatically closed
    with sqlite3.connect('processtable.sqlite') as conn:
        cursor = conn.cursor()

        # Select all pids from the ProcessTable
        cursor.execute("SELECT * FROM ProcessTable")
        processes = cursor.fetchall()

        for process in processes:
            print(process)


if __name__ == '__main__':
    with sqlite3.connect('processtable.sqlite') as conn:
        # Create the ProcessTable if it doesn't exist
        create_process_table(conn)
    app.run(debug=True)
