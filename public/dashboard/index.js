function SelectedSimulationInstance(guid, name) {
    const self = this;
    self.guid = guid;
    self.name = name;
    self.selected = ko.observable(false);
}

function DashBoardFileViewModel(name, filename) {
    const self = this;
    self.name = name
    self.filename = filename
    self.simulationInstances = ko.observableArray()
    self.paramsList = ko.observableArray()
    self.attributeList = ko.observableArray()
    self.selectedData = ko.observableArray()
    
}

function DashboardViewModel() {
    const self = this;

    self.dashboardSummaries = [
        new DashBoardFileViewModel("Summary", "summary.tsv", "summary"),
        new DashBoardFileViewModel("Stage Transitions", "stage_transitions.tsv", "transitions"),
    ]
    
    fetch('/api/job-status')
        .then(response => response.json())
        .then(data => {

            self.dashboardSummaries.forEach(fileviewmodel => {
                fileviewmodel.simulationInstances(data.result.map(
                    instance => new SelectedSimulationInstance(instance.guid, instance.name))
                );
            })
        });
    
    
}

// Create binding when DOM loads
ko.applyBindings(window.dashboard = new DashboardViewModel());

