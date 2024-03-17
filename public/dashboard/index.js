function SelectedSimulationInstance(guid, name, dashboardViewModel) {
    const self = this;
    self.guid = guid;
    self.name = name;
    self.selected = ko.observable(false);
    self.dashboardViewModel = dashboardViewModel;

    self.selected.subscribe(function(newValue) {
        const index = self.dashboardViewModel.selectedSimulations.indexOf(self.guid);
        if (newValue) {
            if (index === -1) { // Ensure only adding if not present
                self.dashboardViewModel.selectedSimulations.push(self.guid);
            }
        } else {
            if (index > -1) { // Ensure removing if present
                self.dashboardViewModel.selectedSimulations.splice(index, 1);
            }
        }
        
        triggerGraphUpdate(self.dashboardViewModel);
    });

    self.toggleSelected = () => { self.selected(!self.selected()); }
}

function triggerGraphUpdate(dashboardViewModel) {
    if (dashboardViewModel.currentlySelectedAttribute) {
        // Re-filter and deduplicate based on updated selectedSimulations
        updateGraphBasedOnSelections(dashboardViewModel.currentlySelectedAttribute, dashboardViewModel);
    }
}

function DashBoardFileViewModel(name, filename) {
    const self = this;
    self.name = name;
    self.filename = filename;
    self.simulationInstances = ko.observableArray();
    self.paramsList = ko.observableArray();
    self.attributeList = ko.observableArray();
    self.selectedData = ko.observableArray();
    self.selectedAttributes = ko.observableArray(); // Store an array of selected attributes
    self.selectedSimulations = [];
  
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
        new DashBoardFileViewModel("Death Transitions", "death_transitions.tsv"),
        new DashBoardFileViewModel("Variant Count", "variant_count.tsv"),
    ]
    
    fetch('/api/job-status')
        .then(response => response.json())
        .then(data => {
            self.dashboardSummaries.forEach(fileviewmodel => {
                fileviewmodel.simulationInstances(data.result.map(
                    instance => new SelectedSimulationInstance(instance.guid, instance.name, fileviewmodel))
                );
            })
        });
}

// Create binding when DOM loads
ko.applyBindings(window.dashboard = new DashboardViewModel());