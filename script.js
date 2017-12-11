//window.onload = function () {
    /* ===================== Data ===================== */
    function Ball(xx, yy, rad) {
        this.x = (xx) ? xx : 0;
        this.y = (yy) ? yy : 0;
        this.radius = (rad) ? rad : 10;
    }

    function Paddle(xx, yy, width, height) {
        this.x = (xx) ? xx : 0;
        this.y = (yy) ? yy : 0;
        this.height = (height) ? height : 10;
        this.width = (width) ? width : 100;
    }

    function Brick(x, y, width, height) {
        this.x = (x) ? x : 0;
        this.y = (y) ? y : 0;
        this.width = (width) ? width : 50;
        this.height = (height) ? height : 20;
        this.status = 1;
    }

    // game variables
    var b_init_speed = 4.4,
        b_dx,
        b_dy,
        b_speedIncrease,
        paddle_dx,

        brick_rows,
        brick_col,
        brick_width,
        brick_height,
        brick_padding,
        brick_offset_top,
        brick_offset_left,
        dificulty,
        score,
        lives,
        paddle,
        ball,
        bricks,
        paddle_w = 100,
        secondsToSpeedIncrease = 3,
        runTime,
        startTime;

    // controls
    var right_pressed = false;
    var left_pressed = false;
    var pause;
    var gameLoopTimer;

    /* Refferences */
    var restartGameBtn = document.getElementById("restart-btn");
    var buttonsBar = document.getElementById("gameButtons");
    var lightboxButtonOpenList = document.getElementsByClassName("open-lb");
    var lightboxButtonCloseList = document.getElementsByClassName("close-lb");
    var applySettingsBtn = document.getElementById("apply-btn");
    var canvas = document.getElementById("gameCanvas");     /* Game canvas */
    var ctx = canvas.getContext("2d");                      /* Game context (2d) */






















    /* ===================== Game logic ===================== */


    /* Make the canvas full screen */
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight - parseInt(window.getComputedStyle(buttonsBar).getPropertyValue("height"));
    addEventListeners();
    startGame();













































    /* ===================== Functions ===================== */



    function startGame() {
        computeValues();
        runTime = 0;
        startTime = Date.now();
        gameLoopTimer = window.requestAnimationFrame(gameLoop);
    }

    function restartGame() {
        window.cancelAnimationFrame(gameLoopTimer);	// First we stop the animation request made earlier then start another one
        startGame();
    }

    function addEventListeners() {
        /* Event listeners */
        document.addEventListener("mousemove", mouseMoveHandler, false);
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);
        document.getElementById("playPause").addEventListener("click", togglePause, false);
        document.getElementById("settings").addEventListener("click", function () {
            pause = true;
        }, false);

        restartGameBtn.addEventListener("click", restartGame, false);
        applySettingsBtn.addEventListener("click", function () {
            setOnLocalStorage();    // save settings on local storage

            var newThis = document.getElementById("close-settings-btn");
            toggleLightbox.bind(newThis)();
            //boundToggleLb();
            restartGame();
        }, false);

        for (let i = 0; i < lightboxButtonOpenList.length; i++) {
            lightboxButtonOpenList[i].addEventListener("click", toggleLightbox, false);
        }

        for (let i = 0; i < lightboxButtonCloseList.length; i++) {
            lightboxButtonCloseList[i].addEventListener("click", toggleLightbox, false);
        }
    }

    function setOnLocalStorage() {
        if (typeof (Storage) !== "undefined") {

            var input_rows = document.getElementById("input-lines").value;
            window.localStorage.setItem("input_rows", input_rows);

            var input_bwidth = document.getElementById("input-bwidth").value;
            window.localStorage.setItem("input_bwidth", input_bwidth);

            var input_bheight = document.getElementById("input-bheight").value;
            window.localStorage.setItem("input_bheight", input_bheight);

            var listCheckbox = document.getElementById("dificulty-wrap").querySelectorAll('[type="radio"]');    // we get all the dificulty checkboxes

            // dificulty is 1 for easy, 2 for medium, 3 for hard
            listCheckbox.forEach(function (item) {
                if (item.checked = true) {
                    switch (item.value) {
                        case "easy":
                            dificulty = 1;
                            break;
                        case "medium":
                            dificulty = 2;
                            break;
                        case "hard":
                            dificulty = 3;
                            break;
                        default:
                            dificulty = 1;
                    }
                }
            });
            window.localStorage.setItem("dificulty", dificulty);

        } else {
            alert("Sorry your browser doesn't support local storage, you can't use options.");
        }
    }

    function computeValues() {


        brick_rows = (typeof (Storage) !== "undefined" && window.localStorage.input_rows) ? parseInt(window.localStorage.input_rows) : 3;
        brick_width = (typeof (Storage) !== "undefined" && window.localStorage.input_bwidth) ? parseInt(window.localStorage.input_bwidth) : 80;
        brick_height = (typeof (Storage) !== "undefined" && window.localStorage.input_bheight) ? parseInt(window.localStorage.input_bheight) : 15;
        dificulty = (typeof (Storage) !== "undefined" && window.localStorage.dificulty) ? parseInt(window.localStorage.dificulty) : 1;

        switch (dificulty) {
            case "1":
                b_speedIncrease = 0.5;
                break;
            case "2":
                b_speedIncrease = 0.7;
                break;
            case "3":
                b_speedIncrease = 1;
                break;
        }

        pause = true;
        score = 0;
        lives = 3;
        brick_padding = 10;
        brick_offset_top = brick_offset_left = 30;
        b_dx = b_init_speed;
        b_dy = -b_init_speed;

        /* Create paddle, ball, and our bricks */
        paddle = new Paddle(canvas.width / 2 - (paddle_w / 2), canvas.height - 30, paddle_w);
        ball = new Ball(paddle.x + paddle.width / 2, paddle.y);

        bricks = new Array();
        brick_col = Math.floor(ctx.canvas.width / (brick_width + brick_padding)) - 1;

        for (let i = 0; i < brick_rows; i++) {
            bricks[i] = new Array();
            for (let j = 0; j < brick_col; j++) {
                let brickx = j * (brick_padding + brick_width) + brick_offset_left;
                let bricky = i * (brick_padding + brick_height) + brick_offset_top;

                bricks[i][j] = new Brick(brickx, bricky, brick_width, brick_height);
            }
        }
    }

    function drawBall(ball, color) {
        // drawing the ball

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = (color) ? color : "#0095DD";
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle(paddle, color) {
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


        if (ball.x + b_dx > canvas.width - ball.radius || ball.x + b_dx < ball.radius) {
            // check for colision with left or right margins
            b_dx = -b_dx;
        }

        if (((ball.y + b_dy > canvas.height - ball.radius - paddle.height) && (ball.x > paddle.x && ball.x < paddle.x + paddle.width)) || (ball.y + b_dy < ball.radius)) {
            // check if ball is hitting the paddle or the top margin , if so , change y direction
            b_dy = -b_dy;
        } else if ((ball.y + b_dy > canvas.height - ball.radius) && !(ball.x > paddle.x && ball.x < paddle.x + paddle.width)) {
            // check if ball drops down , and lose a life ,or lose the game
            lives--;
            if (!lives) {
                alert("GAME OVER");
                document.location.reload();
            } else {
                ball.x = canvas.width / 2;
                ball.y = canvas.height - 30;
                b_dx = b_init_speed;
                b_dy = -b_init_speed;
                paddle.x = (canvas.width - paddle.width) / 2;
            }
        }


        for (let i = 0; i < brick_rows; i++) {
            for (let j = 0; j < brick_col; j++) {
                let b = bricks[i][j];
                if (b.status == 1 && (ball.x > b.x && ball.x < b.x + brick_width && ball.y > b.y && ball.y < b.y + brick_height)) {
                    b_dy = -b_dy;
                    bricks[i][j].status = 0;
                    score++;
                    if (score == brick_rows * brick_col) {
                        alert("YOU WIN, CONGRATULATIONS!");
                        pause = true;
                        document.location.reload();
                    }
                }
            }
        }
    }

    function drawScore() {
        ctx.font = "16px Neuropol";
        ctx.fillStyle = "#0095DD";
        ctx.fillText("Score: " + score, 8, 20);
    }

    function drawText(string, posx, posy, size) {
        if (string && posx && posy) {
            let ss = (size) ? size : 16;
            ctx.font = ss + "px Neuropol";
            ctx.fillStyle = "#0095DD";
            ctx.fillText(string, posx, posy);
        }
    }

    function drawLives() {
        ctx.font = "16px Neuropol";
        ctx.fillStyle = "#0095DD";
        ctx.fillText("Lives: " + lives, canvas.width - 100, 20);
    }

    function gameLoop() {

        // Main game loop 
        gameLoopTimer = requestAnimationFrame(gameLoop);

        // increase speed if it's time
        var currentTime = Date.now();
        if (((currentTime - startTime) / 60) % secondsToSpeedIncrease) {
            b_dx += b_speedIncrease;
            b_dy -= b_speedIncrease;
        }

        // drawing code
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLives();
        drawScore();
        drawBall(ball, "red");
        drawPaddle(paddle);
        drawBricks();

        if (!pause) {

            collisionDetection();

            if (right_pressed && paddle.x < ctx.canvas.width - paddle.width) {
                paddle.x += paddle_dx;
            } else if (left_pressed && paddle.x > 0) {
                paddle.x -= paddle_dx;
            }

            ball.x += b_dx;
            ball.y += b_dy;
        }
    }

    function keyDownHandler(e) {
        if (e.keyCode == 39) {
            right_pressed = true;
        } else if (e.keyCode == 37) {
            left_pressed = true;
        }
    }

    function keyUpHandler(e) {
        if (e.keyCode == 39) {
            right_pressed = false;
        } else if (e.keyCode == 37) {
            left_pressed = false;
        }
    }

    function mouseMoveHandler(e) {
        var relativeX = e.clientX - canvas.offsetLeft;
        if (!pause && relativeX > 0 && relativeX < canvas.width) {
            paddle.x = relativeX - paddle.width / 2;
        }
    }

    function togglePause() {
        if (pause === true) {
            pause = false;
        } else {
            pause = true;
        }
    }

    function toggleLightbox() {

        console.log(this);
        let actionOnName = this.getAttribute("data-action-on");
        let actionOn = document.querySelector('[data-action-src ="' + actionOnName + '"]');
        if (actionOn.classList.contains("lb-closed")) {
            // we close
            actionOn.classList.remove("lb-closed");
            actionOn.classList.add("lb-open");
        } else {
            // we open
            actionOn.classList.remove("lb-open");
            actionOn.classList.add("lb-closed");

        }
    }
//}
