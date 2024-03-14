
// Function to update the graph with new data
function updateGraph(timestepData, attributeData, attributeName) {
    var trace = {
        x: timestepData, // X-axis data from timestep data
        y: attributeData, // Y-axis data from the selected attribute
        type: 'scatter',  // Defines the type of plot, which is a line plot in this case
        mode: 'lines+markers', // Graph will have both lines and markers
        name: attributeName // Use the attribute name as the trace name
    };

    var data = [trace];

    var layout = {
        title: attributeName + ' vs. Time', // Dynamic title based on the selected attribute
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

    // Render the plot to the div with id 'linePlot'
    Plotly.newPlot('linePlot', data, layout);
}
