var trace1 = {
x: [1, 2, 3, 4],
y: [10, 15, 13, 17],
type: 'scatter',  // this defines the type of plot, which is a line plot in this case
mode: 'lines+markers', // this means the graph will have both lines and markers
name: 'Sample Data'
};

var data = [trace1];

var layout = {
title: 'Simple Line Plot',
xaxis: {
    title: 'X Axis',
    showgrid: false,
    zeroline: false
},
yaxis: {
    title: 'Y Axis',
    showline: false
}
};

Plotly.newPlot('linePlot', data, layout);
