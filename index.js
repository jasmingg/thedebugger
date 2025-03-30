const playerElement = document.getElementById('player');
let playerX = 100;
let playerY = 100;
const moveSpeed = 25;
let isMoving = false;

const targetDot = document.getElementById('dot');
let dotX = 400;
let dotY = 300;

const proximityThreshold = 40;
let testingConvoPause = false;

const MODEL_NAME = 'gemini-2.0-flash';


playerElement.style.position = 'absolute';
targetDot.style.position = 'absolute';
playerElement.style.left = playerX + 'px';
playerElement.style.top = playerY + 'px';
targetDot.style.left = dotX + 'px';
targetDot.style.top = dotY + 'px';
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.overflow = 'hidden';

let verticalMoveCounter = 0;
let horizontalMoveCounter = 0;
let lastDirection = null;
const animationCycle = 50;

function updatePlayerAppearance() {
    let backgroundImage = "";
    let transform = "";

    if (lastDirection === 'vertical') {
        if (verticalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-vertical-1.png')";
        } else {
            backgroundImage = "url('monty-vertical-2.png')";
        }
        if (keysPressed['ArrowDown'] || keysPressed['s']) {
            transform = "scaleY(-1)";
        }
    } else if (lastDirection === 'horizontal') {
        if (horizontalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-horizontal-1.png')";
        } else {
            backgroundImage = "url('monty-horizontal-2.png')";
        }
        if (keysPressed['ArrowRight'] || keysPressed['d']) {
            transform = "scaleX(-1)";
        }
    } else if (lastDirection === 'up-left') {
        if (horizontalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-horizontal-1.png')";
        } else {
            backgroundImage = "url('monty-horizontal-2.png')";
        }
        transform = "scaleX(-1)";
    } else if (lastDirection === 'up-right') {
        if (horizontalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-horizontal-1.png')";
        } else {
            backgroundImage = "url('monty-horizontal-2.png')";
        }
        transform = ""; // No flip needed for basic 'right' facing
    } else if (lastDirection === 'down-left') {
        if (horizontalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-horizontal-1.png')";
        } else {
            backgroundImage = "url('monty-horizontal-2.png')";
        }
        transform = "scaleX(-1) scaleY(-1)";
    } else if (lastDirection === 'down-right') {
        if (horizontalMoveCounter % animationCycle < animationCycle / 2) {
            backgroundImage = "url('monty-horizontal-1.png')";
        } else {
            backgroundImage = "url('monty-horizontal-2.png')";
        }
        transform = "scaleY(-1)"; // Assuming the base horizontal faces left, flipping Y makes it down-left, so we need to NOT flip X here. Adjust if your base horizontal faces right.
    } else {
        backgroundImage = "url('monty-default.png')";
    }

    playerElement.style.backgroundImage = backgroundImage;
    playerElement.style.transform = transform;
    playerElement.style.backgroundSize = 'contain';
    playerElement.style.backgroundRepeat = 'no-repeat';
}
function updatePlayerPosition() {
    if (!testingConvoPause && isMoving) {
        playerElement.style.left = playerX + 'px';
        playerElement.style.top = playerY + 'px';
        updatePlayerAppearance();
        checkProximity();
    } else if (!isMoving) {
        lastDirection = null;
        updatePlayerAppearance();
    }
}

function renderDotPosition() {
    targetDot.style.left = dotX + 'px';
    targetDot.style.top = dotY + 'px';
}

function getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

async function handleProximityReached() {
    if (!testingConvoPause) {
        testingConvoPause = true;
        console.log("PROXIMITY TRUE! Initiating chat with Miss Java.");
        window.showChatbox(); // Call the global function
    }
}

function checkProximity() {
    const playerCenter = getElementCenter(playerElement);
    const dotCenter = getElementCenter(targetDot);
    const distanceX = Math.abs(playerCenter.x - dotCenter.x);
    const distanceY = Math.abs(playerCenter.y - dotCenter.y);

    if (distanceX < proximityThreshold && distanceY < proximityThreshold) {
        handleProximityReached();
    } else if (testingConvoPause) {
        testingConvoPause = false;
        window.hideChatbox(); // Call the global function
        console.log("PROXIMITY FALSE! Movement resumed.");
    }
}

