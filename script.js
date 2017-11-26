/* ===================== Data ===================== */

function Ball(xx,yy,rad) {
	this.x = (xx)?xx:0;
	this.y = (yy)?yy:0;
	this.radius = (rad)?rad:10;
}

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var ball = new Ball(ctx.canvas.width / 2,ctx.canvas.height - 30);
var dx = 2;
var dy = -2;








/* ===================== Game logic ===================== */

ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;

setInterval(draw, 10);








/* ===================== Functions ===================== */

function drawBall(ball,color) {
	// drawing the ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function draw() {
    // drawing code
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBall(ball,"#0095DD");

	
	if(ball.x + dx > canvas.width-ball.radius || ball.x + dx < ball.radius) {
        dx = -dx;
    }
    if(ball.y + dy > canvas.height-ball.radius || ball.y + dy < ball.radius) {
        dy = -dy;
    }

	ball.x+=dx;
	ball.y+=dy;
}