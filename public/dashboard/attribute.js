function attribute_AttributeModel(sampleText, data = []) {
    var self = this;
    self.sampleText = sampleText;
    self.data = data;
    self.selected = ko.observable(false);

    self.selected.subscribe(function(newValue) {
        if (newValue === true) {
            console.log("Selected attribute: ", self.sampleText, "Data: ", self.data);
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

    dataRows.forEach(row => {
        const values = row.split('\t');
        headers.forEach((header, index) => {
            if (values[index] !== undefined) { // Check for undefined in case of missing data
                columnData[header].push(values[index]);
            }
        });
    });

    dashboardFileViewModel.attributeList.removeAll();
    headers.forEach(header => {
        dashboardFileViewModel.attributeList.push(new attribute_AttributeModel(header, columnData[header]));
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