async function callGeminiAPIAsMissJava(userPrompt) {
    const characterName = "Miss Java";
    const characterDescription = "A grumpy lady who's desire is to give the user a riddle while mainly testing their composure.";
    const fullPrompt = `The user says: "${userPrompt}".
        Your primary goal is to test the user's composure while casually presenting a riddle as ${characterDescription}
        First, present the following riddle: "Not so fast, validate your skills. My web is an endless loop of thrills. What is another word for the state of my web?"
        The correct answer is an infinite loop (or a very similar concept).
        CRUCIAL: After the user's first response to the riddle, do not ask it again. Focus on reacting to their answer and maintaining the conversation as yoour persona.
        If the user answers the riddle incorrectly, your ONLY response should be a short phrase ending with "Silly bug." Do not repeat the riddle.
        If the user answers the riddle correctly with a neutral or indifferent tone, acknowledge their answer briefly and say goodbye with a hint that they are overlooking their own flaws (the "bug" within). End the interaction.
        If the user answers the riddle correctly and respectfully, acknowledge their intelligence and perhaps offer a small compliment. Then, without ending the turn, reveal a piece of insider information about the "bug" that has taken over the Woods, hinting at a connection between the user and the bug. Do not repeat the riddle.`;
        try {
            const response = await fetch('netlify/functions/gemini.mjs', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ prompt: fullPrompt }),
            });
        
            if (!response.ok) {
              const errorData = await response.json();
              console.error("Error from Netlify Function:", errorData);
              window.addChatMessage(`Error from Gemini: ${errorData.error || 'Failed to get response'}`, 'bot');
              return;
            }
        
            const data = await response.json();
            const geminiResponse = data.response;
        
            if (geminiResponse) {
              window.addChatMessage(geminiResponse, 'bot');
              if (geminiResponse.toLowerCase().includes("silly bug")) {
                window.hideChatbox();
                testingConvoPause = false;
                console.log("Miss Java said 'silly bug', ending chat.");
              }
            }
          } catch (error) {
            console.error("Error calling Netlify Function:", error);
            window.addChatMessage(`Error communicating with Gemini.`, 'bot');
          }
        }
        
        // Make callGeminiAPIAsMissJava accessible globally
        window.sendMessageToGemini = callGeminiAPIAsMissJava;

const keysPressed = {};
document.addEventListener('keydown', (event) => {
    if (!testingConvoPause) {
        keysPressed[event.key] = true;
        isMoving = true;
    }
});
document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
    const movingKeys = ['ArrowUp', 'w', 'ArrowDown', 's', 'ArrowLeft', 'a', 'ArrowRight', 'd'];
    isMoving = movingKeys.some(key => keysPressed[key]);
});

let moveAccumulatorX = 0;
let moveAccumulatorY = 0;
function gameLoop() {
    if (!testingConvoPause) {
        let moved = false;
        let dx = 0;
        let dy = 0;

        if (keysPressed['ArrowUp'] || keysPressed['w']) {
            dy -= moveSpeed / 10;
        }
        if (keysPressed['ArrowDown'] || keysPressed['s']) {
            dy += moveSpeed / 10;
        }
        if (keysPressed['ArrowLeft'] || keysPressed['a']) {
            dx -= moveSpeed / 10;
        }
        if (keysPressed['ArrowRight'] || keysPressed['d']) {
            dx += moveSpeed / 10;
        }

        // Normalize diagonal speed
        if (dx !== 0 && dy !== 0) {
            const diagonalSpeedFactor = 1 / Math.sqrt(2);
            moveAccumulatorX += dx * diagonalSpeedFactor;
            moveAccumulatorY += dy * diagonalSpeedFactor;
        } else {
            moveAccumulatorX += dx;
            moveAccumulatorY += dy;
        }

        let actualMoveX = Math.floor(moveAccumulatorX);
        let actualMoveY = Math.floor(moveAccumulatorY);

        if (Math.abs(actualMoveX) >= 1) {
            playerX += actualMoveX;
            horizontalMoveCounter += Math.abs(actualMoveX);
            moveAccumulatorX -= actualMoveX;
            moved = true;
        }
        if (Math.abs(actualMoveY) >= 1) {
            playerY += actualMoveY;
            verticalMoveCounter += Math.abs(actualMoveY);
            moveAccumulatorY -= actualMoveY;
            moved = true;
        }

        // Update lastDirection for diagonal movement (more robust)
        if (keysPressed['ArrowUp'] || keysPressed['w']) {
            if (keysPressed['ArrowLeft'] || keysPressed['a']) lastDirection = 'up-left';
            else if (keysPressed['ArrowRight'] || keysPressed['d']) lastDirection = 'up-right';
            else lastDirection = 'vertical';
        } else if (keysPressed['ArrowDown'] || keysPressed['s']) {
            if (keysPressed['ArrowLeft'] || keysPressed['a']) lastDirection = 'down-left';
            else if (keysPressed['ArrowRight'] || keysPressed['d']) lastDirection = 'down-right';
            else lastDirection = 'vertical';
        } else if (keysPressed['ArrowLeft'] || keysPressed['a']) {
            lastDirection = 'horizontal';
        } else if (keysPressed['ArrowRight'] || keysPressed['d']) {
            lastDirection = 'horizontal';
        } else if (!isMoving) {
            lastDirection = null;
        }

        if (moved) {
            updatePlayerPosition();
        } else if (!isMoving) {
            updatePlayerAppearance();
        }
    }
    requestAnimationFrame(gameLoop);
}

// Initial calls
updatePlayerAppearance();
updatePlayerPosition();
renderDotPosition();

// Start the game loop
requestAnimationFrame(gameLoop);