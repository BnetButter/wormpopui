function attribute_AttributeModel(sampleText) {
    var self = this;
    self.sampleText = sampleText;
    self.selected = ko.observable(false);

    self.selected.subscribe(function(newValue) {
        if (newValue === true) {
            console.log("Selected attribute: ", self.sampleText);
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
            const rows = tsvContent.trim().split('\n');
            const headers = rows[0].split('\t');
            
            
            dashboardFileViewModel.attributeList.removeAll();

            headers.forEach(header => {
                dashboardFileViewModel.attributeList.push(new attribute_AttributeModel(header));
            });
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
