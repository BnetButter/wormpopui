function table_ParamsModel(sampleText, data) {
    var self = this;
    self.sampleText = sampleText;
    self.sampleData = data;
    self.selected = ko.observable(false);
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


            dashboardFileViewModel.paramsList(
                Object.keys(obj).map(k => new table_ParamsModel(k, obj[k]))
            )
        })

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