function updateGraph(simulationsData, attributeNames, dashboardName) {
    // Construct the dynamic ID based on the dashboardName
    var plotId = 'plot-' + dashboardName.toLowerCase().replace(/\s+/g, '-');
  
    // Create traces for each attribute and simulation combination
    var traces = simulationsData.flatMap((simulation, simulationIndex) => {
      return attributeNames.map((attributeName, attributeIndex) => ({
        x: simulation.timestepData,
        y: simulation.data[attributeIndex],
        type: 'scatter',
        mode: 'lines+markers',
        name: `${attributeName} - ${simulation.name}`
      }));
    });
  
    var layout = {
      title: `${attributeNames.join(', ')} vs. Time`,
      xaxis: {
        title: 'Time',
        showgrid: false,
        zeroline: false
      },
      yaxis: {
        title: attributeNames.join(', '),
        showline: false
      }
    };
  
    Plotly.react(plotId, traces, layout);
  }