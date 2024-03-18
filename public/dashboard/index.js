function SelectedSimulationInstance(guid, name, dashboardViewModel) {
    const self = this;
    self.guid = guid;
    self.name = name;
    self.selected = ko.observable(false);
    self.attributes = ko.observable()

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

    self.attributes = ko.observableArray()
}

function triggerGraphUpdate(dashboardViewModel) {
    if (dashboardViewModel.currentlySelectedAttribute) {
        // Re-filter and deduplicate based on updated selectedSimulations
        updateGraphBasedOnSelections(dashboardViewModel.currentlySelectedAttribute, dashboardViewModel);
    }
}

function TableViewModel(headers, rows) {
    var self = this    
    self.testtext = "hello"
    self.headers = ["Parameters", ...headers]
    self.rows = rows
    self.paramsList = []
}

function Row(attributeName, values, hasDifference) {
    const self = this;
    self.name = attributeName
    self.values = [attributeName, ...values]
    self.hasDifference = hasDifference
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


    self.table = ko.observable(new TableViewModel([], []))

    self.tableDidUpdate = ko.observable(false)
  
    self.updateSelectedData = ko.computed(function() {
      var selectedAttributes = self.attributeList().filter(function(attr) {
        return attr.selected();
      }).map(function(attr) {
        return attr.sampleText;
      });
  
      self.selectedData(selectedAttributes);
    });



    self.tableDidUpdate.subscribe(() => {
        
        const selectedSimulations = self.simulationInstances().filter(instance => instance.selected())
        
        if (selectedSimulations.length === 0)
            return;
        
        const baseAttribute = selectedSimulations[0].attributes()

        const headers = selectedSimulations.map(instance => instance.name)
        
        const attributeNames = Object.keys(baseAttribute)

        const rows = []
        for (const name of attributeNames) {
            const row = []
            for (const simulation of selectedSimulations) {
                const attr = simulation.attributes()
                row.push(attr[name])
            }

            rows.push(new Row(name, row, !row.every((value) => value === row[0])))
        }

        
        for (const row of rows) {
            // console.log(row)
        }

        self.table(new TableViewModel(headers, rows))


    })
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