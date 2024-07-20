let canvas, ctx;
let bodyElement;
let points = 0;
let pointsElement;

let lossParagraph = document.createElement("p");
let restartButton = document.createElement("button");

let fpsInterval = 1000 / 30;
let now;
let then = Date.now();

let requestID;

let isNightMode = false;
let nightModeCheckBox;
let difficultySlider;
let difficulty;

let player = {
    x: 0, y: 0,
    width: 14,
    height: 19,
    frameX: 0,
    frameY: 0,
    xChange: 0,
    yChange: 0,
    movingRight: true,
    spriteX: 17,
    spriteY: 22
}

let star = {
    x: 600,
    y: 175,
    width: 50,
    height: 50,
};

let moveUp;
let moveDown;
let moveRight;
let moveLeft;

const colors = {
    ice: "#DBF1FD",
    road: "#767676",
}

let cars = [];

let crashSound;
let ding;

// images
let playerImage = new Image();
let starImage = new Image();
let carImageDown = new Image();
let carImageUp = new Image();

function randint(low, high) {
    let num = Math.floor(Math.random() * (high - low + 1));
    return num + low;
}

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");
    bodyElement = document.querySelector("body");
    pointsElement = bodyElement.querySelector("#points");

    lossParagraph.innerHTML = "You lost :(";
    lossParagraph.hidden = true;
    restartButton.innerHTML = "try again";
    restartButton.type = "reset";
    restartButton.onclick = restart;
    restartButton.hidden = true;
    bodyElement.appendChild(restartButton);
    bodyElement.appendChild(lossParagraph);

    // initialize images
    playerImage.src = "assets/player.png";
    starImage.src = "assets/star.png";
    carImageUp.src = "assets/car_up.png";
    carImageDown.src = "assets/car_down.png";

    // initialize audio
    crashSound = new sound("assets/carcrash.wav");
    ding = new sound("assets/ding.mp3");

    // form stuff
    nightModeCheckBox = bodyElement.querySelector("#nightmode");
    function toggleNightMode(e) {
        isNightMode = !isNightMode;
    }
    nightModeCheckBox.addEventListener("change", toggleNightMode, false);
    difficultySlider = document.getElementById("difficulty");
    difficulty = difficultySlider.valueAsNumber;

    prestart();
}

function prestart() {
    window.addEventListener("keydown", activate, false);
    window.addEventListener("keyup", deactivate, false);
    player.x = 50;
    player.y = canvas.height / 2;
    player.xChange = 0;
    player.yChange = 0;
    cars = [];
    // create cars
    difficulty = difficultySlider.valueAsNumber;
    const maxSpeed = difficulty
    for (let i = 205; i < 600; i += 100) {
        let direction = Math.random() < 0.5 ? "up" : "down";
        cars.push({
            x: i,
            y: randint(0, canvas.height),
            width: 10, height: 30,
            direction: direction,
            speed: direction === "down" ? randint(3, maxSpeed) : randint(maxSpeed * -1, -3), 
        });
        direction = Math.random() < 0.5 ? "up" : "down";
        cars.push({
            x: i + 30,
            y: randint(0, canvas.height),
            width: 10, height: 30,
            direction: direction,
            speed: direction === "down" ? randint(3, maxSpeed) : randint(maxSpeed * -1, -3),
        });
    }
    star.x = 600;
    star.y = 175;
    draw();
}

