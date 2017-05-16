const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;


const JUMP_HEIGHT = 100;
const STEP = 1;
const INIT_JUMP_SPEED = -4;

const canvasWidth = 480;
const canvasHeight = 480;
const ballRadius = 10;

const BAD_GUY_WIDTH = 30;
const BAD_GUY_HEIGHT = 30;

const LIVE_BAD_GUY_COLOR = '#00ff00';
const DEAD_BAD_GUY_COLOR = '#0000ff';
const LIVE_PLAYER_COLOR = '#ff0000';
const DEAD_PLAYER_COLOR = '#ababab';

let badGuyX = canvasWidth - BAD_GUY_WIDTH - 100;
let badGuyY = canvasHeight - BAD_GUY_HEIGHT;
let gameLoop;


function initGame() {
  ballX = canvasWidth / 2;
  ballY = 0;

  badGuyStep = 0;



  leftDown = false;
  rightDown = false;
  moveInterval = null;

  inJump = false;

  fallSpeed = 0;
  jumpSpeed = 0;
  freeFall = true;
  badGuyDead = false;
  isPlayerDead = false;
  gameLoop = setInterval(render, 10);
}


let ballX = canvasWidth / 2;
let ballY = 0;

let badGuyStep = 0;



let leftDown = false;
let rightDown = false;
let moveInterval = null;

let inJump = false;

let fallSpeed = 0;
let jumpSpeed = 0;
let freeFall = true;
let badGuyDead = false;
let isPlayerDead = false;


function killedBadGuy() {
  if (badGuyDead) return;
  if (ballY + ballRadius === badGuyY && ballX > badGuyX && ballX < (badGuyX + BAD_GUY_WIDTH)) {
    badGuyDead = true;
    alert('you win');
  }
}

function playerDead() {
  if (isPlayerDead) return;
  if (ballY + ballRadius > badGuyY && (ballX + ballRadius >= badGuyX && ballX - ballRadius <= badGuyX + BAD_GUY_WIDTH)) {
   isPlayerDead = true;
   alert('you lose');
  }
}

function isCollisionWithBadGuy(ballPosition, badGuyPosition) {
  if (ballPosition.y < badGuyPosition.y || (ballPosition.x + ballRadius < badGuyPosition.x || ballPosition.x - ballRadius > badGuyPosition.x + BAD_GUY_WIDTH)) {
    return false;
  }
  if (leftDown) {
    return ballPosition.x === badGuyPosition.x + BAD_GUY_WIDTH;
  }
  if (rightDown) {
    return ballPosition.x === badGuyPosition.x;
  }
  return true;
}

function moveLoop() {
  if (leftDown) {
    const expectedBallPosition = ballX - ballRadius - STEP;

    if (expectedBallPosition > 0 && !isCollisionWithBadGuy(
      { x: expectedBallPosition, y: ballY },
      { x: badGuyX, y: badGuyY }
    )) {
      ballX -= STEP;  
    }
    
  }
  if (rightDown){
    const expectedBallPosition = ballX + ballRadius + STEP;
    if (expectedBallPosition < canvasWidth && !isCollisionWithBadGuy(
      { x: expectedBallPosition, y: ballY },
      { x: badGuyX, y: badGuyY }
    )) {
        ballX += STEP;
    }
  }
  playerDead();
}

(function moveLoopBadGuy() {
  const expectedBadGuyPosition = badGuyX + badGuyStep;
  if (badGuyStep > 0) {
    badGuyX = Math.min(expectedBadGuyPosition, canvasWidth - BAD_GUY_WIDTH);
  }
  if (badGuyStep < 0) {
    badGuyX = Math.max(expectedBadGuyPosition, 0);
  }
  playerDead();
  setTimeout(moveLoopBadGuy, 10);
})();

function jump() {
  if (fallSpeed >= 0) {
    return;
  }
  ballY += fallSpeed;
  setTimeout(jump, 10);
}

function fall() {
  if (!inJump) {
    freeFall = true;
    let maxY = canvasHeight - ballRadius;
    if (ballX + ballRadius > badGuyX && ballX - ballRadius < badGuyX + BAD_GUY_HEIGHT) {
      maxY = canvasHeight - BAD_GUY_HEIGHT - ballRadius;
    }
    if (ballY <= maxY) {
      ballY = Math.min(ballY + fallSpeed, maxY);
    }
    if (ballY === maxY) {
      freeFall = false;
    }
    killedBadGuy();
  }
}

(function gravity() {
  if (freeFall) {
    fallSpeed++;
  } else {
    fallSpeed = 0;
  }
  setTimeout(gravity, 100);
})()

function moveBadGuy() {
  badGuyStep = Math.random() * (4 - (-4)) + (-4);
  setTimeout(moveBadGuy, 500);
}
moveBadGuy();

function drawPlayer() {
   // Draw player
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
  ctx.fillStyle = isPlayerDead ? DEAD_PLAYER_COLOR : LIVE_PLAYER_COLOR;
  ctx.fill();
  ctx.closePath(); 
}

function drawBadguy() {
  // Draw bad guy
  ctx.beginPath();
  ctx.rect(badGuyX, badGuyY, BAD_GUY_WIDTH, BAD_GUY_HEIGHT);
  ctx.fillStyle = badGuyDead ? DEAD_BAD_GUY_COLOR : LIVE_BAD_GUY_COLOR;
  ctx.fill();
  ctx.closePath();  
}

function render() {
  ctx.clearRect(0,0,canvasWidth,canvasHeight);
  fall();
  drawPlayer();
  drawBadguy();
  if (isPlayerDead || badGuyDead) {
    window.clearInterval(gameLoop);
  }
}
initGame();


window.addEventListener('keydown', function (event){
  if (fallSpeed === 0 && event.keyCode === ARROW_UP) {
    fallSpeed = INIT_JUMP_SPEED;
    jump();
  }
  if (leftDown || rightDown) {
    return;
  }
  leftDown = event.keyCode === ARROW_LEFT;
  rightDown = event.keyCode === ARROW_RIGHT;
  if (leftDown || rightDown) {
    moveInterval = setInterval(moveLoop, 10);  
  }
});

window.addEventListener('keyup', function() {
  if (event.keyCode === ARROW_LEFT || event.keyCode === ARROW_RIGHT) {
    leftDown = rightDown = false;
    clearInterval(moveInterval);
  }
});

const restartButton = document.getElementById('restart')
restartButton.addEventListener('click', () => {
  window.clearInterval(gameLoop);
  initGame();
})