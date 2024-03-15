
function updateGraph(simulationsData, attributeName) {
    var traces = simulationsData.map(simulation => ({
        x: simulation.timestepData,
        y: simulation.data,
        type: 'scatter',
        mode: 'lines+markers',
        name: `${attributeName} - ${simulation.name}` 
    }));

    var layout = {
        title: `${attributeName} vs. Time`,
        xaxis: {
            title: 'Time',
            showgrid: false,
            zeroline: false
        },
        yaxis: {
            title: attributeName,
            showline: false
        }
    };

    Plotly.react('linePlot', traces, layout);
}