function draw() {
    requestID = window.requestAnimationFrame(draw)
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    // draw background on canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colors.ice;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // draw roads
    for (let x = 200; x < 600; x += 100) {
        ctx.fillStyle = colors.road;
        ctx.fillRect(x, 0, 50, canvas.height);
        for (let y = 20; y < canvas.height; y += 80) {
            ctx.fillStyle = "white";
            ctx.fillRect(x + 20, y, 10, 40);
        }
    }

    // draw the player
    if (player.xChange === 0 && player.yChange === 0) { // if the player is not moving
        player.spriteX = 17;
        player.spriteY = 22;
    } else {
        player.spriteY = 68
        player.spriteX += 48;
        if (player.spriteX > 272) {
            player.spriteX = 17;
        }
    }
    ctx.drawImage(playerImage,
        player.spriteX + ((player.movingRight) ? 0 : 15), player.spriteY, 14, 19,
        player.x, player.y, player.width, player.height)
    // ctx.fillRect(player.x, player.y, player.width, player.height);

    // draw star
    ctx.drawImage(starImage,
        0, 0, 100, 100,
        star.x, star.y, star.width, star.height);

    // draw the cars
    ctx.fillStyle = "yellow";
    for (let car of cars) {
        // ctx.fillRect(car.x, car.y, car.width, car.height);
        let carImage = (car.direction === "down") ? carImageDown : carImageUp;
        ctx.drawImage(carImage,
            0, 0, 271, 541,
            car.x - 5, car.y - 5, car.width + 5, car.height + 5);
    }

    // draw the 'flashlight' if isNightMode is true
    if (isNightMode) {
        ctx.globalAlpha = 0.8;
        const flashlightX = player.x + (player.width / 2);
        const flashlightY = player.y + (player.height / 2);
        ctx.fillStyle = "black";
        if (player.movingRight) {
            ctx.fillRect(0, 0, flashlightX, canvas.height);
            fillTriangle(flashlightX, flashlightY, flashlightX + 1000, flashlightY - 1200, flashlightX, 0);
            fillTriangle(flashlightX, flashlightY, flashlightX + 1000, flashlightY + 1200, flashlightX, canvas.height);
        } else {
            ctx.fillRect(flashlightX, 0, canvas.width, canvas.height);
            fillTriangle(flashlightX, flashlightY, flashlightX - 1000, flashlightY - 1200, flashlightX, 0);
            fillTriangle(flashlightX, flashlightY, flashlightX - 1000, flashlightY + 1200, flashlightX, canvas.height);
        }
        ctx.globalAlpha = 1.0;
    }

    // handle key presses
    if (moveLeft) {
        player.xChange = Math.max(player.xChange - 1, -7);
    }
    if (moveRight) {
        player.xChange = Math.min(player.xChange + 1, 7);
    }
    if (moveUp) {
        player.yChange = Math.max(player.yChange - 1, -7);
    }
    if (moveDown) {
        player.yChange = Math.min(player.yChange + 1, 7);
    }

    // update the player
    player.x = clampToCanvasWidth(player.x + player.xChange);
    player.y = clampToCanvasHeight(player.y + player.yChange);

    // update the cars
    difficulty = difficultySlider.valueAsNumber;
    const maxSpeed = Math.round(difficulty);
    for (let car of cars) {
        car.y = car.y + car.speed
        if (car.y < -50 || car.y > canvas.height + 20) {
            cars.splice(cars.indexOf(car), 1);
            let c = car
            let direction = Math.random() < 0.5 ? "up" : "down";
            setTimeout(() => {
                cars.push({
                    x: car.x,
                    y: direction === "down" ? 0 : canvas.height,
                    width: 10, height: 30,
                    direction: direction,
                    speed: direction === "down" ? randint(3, maxSpeed) : randint(maxSpeed * -1, -3),
                });
            }, randint(50, 600));
        }
    }

    // collisions
    if (playerCollidesWithCar()) {
        stop();
        crashSound.play();
    }
    if (playerCollidesWithStar()) {
        nextRound();
        ding.play();
    }
}

function clampToCanvasWidth(xPos) {
    let x = xPos;
    x = Math.max(0, x);
    x = Math.min(x, canvas.width - player.width);
    return x;
}

function clampToCanvasHeight(yPos) {
    let y = yPos;
    y = Math.max(0, y);
    y = Math.min(y, canvas.height - player.height)
    return y;
}

function playerCollidesWithCar() {
    const tolerance = 3;
    for (let a of cars) {
        if (!(player.x >= a.x + a.width - tolerance || player.x + player.width <= a.x + tolerance) &&
            !(player.y >= a.y + a.height - tolerance || player.y + player.height <= a.y + tolerance))
        {
            return true;
        }
    }
    return false;
}

function playerCollidesWithStar() {
    const horizontalOverlap = !(player.x >= star.x + star.width || player.x + player.width <= star.x);
    const verticalOverlap = !(player.y >= star.y + star.height || player.y + player.height <= star.y);
    return horizontalOverlap && verticalOverlap;
}

function activate(event) {
    let key = event.key;
    if (key === "ArrowLeft") {
        moveLeft = true;
        player.movingRight = false;
    } else if (key === "ArrowUp") {
        moveUp = true
    } else if (key === "ArrowDown") {
        moveDown = true
    } else if (key === "ArrowRight") {
        moveRight = true;
        player.movingRight = true;
    }
}

function deactivate(event) {
    let key = event.key;
    if (key === "ArrowLeft") {
        moveLeft = false;
    } else if (key === "ArrowUp") {
        moveUp = false;
    } else if (key === "ArrowDown") {
        moveDown = false;
    } else if (key === "ArrowRight") {
        moveRight = false;
    }
}

function restart() {
    points = 0;
    pointsElement.innerHTML = "Points: " + points;
    lossParagraph.hidden = true;
    prestart();
}

function stop() {
    window.removeEventListener("keydown", activate, false);
    window.removeEventListener("keyup", activate, false);
    window.cancelAnimationFrame(requestID);
    lossParagraph.hidden = false;
    restartButton.hidden = false;
}

function nextRound() {
    points += 1;
    pointsElement.innerHTML = "Points: " + points;
    if (star.x === 600) {
        star.x = 100;
    } else {
        star.x = 600;
    }
    star.y = randint(0, canvas.height - star.height);
}

function fillTriangle(a1, a2, b1, b2, c1, c2) {
    ctx.beginPath();
    ctx.moveTo(a1, a2);
    ctx.lineTo(b1, b2);
    ctx.lineTo(c1, c2);
    ctx.closePath();
    ctx.fill();
}

// taken from https://www.w3schools.com/graphics/game_sound.asp
class sound {
    constructor(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function () {
            this.sound.play();
        };
        this.stop = function () {
            this.sound.pause();
        };
    }
}