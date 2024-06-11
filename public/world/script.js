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

function handleFood(food) {
    const x = food.pos[0]
    const y = food.pos[1]
    const amount = food.amount

    ctx.fillStyle = 'purple';

    // Draw food as a circle with radius proportional to the amount
    ctx.beginPath();
    ctx.arc(x, y, Math.sqrt(amount) / 10, 0, 2 * Math.PI);
    ctx.fill();

    // Draw the amount as text
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(amount, x, y);
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
    const worms = data.worms
    const food = data.food

    // Clear canvas before redrawing
    clearCanvas();

    worms.forEach((worm) => {
        handleAgent(worm)
    })

    food.forEach((food) => {
        handleFood(food)
    })
    
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
