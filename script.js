
    /* ===================== Data ===================== */
    function Ball(xx, yy, rad,pimg) {
        this.x = (xx) ? xx : 0;
        this.y = (yy) ? yy : 0;
        this.radius = (rad) ? rad : 10;
        this.img = (pimg) ? pimg : undefined;
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
        this.status = 1;	// 1 = broken, 0 else
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
        paddle_h = 10,
        ball,
        ball_r = 12,
        bricks,
        paddle_w = 100,
        secondsToSpeedIncrease = 8,
        secondsToPowerUp = 20,
        frames,
        startTime,
        iddlePowerUp,
        powerUpAtSecond,
        powerUpsActive,
        bricksActive;

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

    var speedLevels = [0.50,0.60,0.70];
    var speedLimits = [3.5,4,6];					// after how many speed increases to stop increasing speed
    var speedIncreasedBy = 0;

    var runtime = {
    	cnt : 0,
    	get seconds() {
    		return this.cnt;
    	},
    	set seconds(frames) {
    		this.cnt = Math.floor(frames/60);
    	}
    }

    var iddleSpdInc,
    	spdIncreasedAtSecond;		// second at wich last speed increase occured












    /* ===================== Game logic ===================== */


    /* Make the canvas full screen */
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight - parseInt(window.getComputedStyle(buttonsBar).getPropertyValue("height"));
    addEventListeners();
    startGame();













































    /* ===================== Functions ===================== */



    function startGame() {
        computeValues();
        frames = 0;
        gameLoopTimer = window.requestAnimationFrame(gameLoop);
    }

    function restartGame() {
    	removePopUp();
        document.getElementById("playPause").addEventListener("click", togglePause, false);
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
        	if(document.getElementById("drop-ball").firstChild) {

	        	var input_ballID = document.getElementById("drop-ball").firstChild.id;
	        	if(input_ballID)
	        		window.localStorage.setItem("input_ballID",input_ballID);
        	}
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
                            dificulty = 0;
                            break;
                        case "medium":
                            dificulty = 1;
                            break;
                        case "hard":
                            dificulty = 2;
                            break;
                        default:
                            dificulty = 0;
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
        dificulty = (typeof (Storage) !== "undefined" && window.localStorage.dificulty) ? parseInt(window.localStorage.dificulty) : 0;

        if(typeof(Storage) !== "undefined") {
        	document.getElementById("input-lines").value = window.localStorage.input_rows;
        	document.getElementById("input-bwidth").value = window.localStorage.input_bwidth;
        	document.getElementById("input-bheight").value = window.localStorage.input_bheight;
        	
        	switch (dificulty) {
        		case 0:
        			document.getElementById("easy").checked = true;
        			break;
        		case 1:
        			document.getElementById("medium").checked = true;
        			break;
        		case 2:
        			document.getElementById("hard").checked = true;
        			break;
        		default:
        			document.getElementById("easy").checked = true;
        	}
        }

        pause = true;
        score = 0;
        lives = 3;
        brick_padding = 10;
        speedIncreasedBy = 0;
        brick_offset_top = brick_offset_left = 30;
        b_dx = b_init_speed;
        b_dy = -b_init_speed;
        iddleSpdInc = false;
        iddlePowerUp = false;
        speedIncreasedAtSecond = 0;
        powerUpsActive = 0;

        /* Create paddle, ball, and our bricks */
        paddle = new Paddle(canvas.width / 2 - (paddle_w / 2), canvas.height - paddle_h, paddle_w, paddle_h);
		
		var tempImg;

		if(window.localStorage.input_ballID) {
			tempImg = document.getElementById(window.localStorage.input_ballID);
		} else {
			tempImg = new Image();
			tempImg.src = "assets/svg/tennis.svg";
		}     
        
        ball = new Ball(paddle.x + paddle.width / 2, paddle.y - 2*ball_r,ball_r,tempImg);

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

        bricksActive = brick_col * brick_rows;
    }

    function drawBall(ball, color) {
        // drawing the ball
        ctx.drawImage(ball.img, ball.x,ball.y,ball.radius*2,ball.radius*2);
    }

    function drawPaddle(paddle, color) {
        ctx.beginPath();
        ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
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
                    
                    let tempColor = color;

                    if(bricks[i][j].hasOwnProperty("powerUp"))
                    	tempColor = "yellow";

                    ctx.fillStyle = (tempColor) ? tempColor : "#0095DD";
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
            if (lives <= 0) {
            	pause = true;
                let popup = createPopUp("You lose, try again!");
                let nodeToRemove = document.getElementById("close-popup");
        		
        		document.getElementById("playPause").removeEventListener("click", togglePause);

                popup.firstChild.removeChild(nodeToRemove);
                //document.location.reload();
            } else {
                ball.x = canvas.width / 2;
                ball.y = canvas.height - 30;
                speedIncreasedBy = 0;
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
                    bricksActive--;

                    if(b.hasOwnProperty("powerUp"))
                    	b.powerUp();

                    if (bricksActive == 0) {
                        pause = true;
                        let popup = createPopUp("You win, congratulations man!");
                		let nodeToRemove = document.getElementById("close-popup");
        				document.getElementById("playPause").removeEventListener("click", togglePause);
                		popup.firstChild.removeChild(nodeToRemove);
                        //document.location.reload();
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
        /*
			Main idea for increasing ball speed with respect to time:
				-> if the number of seconds of actualy playing the game modulo the seconds at wich we change dificulty is equal to 0 that means it's time to increase ball speed
				-> after we increase ball speed we need to keep an idle state to prevent ball increasing speed at every frame, because there are 60 frames in a second by the time a second passes the ball speed would increase 60 times -> not correct
				-> after one second of iddle state we relase the iddle state  
        */

        if(iddleSpdInc && runtime.seconds - speedIncreasedAtSecond >= 1) {
        	// if we are in iddle state we should check if one second has passed 
        	iddleSpdInc = false;
        }

        if(iddlePowerUp && runtime.seconds - powerUpAtSecond >= 1) {
        	// if we are in iddle state we should check if one second has passed 
        	iddlePowerUp = false;
        }

        if(!iddleSpdInc && runtime.seconds != 0 && (speedIncreasedBy < speedLimits[dificulty]) && (runtime.seconds % secondsToSpeedIncrease == 0)) {
        	// see the direction where the ball is moving and augment that by speedIncrease factor if it's possible
        	iddleSpdInc = true;

        	if(b_dx < 0)
        		b_dx -= speedLevels[dificulty];
        	  else 
        		b_dx += speedLevels[dificulty];
        	

        	if(b_dy < 0)
        		b_dy -= speedLevels[dificulty];
        	  else 
        		b_dy += speedLevels[dificulty];
        	
        	speedIncreasedBy += speedLevels[dificulty];
        	speedIncreasedAtSecond = runtime.seconds;	// important
        }

        if(powerUpsActive < 5 && !iddlePowerUp && runtime.seconds && (runtime.seconds % secondsToPowerUp) == 0) {
        	let ok = false;
        	iddlePowerUp = true;
        	do {

				let randCol = getRandomInt(0,brick_col-1);
        		let randRow = getRandomInt(0,brick_rows-1);
        		
        		if(bricks[randRow][randCol].status == 1 && !bricks[randRow][randCol].hasOwnProperty("powerUp")) {
        			bricks[randRow][randCol].powerUp = function() {
        				score+=10;			// easy money
        			}

        			ok = true;
        			powerUpsActive++;
        		}
        	} while(!ok);

        	powerUpAtSecond = runtime.seconds;
        }

        // drawing code
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLives();
        drawScore();
        drawBall(ball);
        drawPaddle(paddle,"#324a5e");
        drawBricks();
        
        if (!pause) {
       		
       		frames++;					// the number of frames spent actualy playing, we need this to time things in game like power ups
       		runtime.seconds = frames;	// transforms frames into frames/60 by a setter 

            collisionDetection();

            if (right_pressed && paddle.x < ctx.canvas.width - paddle.width) {
                paddle.x += paddle_dx;
            } else if (left_pressed && paddle.x > 0) {
                paddle.x -= paddle_dx;
            }

            ball.x += b_dx;
            ball.y += b_dy;
        }
        
        gameLoopTimer = requestAnimationFrame(gameLoop);

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
        	removePopUp();
            pause = false;
        } else {
        	var popUpReference = createPopUp("pause.")
            pause = true;
        }
    }

    function toggleLightbox() {

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

    function getRandomInt(min, max) {
    	return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function allowDrop(ev) {
		ev.preventDefault();
	}

	function dragBall(ev) {
		ev.dataTransfer.setData("text",ev.target.id);
	}

	function dropBall(ev) {
		ev.preventDefault();
		var dropSourceNode = document.getElementById("drop-ball");
		
		// first we remove any prevoius selected ball
		if(dropSourceNode.firstChild) {
			let nodeToRemove = dropSourceNode.querySelector("img");
			dropSourceNode.removeChild(nodeToRemove);
		}

		var imgID = ev.dataTransfer.getData("text");
		var sourceImage = document.getElementById(imgID);
		var clone = sourceImage.cloneNode();
		dropSourceNode.appendChild(clone);
	}

	function removePopUp() {
		var nodeToRemove = document.getElementById("pop-up");
       	if(nodeToRemove)
       		document.body.removeChild(nodeToRemove);
       	else
       		console.log("No pop-up to be removed.\n");
	}

	function createPopUp(text) {
		var wrapDiv = document.createElement("div");
    	wrapDiv.id = "pop-up";

    	var closeBtn = new Image();
    	closeBtn.src = "assets/svg/close-popup.svg";
    	closeBtn.id = "close-popup";
    	closeBtn.onclick = removePopUp;

    	var innerDiv = document.createElement("div");
    	innerDiv.id = "pop-up-inner";
    	innerDiv.appendChild(closeBtn);

    	var paragraph = document.createElement("p");
    	var textNode = document.createTextNode(text);
    	paragraph.appendChild(textNode);
    	innerDiv.appendChild(paragraph);
    	wrapDiv.appendChild(innerDiv);
    	var scriptTag = document.getElementsByTagName("script");

    	wrapDiv.style.fontSize = "1.3em";
    	document.body.insertBefore(wrapDiv,scriptTag[0]);
    	
    	return wrapDiv;
	}


