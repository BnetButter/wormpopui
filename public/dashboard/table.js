function table_ParamsModel(sampleText) {
    var self = this;
    self.sampleText = sampleText;
}


/* This function gets run every time a new simulation instance is clicked */
function table_Main(dashboardFileViewModel, selectedSimulationInstance) {
    
    /* EDIT ME */
    console.log(
        dashboardFileViewModel.filename, 
        selectedSimulationInstance.name,
        selectedSimulationInstance.selected()
    );

    /* 
    TODO - Pull parameters.json for each simulation instance.
    Create a table that shows how they differ */
    
    dashboardFileViewModel.paramsList(
        dashboardFileViewModel.simulationInstances()
            .filter(instance => instance.selected())
            .map(instance => new table_ParamsModel(instance.name))
    )
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