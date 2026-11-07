const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const clouds = document.querySelector('.clouds');
const gameBoard = document.getElementById('gameBoard');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const changeJumpKeyButton = document.getElementById('changeJumpKeyButton');
const restoreJumpKeysButton = document.getElementById('restoreJumpKeysButton');
const jumpKeyLabel = document.getElementById('jumpKeyLabel');
const keyCaptureStatus = document.getElementById('keyCaptureStatus');
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
let isGameStarted = false;
const defaultJumpKeys = ['Space', 'ArrowUp']; // Teclas padrão para pular
let jumpKeys = [...defaultJumpKeys]; // Teclas que o jogador escolheu para pular, inicialmente definidas como as teclas padrão
let isChoosingJumpKey = false; // Flag para indicar se o jogador está no processo de escolher uma nova tecla para pular

const formatJumpKey = (code) => { // Função para formatar o nome da tecla para exibição
    const keyNames = { // Mapeamento de códigos de tecla para nomes em português
        Space: 'Espaço',
        ArrowUp: 'Seta para cima',
        ArrowDown: 'Seta para baixo',
        ArrowLeft: 'Seta para esquerda',
        ArrowRight: 'Seta para direita'
    };

    if (keyNames[code]) return keyNames[code]; // Se o código da tecla estiver no mapeamento, retorna o nome correspondente
    if (code.startsWith('Key')) return code.slice(3); // Remove o prefixo 'Key' para teclas alfabéticas
    if (code.startsWith('Digit')) return code.slice(5); // Remove o prefixo 'Digit' para teclas numéricas
    return code; // Retorna o código da tecla como está se não houver mapeamento específico
};

const updateJumpKeyLabel = () => { // Função para atualizar o rótulo que mostra as teclas de pulo atuais
    const labels = []; // Array para armazenar os nomes formatados das teclas de pulo

    for (const code of jumpKeys) { // Itera sobre cada código de tecla no array jumpKeys para verificar se uma tecla pressionada corresponde a uma das teclas de pulo definidas pelo jogador
        labels.push(formatJumpKey(code)); // Adiciona o nome formatado da tecla ao array labels
    }

    jumpKeyLabel.textContent = `Tecla${labels.length > 1 ? 's' : ''} para pular: ${labels.join(' ou ')}`; // Atualiza o texto do elemento jumpKeyLabel com as teclas de pulo atuais, usando "ou" para separar múltiplas teclas
};

const jump = ()=> {

    if(!isGameStarted || isGameOver) return;

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
    isGameStarted = true;
    score = 0;
    timeSec = 0;
    scoreElement.textContent = '0';
    timerElement.textContent = '0';
    gameOver.style.display = 'none';
    startScreen.style.display = 'none';
    gameBoard.classList.remove('is-idle');

    mario.src = './images/mario.gif';
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
    }, 1000);

    timerInterval = setInterval(() => {
        timeSec += 1;
        timerElement.textContent = timeSec;
    }, 1000);


    

    loop = setInterval(() => {
 
        const pipePosition = pipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

        if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {

            pipe.style.animation = 'none';
            pipe.style.left = `${pipePosition}px`; 

            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`; 

            mario.src = './images/game-over.png'; // Imagem do game-over
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

startButton.addEventListener('click', start);
restartButton.addEventListener('click', start);
changeJumpKeyButton.addEventListener('click', () => { // Inicia o processo de escolha de uma nova tecla para pular
    isChoosingJumpKey = true;
    keyCaptureStatus.textContent = 'Pressione a tecla que deseja usar para pular. Pressione Escape para cancelar.'; // Atualiza o status para informar ao jogador que ele deve pressionar a tecla desejada
});

restoreJumpKeysButton.addEventListener('click', () => { // Restaura as teclas de pulo para os valores padrão
    jumpKeys = [...defaultJumpKeys]; // Restaura as teclas de pulo para os valores padrão
    isChoosingJumpKey = false;
    updateJumpKeyLabel(); // Atualiza o rótulo das teclas de pulo para refletir as teclas padrão
    keyCaptureStatus.textContent = 'Teclas padrão restauradas.'; // Atualiza o status para informar ao jogador que as teclas padrão foram restauradas
});

document.addEventListener('keydown', (event) => {
    if (isChoosingJumpKey) { // Se o jogador estiver no processo de escolher uma nova tecla para pular
        if (event.code === 'Escape') { // Se o jogador pressionar a tecla Escape, cancela a escolha da nova tecla para pular
            event.preventDefault();
            isChoosingJumpKey = false;
            keyCaptureStatus.textContent = 'Alteração cancelada.';
            return;
        }

        if (event.code === 'Tab') { // Se o jogador pressionar a tecla Tab, cancela a escolha da nova tecla para pular
            event.preventDefault();
            isChoosingJumpKey = false;
            keyCaptureStatus.textContent = 'Alteração cancelada.';
            return;
        }

        event.preventDefault();

        if (['Enter', 'Backspace', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].includes(event.code)) { // Se o jogador pressionar uma tecla reservada, informa que a tecla é reservada e não permite que seja usada como tecla de pulo
            keyCaptureStatus.textContent = 'Essa tecla é reservada. Escolha outra tecla para pular.';
            return;
        }

        jumpKeys = [event.code]; // Define a tecla pressionada como a nova tecla de pulo
        isChoosingJumpKey = false;
        updateJumpKeyLabel(); // Atualiza o rótulo das teclas de pulo para refletir a nova tecla escolhida
        keyCaptureStatus.textContent = `${formatJumpKey(event.code)} definida como tecla de pulo.`; // Atualiza o status para informar ao jogador que a nova tecla de pulo foi definida
        return;
    }

    if (!isGameStarted || isGameOver) return; // Se o jogo não estiver iniciado ou se já tiver terminado, não faz nada

    for (const code of jumpKeys) { // Itera sobre cada código de tecla no array jumpKeys para verificar se uma tecla pressionada corresponde a uma das teclas de pulo definidas pelo jogador
        if (event.code === code) { // Se a tecla pressionada for uma das teclas de pulo definidas pelo jogador, chama a função jump() para fazer o Mario pular
            event.preventDefault();
            jump();
            break;
        }
    }
});