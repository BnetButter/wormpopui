function attribute_AttributeModel(sampleText) {
    var self = this;
    self.sampleText = sampleText;
}

/* This function gets run every time a new simulation instance is clicked */
function attribute_Main(dashboardFileViewModel, selectedSimulationInstance) {
    console.log("ATTRIBUTE MAIN")

    /*  TODO - Pull the TSV file specified by the dashboardViewModel and render all the columns. 
    The difficult part is that the TSV file is not guaranteed to have the same columns for each simulation instance.
    If a column is missing, it should be marked as 'red'

    As a step 1, assume all of them are the same
    */

    dashboardFileViewModel.attributeList(
        dashboardFileViewModel.simulationInstances()
            .filter(instance => instance.selected())
            .map(instance => new attribute_AttributeModel(instance.name))
    )

    /* Step 2: The view models data field */

    dashboardFileViewModel.selectedData([ /* UPDATE ME */ ])
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
