// Get WebSocket port from URL query
const urlParams = new URLSearchParams(window.location.search);
const guid = urlParams.get('guid');

console.log(guid)
// Canvas element and context
const canvas = document.getElementById('grid');

const ctx = canvas.getContext('2d');
const previousPositions = {}

let currtimestep = 0

fetch(`/api/data/${guid}/worm_world.json`)
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        console.log("parsed_data")
    
        setInterval(() => {
            render(currtimestep, data)
            currtimestep += 1
            if (currtimestep >= data.worm.length) {
                currtimestep = 0
            }
        }, 200)
    })

function render(timestep, data) {
    const worms = data.worm
    const food = data.food

    // Clear canvas before redrawing
    clearCanvas();

    worms[timestep].forEach((worm) => {
        handleAgent(worm)
    })

    food[timestep].forEach((food) => {
        handleFood(food)
    })
}

const variantColors = {}

// Function to draw agent location
function drawAgent(x, y, stage, name, variant) {
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
    ctx.globalAlpha = 1

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
    const x = food.x
    const y = food.y
    const amount = food.amount
    const radius = food.radius

    ctx.fillStyle = 'purple';



    // draw the radius as a circle but do not fill
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();

    


    // Draw the amount as text
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(amount, x, y);
}

function handleAgent(agent) {
    const x = agent.x
    const y = agent.y
    const name = agent.name
    const stageShort = agent.stage[0].toUpperCase()
    drawAgent(x, y, stageShort, name, agent.variant)
}

