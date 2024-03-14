function attribute_AttributeModel(sampleText, data = [], dashboardFileViewModel) {
    var self = this;
    self.sampleText = sampleText;
    self.data = data;
    self.dashboardFileViewModel = dashboardFileViewModel; // Store reference to the dashboardFileViewModel
    self.selected = ko.observable(false);

    self.selected.subscribe(function(newValue) {
        if (newValue === true) {
            console.log("Selected attribute: ", self.sampleText, "Data: ", self.data);
            // Use the dashboardFileViewModel passed to this model to access timestepData
            updateGraph(self.dashboardFileViewModel.timestepData, self.data, self.sampleText);
        }
    });
}

function parseTSV(tsvContent, dashboardFileViewModel) {
    const rows = tsvContent.trim().split('\n');
    const headers = rows[0].split('\t');
    const dataRows = rows.slice(1); // Remove header row

    let columnData = headers.reduce((acc, header) => {
        acc[header] = [];
        return acc;
    }, {});

    let timestepData = []; // Array to hold timestep data

    dataRows.forEach(row => {
        const values = row.split('\t');
        headers.forEach((header, index) => {
            if (values[index] !== undefined) { // Check for undefined in case of missing data
                if (header === "Timestep") { // Assuming 'Timestep' is the column header for timestep data
                    timestepData.push(values[index]); // Store timestep data separately
                } else {
                    columnData[header].push(values[index]);
                }
            }
        });
    });

    dashboardFileViewModel.timestepData = timestepData; // Store timestep data in the dashboardFileViewModel
    dashboardFileViewModel.attributeList.removeAll();
    headers.forEach(header => {
        if (header !== "Timestep") { // Exclude timestep column from attribute list
            dashboardFileViewModel.attributeList.push(new attribute_AttributeModel(header, columnData[header], dashboardFileViewModel));
        }
    });
}

function fetchAndParseTSV(guid, dashboardFileViewModel) {
    const tsvFilePath = `/api/data/${guid}/${dashboardFileViewModel.filename}`;

    fetch(tsvFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(tsvContent => {
            parseTSV(tsvContent, dashboardFileViewModel);
        })
        .catch(error => {
            console.error('Failed to fetch or parse the TSV file:', error);
        });
}

function attribute_Main(dashboardFileViewModel, selectedSimulationInstance) {
    console.log("ATTRIBUTE MAIN");
    const guid = selectedSimulationInstance.guid;
    fetchAndParseTSV(guid, dashboardFileViewModel);
}

/* --- DO NOT EDIT BELOW --- */
window.dashboard.dashboardSummaries.forEach(_fileviewmodel => {
    _fileviewmodel.simulationInstances.subscribe(function (_simulationInstance) {
        _simulationInstance.forEach(_instance => {
            _instance.selected.subscribe(newValue => {
                attribute_Main(_fileviewmodel, _instance);
            })
        })
    })
})
