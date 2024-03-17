function attribute_AttributeModel(sampleText, dashboardFileViewModel) {
    var self = this;
    self.sampleText = sampleText;
    self.dashboardFileViewModel = dashboardFileViewModel;
    self.selected = ko.observable(false);
    self.simulationsData = [];
  
    self.selected.subscribe(function(newValue) {
      if (newValue) {
        dashboardFileViewModel.selectedAttributes.push(self);
      } else {
        dashboardFileViewModel.selectedAttributes.remove(self);
      }
  
      updateGraphBasedOnSelections(dashboardFileViewModel);
    });
  
    self.addSimulationData = function(simulationGUID, simulationName, data, timestepData) {
      self.simulationsData.push({ guid: simulationGUID, name: simulationName, data: data, timestepData: timestepData });
    };
  }
  function updateGraphBasedOnSelections(dashboardFileViewModel) {
    const selectedAttributes = dashboardFileViewModel.selectedAttributes();
    const selectedSimulations = dashboardFileViewModel.selectedSimulations;
  
    const simulationsData = selectedSimulations.map(simulationGUID => {
      const simulationData = selectedAttributes.reduce((acc, attribute) => {
        const simulationInfo = attribute.simulationsData.find(sd => sd.guid === simulationGUID);
        if (simulationInfo) {
          acc.data.push(simulationInfo.data);
          acc.timestepData = simulationInfo.timestepData;
          acc.name = simulationInfo.name;
        }
        return acc;
      }, { data: [], timestepData: [], name: '' });
  
      return simulationData;
    });
  
    const attributeNames = selectedAttributes.map(attr => attr.sampleText);
  
    updateGraph(simulationsData, attributeNames, dashboardFileViewModel.name);
  }
function parseTSV(tsvContent, dashboardFileViewModel, guid, simulationName) {
    const rows = tsvContent.trim().split('\n');
    const headers = rows[0].split('\t');
    const dataRows = rows.slice(1);

    let columnData = headers.reduce((acc, header) => {
        acc[header] = [];
        return acc;
    }, {});

    let timestepData = [];

    dataRows.forEach(row => {
        const values = row.split('\t');
        headers.forEach((header, index) => {
            if (values[index] !== undefined && header !== "Timestep") {
                columnData[header].push(values[index]);
            } else if (header === "Timestep") {
                timestepData.push(values[index]);
            }
        });
    });
    headers.forEach(header => {
        if (header !== "Timestep") {
            let attributeModel = dashboardFileViewModel.attributeList().find(model => model.sampleText === header);
            if (!attributeModel) {
                attributeModel = new attribute_AttributeModel(header, dashboardFileViewModel);
                dashboardFileViewModel.attributeList.push(attributeModel);
            }
            attributeModel.addSimulationData(guid, simulationName, columnData[header], timestepData);
        }
    });
}

function fetchAndParseTSV(guid, dashboardFileViewModel, simulationName) { 
    const tsvFilePath = `/api/data/${guid}/${dashboardFileViewModel.filename}`;

    fetch(tsvFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(tsvContent => {
            parseTSV(tsvContent, dashboardFileViewModel, guid, simulationName);
        })
        .catch(error => {
            console.error('Failed to fetch or parse the TSV file:', error);
        });
}

function attribute_Main(dashboardFileViewModel, selectedSimulationInstance) {
    console.log("ATTRIBUTE MAIN");
    const guid = selectedSimulationInstance.guid;
    const simulationName = selectedSimulationInstance.name;
    fetchAndParseTSV(guid, dashboardFileViewModel, simulationName);
}
/* --- DO NOT EDIT BELOW --- */
window.dashboard.dashboardSummaries.forEach(_fileviewmodel => {
    _fileviewmodel.simulationInstances.subscribe(function (_simulationInstance) {
        _simulationInstance.forEach(_instance => {
            _instance.selected.subscribe(newValue => {
                attribute_Main(_fileviewmodel, _instance);
            });
        });
    });
});
