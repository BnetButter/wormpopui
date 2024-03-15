function SelectedSimulationInstance(guid, name) {
    const self = this;
    self.guid = guid;
    self.name = name;
    self.selected = ko.observable(false);

    self.selected.subscribe(function(newValue) {
        const index = selectedSimulations.indexOf(self.guid);
        if (newValue) {
            if (index === -1) { // Ensure only adding if not present
                selectedSimulations.push(self.guid);
            }
        } else {
            if (index > -1) { // Ensure removing if present
                selectedSimulations.splice(index, 1);
            }
        }
        
        triggerGraphUpdate();
    });

    self.toggleSelected = () => { self.selected(!self.selected()); }
}

function triggerGraphUpdate() {
    if (currentlySelectedAttribute) {
        // Re-filter and deduplicate based on updated selectedSimulations
        updateGraphBasedOnSelections(currentlySelectedAttribute);
    }
}


function DashBoardFileViewModel(name, filename) {
    const self = this;
    self.name = name
    self.filename = filename
    self.simulationInstances = ko.observableArray()
    self.paramsList = ko.observableArray()
    self.attributeList = ko.observableArray()
    self.selectedData = ko.observableArray()

    self.updateSelectedData = ko.computed(function() {
        var selectedAttributes = self.attributeList().filter(function(attr) {
            return attr.selected();
        }).map(function(attr) {
            return attr.sampleText;
        });
        self.selectedData(selectedAttributes);
    });
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

