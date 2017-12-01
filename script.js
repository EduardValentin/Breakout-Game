/* ===================== Data ===================== */

function Ball(xx,yy,rad) {
    this.x = (xx) ? xx : 0;
    this.y = (yy) ? yy : 0;
    this.radius = (rad) ? rad : 10;
}

function Paddle(xx, yy, height,width) {
    this.x = (xx) ? xx : 0;
    this.y = (yy) ? yy : 0;
    this.height = (height) ? height : 10;
    this.width = (width) ? width : 100;
}

function Brick(x,y,width, height) {
    this.x = (x) ? x : 0;
    this.y = (y) ? y : 0;
    this.width = (width) ? width : 50;
    this.height = (height) ? height : 20;
    this.status = 1;
}

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");



var dx = 1;
var dy = -1;
var paddle_dx = 8;

var brick_rows = 3;
var brick_col = 30;
var brick_width = 50;
var brick_height = 20;
var brick_padding = 10;
var brick_offset_top = 30;
var brick_offset_left = 30;
var score = 0;
var lives = 3;

// controls
var right_pressed = false;
var left_pressed = false;
var pause = true;



/* ===================== Game logic ===================== */


    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    var paddle = new Paddle(canvas.width / 2, canvas.height - 30);
    var ball = new Ball(paddle.x + paddle.width / 2, canvas.height - paddle.height - 50);

    document.addEventListener("mousemove", mouseMoveHandler, false);
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    var bricks = new Array();

    for (let i = 0; i < brick_rows; i++) {
        bricks[i] = new Array();
        for (let j = 0; j < brick_col; j++) {
            let brickx = j * (brick_padding + brick_width) + brick_offset_left;
            let bricky = i * (brick_padding + brick_height) + brick_offset_top;

            bricks[i][j] = new Brick(brickx, bricky, brick_width, brick_height);
        }
    }

    setInterval(draw, 1/60);


/* ===================== Functions ===================== */

function drawBall(ball,color) {
    // drawing the ball

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = (color) ? color : "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(paddle,color) {
    ctx.beginPath();
    ctx.rect(paddle.x, ctx.canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = (color) ? color : "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks(color) {
    for (let i = 0; i < brick_rows; i++) {
        for (let j = 0; j < brick_col; j++) {
            if (bricks[i][j].status == 1) {
                ctx.beginPath();
                ctx.rect(bricks[i][j].x, bricks[i][j].y, brick_width, brick_height);
                ctx.fillStyle = (color) ? color : "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let i = 0; i < brick_rows; i++) {
        for (let j = 0; j < brick_col; j++) {
            let b = bricks[i][j];
            if (b.status == 1 && (ball.x > b.x && ball.x < b.x + brick_width && ball.y > b.y && ball.y < b.y + brick_height)) {
                dy = -dy;
                bricks[i][j].status = 0;
                score++;
                if(score == brick_rows*brick_col) {
                    alert("YOU WIN, CONGRATULATIONS!");
                    pause = true;
                    document.location.reload();
                }
            }
        }
    }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: "+ score, 8, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: "+ lives, canvas.width-65, 20);
}

function draw() {
    // drawing code
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLives();
    drawScore();
    drawBall(ball);
    drawPaddle(paddle);
    drawBricks();
    collisionDetection();

    if (right_pressed && paddle.x < ctx.canvas.width - paddle.width) {
        paddle.x += paddle_dx;
    }
    else if (left_pressed && paddle.x > 0) {
        paddle.x -= paddle_dx;
    }

    if(ball.x + dx > canvas.width-ball.radius || ball.x + dx < ball.radius) {
        dx = -dx;
    }

    if (((ball.y + dy > canvas.height - ball.radius - paddle.height) && (ball.x > paddle.x && ball.x < paddle.x + paddle.width)) || (ball.y+dy < ball.radius)) {
        dy = -dy;
    } else if((ball.y + dy > canvas.height - ball.radius) && !(ball.x > paddle.x && ball.x < paddle.x + paddle.width)){

        lives--;
        if(!lives) {
            alert("GAME OVER");
            document.location.reload();
        }
        else {
            ball.x = canvas.width/2;
            ball.y = canvas.height-30;
            dx = 1;
            dy = -1;
            paddle.x = (canvas.width-paddle.width)/2;
        }
    }

  if (!pause) {
    ball.x+=dx;
  	ball.y+=dy;
  }
}

function keyDownHandler(e) {
    console.log("down");

    if (e.keyCode == 39) {
        right_pressed = true;
    }
    else if (e.keyCode == 37) {
        left_pressed = true;
    }
}

function keyUpHandler(e) {
    console.log("up");
    if (e.keyCode == 39) {
        right_pressed = false;
    }
    else if (e.keyCode == 37) {
        left_pressed = false;
    }
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width/2;
    }
}
