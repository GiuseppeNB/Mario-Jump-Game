const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const clouds = document.querySelector('.clouds');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const gameOver = document.getElementById('gameOver');
const finalScoreE = document.getElementById('finalScore');
const finalTimeE = document.getElementById('finalTime');

let loop = null;
let scoreInterval = null;
let timerInterval = null;

let score = 0;
let timeSec = 0;
let isGameOver = false;

const jump = ()=> {

    if(isGameOver) return;

    mario.classList.add('jump');

    setTimeout(() => {

        mario.classList.remove('jump');
        }, 500);
    }

    const start = () => {
        clearInterval(loop);
        clearInterval(scoreInterval);
        clearInterval(timerInterval);

        isGameOver = false;
        score = 0;
        timeSec = 0;
        scoreElement.textContent = '0';
        timerElement.textContent = '0';
        gameOver.style.display = 'none';

        mario.src = 'https://raw.githubusercontent.com/manuel-dve/mario-jump/main/images/mario.gif';
        mario.style.width = '150px';
        mario.style.marginLeft = '0px';
        mario.style.bottom = '0px';
        mario.style.animation = '';

        pipe.style.animation = 'pipe-animation 1.5s infinite linear';
        pipe.style.left = '';

        clouds.style.animation = 'clouds-animation 20s infinite linear';

        scoreInterval = setInterval(() => {
            score += 1;
            scoreElement.textContent = score;
        }, 10);

        timerInterval = setInterval(() => {
            timeSec += 1;
            timerElement.textContent = timeSec;
        }, 30);


    

    loop = setInterval(() => {
 
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

    console.log(marioPosition);

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {

    pipe.style.animation = 'none';
    pipe.style.left = `${pipePosition}px`; 

    mario.style.animation = 'none';
    mario.style.bottom = `${marioPosition}px`; 

    mario.src = 'https://raw.githubusercontent.com/manuel-dve/mario-jump/main/images/game-over.png'; // <--- imagem de gameOver
    mario.style.width = '75px';
    mario.style.marginLeft = '50px';

        clouds.style.animation = 'none';

    clearInterval(loop);
    clearInterval(scoreInterval);
    clearInterval(timerInterval);

    isGameOver = true;

    finalScoreE.textContent = score;
    finalTimeE.textContent = timeSec;
    gameOver.style.display = 'flex';

            }
        } ,10);
    };

    document.addEventListener('keydown', (event) => {
        if(event.code == 'Space' || event.code === 'ArrowUp'){
            jump();
        }
    });

start();