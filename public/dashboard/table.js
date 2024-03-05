function table_ParamsModel(sampleText) {
    var self = this;
    self.sampleText = sampleText;
}


/* This function gets run every time a new simulation instance is clicked */
function table_Main(dashboardFileViewModel, selectedSimulationInstance) {
    let guid = selectedSimulationInstance.guid;
    console.log(guid);

    // Fetch parameters.json 
    fetch(`/api/data/${guid}/parameters.json`)
        .then(response => response.json())
        .then(obj => {
            console.log(obj); // log fetched parameters
            updateTable(obj); // Call function to update the table
        })
}

function updateTable(data) {
    var table = document.getElementById('comparisonTable');
    if (!table) {
        table = document.createElement('table');
        table.id = 'comparisonTable';
        document.body.appendChild(table); // Add the table to the body or another container
    }

    // Clear table
    table.innerHTML = '';

    // Table headers
    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    tr.innerHTML = '<th>Parameter</th><th>Value</th>';
    thead.appendChild(tr);
    table.appendChild(thead);

    // Table body
    var tbody = document.createElement('tbody');
    for (var key in data) {
        var tr = document.createElement('tr');
        tr.innerHTML = `<td>${key}</td><td>${data[key]}</td>`;
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
}

/* --- DO NOT EDIT BELOW --- */
window.dashboard.dashboardSummaries.forEach(_fileviewmodel => {
    _fileviewmodel.simulationInstances.subscribe(function (_simulationInstance) {
        _simulationInstance.forEach(_instance => {
            _instance.selected.subscribe(newValue => {
                table_Main(_fileviewmodel, _instance);
            })
        })
    })
})