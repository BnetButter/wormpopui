function table_ParamsModel(sampleText, data) {
    var self = this;
    self.sampleText = sampleText;
    self.sampleData = data;
    self.selected = ko.observable(false);
}

function KeyValuePair(key, value) {
    let self = this
    self.key = key
    self.value = value
}
/* This function gets run every time a new simulation instance is clicked */
function table_Main(dashboardFileViewModel, selectedSimulationInstance) {

    for (let instance of dashboardFileViewModel.simulationInstances().filter((inst) => inst.selected())) {
        const guid = instance.guid

        // Fetch parameters.json 
        fetch(`/api/data/${guid}/parameters.json`)
            .then(response => response.json())
            .then(obj => {
                console.log(instance)
                instance.attributes(obj)
                
                const result = dashboardFileViewModel.tableDidUpdate()
                // Update tableDidUpdate so we can call a hook
                dashboardFileViewModel.tableDidUpdate(!result)  

            })
    }




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