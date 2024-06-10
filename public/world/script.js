// Get WebSocket port from URL query
const urlParams = new URLSearchParams(window.location.search);
const socketPort = urlParams.get('socket');
const socketUrl = `ws://localhost:${socketPort}`;

// Connect to WebSocket server
const socket = new WebSocket(socketUrl);

// Canvas element and context
const canvas = document.getElementById('grid');

const ctx = canvas.getContext('2d');
const previousPositions = {}

// Function to draw agent location
function drawAgent(x, y, stage, name) {
    const canvasX = x;
    const canvasY = y;

    let color;
    switch (stage) {
        case 'A':
            color = 'green';
            break;
        case 'L':
            color = 'red';
            break;
        case 'E':
            color = 'blue';
            break;
        case 'P':
            color = 'yellow';
            break;
        case 'D':
            color = 'black';
            break;
        default:
            console.log("Unknown stage: ", stage);
            color = 'black';
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Check if we have previous positions
    if (previousPositions[name]) {
        ctx.beginPath();
        if (previousPositions[name].length === 1) {
            // If only one previous position, draw a line from that position to the current position
            ctx.moveTo(previousPositions[name][0].x, previousPositions[name][0].y);
            ctx.lineTo(canvasX, canvasY);
        } else if (previousPositions[name].length === 2) {
            // If two previous positions, draw lines connecting them to the current position
            ctx.moveTo(previousPositions[name][0].x, previousPositions[name][0].y);
            ctx.lineTo(previousPositions[name][1].x, previousPositions[name][1].y);
            ctx.lineTo(canvasX, canvasY);
        }
        ctx.stroke();
    }

    // Draw a single pixel at the current position
    ctx.fillRect(canvasX, canvasY, 2, 2); // Adjust size if needed

    // Update previous positions
    if (!previousPositions[name]) {
        previousPositions[name] = [];
    }
    if (previousPositions[name].length === 2) {
        previousPositions[name].shift();
    }
    previousPositions[name].push({ x: canvasX, y: canvasY });
}
// Function to clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function handleAgent(agent) {
    const x = agent.pos[0]
    const y = agent.pos[1]
    const name = agent.name
    const stageShort = agent.stage_short
    drawAgent(x, y, stageShort, name)
}

// Handle incoming WebSocket messages
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log(data);

    // Clear canvas before redrawing
    clearCanvas();

    // Check if data is an array (history) or a single object (live update)
    if (Array.isArray(data)) {
        data.forEach(agent => handleAgent(agent));
    } else {
        drawAgent(data.x, data.y);
    }
};

socket.onopen = function() {
    console.log('WebSocket connection established');
    // Optionally, send a message to request historical data
    // socket.send(JSON.stringify({ type: 'requestHistory' }));
};

socket.onclose = function() {
    console.log('WebSocket connection closed');
};

socket.onerror = function(error) {
    console.error('WebSocket error:', error);
};
