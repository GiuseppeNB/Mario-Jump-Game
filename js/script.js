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
const highScoreElement = document.getElementById('highScore');
const timerElement = document.getElementById('timer');
const gameOver = document.getElementById('gameOver');
const finalScoreE = document.getElementById('finalScore');
const finalPipesE = document.getElementById('finalPipes');
const finalTimeE = document.getElementById('finalTime');
const newRecordE = document.getElementById('newRecord');

const POINTS_PER_PIPE = 10; // Pontos ganhos a cada cano pulado
const HIGH_SCORE_KEY = 'marioHighScore'; // Chave usada no localStorage

let loopId = null; // ID do requestAnimationFrame do loop principal
let timerInterval = null;

let score = 0;
let pipesJumped = 0;
let highScore = 0;
let timeSec = 0;
let pipeScored = false; // Garante que cada cano só pontue uma vez
let isGameOver = false;
let isGameStarted = false;
const defaultJumpKeys = ['Space', 'ArrowUp']; // Teclas padrão para pular
let jumpKeys = [...defaultJumpKeys]; // Teclas que o jogador escolheu para pular, inicialmente definidas como as teclas padrão
let isChoosingJumpKey = false; // Flag para indicar se o jogador está no processo de escolher uma nova tecla para pular

// Recorde salvo no navegador (com proteção caso o localStorage esteja indisponível)
const loadHighScore = () => {
    try {
        highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
    } catch (e) {
        highScore = 0;
    }
    highScoreElement.textContent = highScore;
};

const saveHighScore = () => {
    try {
        localStorage.setItem(HIGH_SCORE_KEY, highScore);
    } catch (e) {
        // Sem localStorage: o recorde vale apenas enquanto a página estiver aberta
    }
};

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

// Função responsável por executar a mecânica de pulo do Mario
const jump = ()=> {

    // Trava de segurança: impede o pulo se o jogo ainda não começou OU se já deu Game Over ou se o Mario está no ar
    if(!isGameStarted || isGameOver || mario.classList.contains('jump')) return;

    // Adiciona a classe CSS '.jump', disparando a animação de salto (CSS @keyframes)
    mario.classList.add('jump');

    // Aguarda 500ms (tempo exato da duração da animação no CSS) para remover a classe
    setTimeout(() => {
        // Remove a classe '.jump' para que o Mario volte ao chão e possa pular novamente no futuro
        mario.classList.remove('jump'); 
    }, 500);
}

// Para todos os loops e temporizadores
const stopGame = () => {
    cancelAnimationFrame(loopId);
    clearInterval(timerInterval);
};

// Loop principal: verifica colisão e pontuação a cada frame
const gameLoop = () => {
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

    // Colisão: cano na área do Mario (<= 120px) E Mario abaixo da altura do cano (< 80px)
    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {

        // Congela o cano na posição da colisão
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;

        // Trava o Mario na altura em que bateu
        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`;

        // Troca o sprite pela imagem de Game Over
        mario.src = './images/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';

        // Pausa as nuvens
        clouds.style.animation = 'none';

        stopGame();
        isGameOver = true;

        // Verifica se bateu o recorde
        const isNewRecord = score > highScore;
        if (isNewRecord) {
            highScore = score;
            highScoreElement.textContent = highScore;
            saveHighScore();
        }

        // Mostra o modal de Game Over
        finalScoreE.textContent = score;
        finalPipesE.textContent = pipesJumped;
        finalTimeE.textContent = timeSec;
        newRecordE.hidden = !isNewRecord;
        gameOver.style.display = 'flex';
        restartButton.focus();
        return;
    }

    // O cano passou pelo Mario sem colisão: pontua uma única vez
    if (pipePosition <= 0 && !pipeScored) {
        pipeScored = true;
        pipesJumped += 1;
        score += POINTS_PER_PIPE;
        scoreElement.textContent = score;
    }

    // O cano reapareceu na direita: libera a pontuação do próximo
    if (pipePosition > 120) {
        pipeScored = false;
    }

    loopId = requestAnimationFrame(gameLoop);
};

// Função responsável por inicializar ou reiniciar a partida
const start = () => {
    // Interrompe quaisquer intervalos ativos (loops) para evitar acúmulo de timers e bugs
    stopGame();
    
    // Redefine as variáveis de controle do estado do jogo
    isGameOver = false;
    isGameStarted = true;
    score = 0;
    pipesJumped = 0;
    timeSec = 0;
    pipeScored = false;

    // Reseta os valores exibidos na interface (HTML)
    scoreElement.textContent = '0';
    timerElement.textContent = '0';

    // Esconde as telas de Game Over e de Início
    gameOver.style.display = 'none';
    startScreen.style.display = 'none';

    // Remove a classe visual do estado de espera/pausa do cenário
    gameBoard.classList.remove('is-idle');

    // Restaura o sprite e o posicionamento original do Mario
    mario.classList.remove('jump');
    mario.src = './images/mario.gif';
    mario.style.width = '150px';
    mario.style.marginLeft = '0px';
    mario.style.bottom = '0px';
    mario.style.animation = '';

    // Reinicia as animações do cano e das nuvens (o reflow força o reinício
    // mesmo na primeira partida, quando a animação já estava rodando)
    pipe.style.animation = 'none';
    clouds.style.animation = 'none';
    void pipe.offsetWidth;
    pipe.style.animation = 'pipe-animation 1.5s infinite linear';
    pipe.style.left = '';
    clouds.style.animation = 'clouds-animation 20s infinite linear';

    // Inicializa a contagem do tempo de jogo (1 segundo por incremento)
    timerInterval = setInterval(() => {
        timeSec += 1;
        timerElement.textContent = timeSec;
    }, 1000);

    loopId = requestAnimationFrame(gameLoop);
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
        if (event.code === 'Escape' || event.code === 'Tab') { // Se o jogador pressionar a tecla Escape ou Tab, cancela a escolha da nova tecla para pular
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
