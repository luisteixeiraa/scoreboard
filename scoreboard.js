class Timer {
    constructor(timerElement, goldenScoreElement) {
        this.timerElement = timerElement;
        this.goldenScoreElement = goldenScoreElement;
        this.timerInterval = null;
        this.timerTime = 0;
        this.isPaused = true;
        this.normalTimeFinished = false;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    start() {
        const self = this;

        if (self.timerInterval) {
            clearInterval(self.timerInterval);
        }

        self.isPaused = false;
        self.timerElement.classList.add('text-green-500');

        if (self.timerTime > 0 && !self.normalTimeFinished) {
            self.timerInterval = setInterval(function() {
                self.timerTime--;
                self.timerElement.textContent = self.formatTime(self.timerTime);
                if (self.timerTime === 0) {
                    self.normalTimeFinished = true;
                    self.pause();
                    self.playSound();
                }
            }, 1000);
        } else {
            if (self.timerTime === 0) {
                self.goldenScoreElement.classList.remove('hidden');
            }
            self.timerInterval = setInterval(function() {
                self.timerTime++;
                self.timerElement.textContent = self.formatTime(self.timerTime);
            }, 1000);
        }
    }

    pause() {
        this.isPaused = true;
        clearInterval(this.timerInterval);
        this.timerElement.classList.remove('text-green-500');
    }

    goldenScore() {
        clearInterval(this.timerInterval);
        this.timerTime = 0;
        this.isPaused = true;
        this.normalTimeFinished = true;
        this.setElementTime(0);
        this.goldenScoreElement.classList.remove('hidden');
    }

    reset(minutes) {
        if (this.normalTimeFinished) {
            this.goldenScoreElement.classList.add('hidden');
        }
        this.isPaused = true;
        this.normalTimeFinished = false;
        this.setElementTime(minutes);
    }

    setElementTime(minutes) {
        this.timerTime = minutes * 60;
        this.timerElement.textContent = this.formatTime(this.timerTime);
    }

    checkIfScoreInGoldenScore() {
        if (this.normalTimeFinished && !this.isPaused) {
            this.pause();
        }
    }

    playSound() {
        // Uncomment and add audio logic
        // audio.play();
    }
}

class Osaekomi {
    constructor(timer, player) {
        this.osaekomiElement = document.getElementsByClassName("osaekomi")[0];
        this.osaekomiInterval = null;
        this.osaekomiTime = 0;
        this.timer = timer;
        this.isPaused = false;
        this.player = player;
    }

    start() {
        if (this.osaekomiTime < 20 && this.player.ipponCount === 0 && !this.osaekomiInterval) {
            if (this.timer.isPaused) {
                this.timer.start();
            }
            this.isPaused = false;
            const osaekomiPlayer1Classes = ['from-neutral-100', 'via-neutral-200', 'to-neutral-100', 'text-neutral-900'];
            const osaekomiPlayer2Classes = ['from-blue-500', 'via-blue-700', 'to-blue-500'];
            const osaekomiClasses = !this.player.isPlayerTwo ? osaekomiPlayer1Classes : osaekomiPlayer2Classes;

            this.osaekomiElement.classList.remove('hidden', ...osaekomiPlayer1Classes, ...osaekomiPlayer2Classes);
            this.osaekomiElement.classList.add(...osaekomiClasses);

            this.osaekomiInterval = setInterval(() => {
                this.osaekomiTime++;
                this.osaekomiElement.textContent = this.osaekomiTime;
                switch (this.osaekomiTime) {
                    case 5:
                        this.player.addYuko();
                        this.checkIfScoreInGoldenScore();
                        break;
                    case 10:
                    case 20:
                        this.player.addWazari();
                        this.checkIfScoreInGoldenScore();
                        break;
                    default:
                }
                if (this.osaekomiTime >= 20 || this.player.ipponCount === 1) {
                    clearInterval(this.osaekomiInterval);
                    this.timer.pause();
                }
            }, 1000);
        }
    }

    stop() {
        clearInterval(this.osaekomiInterval);
        this.osaekomiTime = 0;
        this.isPaused = false;
        this.osaekomiInterval = null;
        this.osaekomiElement.textContent = this.osaekomiTime;
        this.osaekomiElement.classList.add('hidden');
    }

    pause() {
        clearInterval(this.osaekomiInterval);
        this.osaekomiInterval = null;
        this.isPaused = true;
    }

    checkIfScoreInGoldenScore() {
        if (this.timer.normalTimeFinished) {
            this.pause();
        }
    }

}

class Player {
    constructor(timer, isPlayerTwo, playerElements) {
        this.elements = playerElements;
        this.timer = timer;
        this.ipponCount = 0;
        this.wazariCount = 0;
        this.yukoCount = 0;
        this.shidoCount = 0;
        this.isPlayerTwo = isPlayerTwo;
        this.osaekomi = new Osaekomi(timer, this);
    }

    updateElement(element, value) {
        element.textContent = value;
    }

    addIppon() {
        if (this.ipponCount === 0) {
            this.timer.pause();
            this.ipponCount = 1;
            this.updateElement(this.elements.ippon, this.ipponCount);
            this.timer.checkIfScoreInGoldenScore();
        }
    }

    removeIppon() {
        if (this.ipponCount > 0) {
            this.ipponCount = 0;
            if (this.wazariCount === 2) {
              this.wazariCount--;
            }
            this.updateElement(this.elements.ippon, this.ipponCount);
            this.updateElement(this.elements.wazari, this.wazariCount);
        }
    }

    addWazari() {
        if (this.wazariCount === 0) {
            this.wazariCount++;
            this.updateElement(this.elements.wazari, this.wazariCount);
        } else if (this.wazariCount === 1 && this.ipponCount === 0) {
            this.timer.pause();
            this.wazariCount++;
            this.ipponCount++;
            this.updateElement(this.elements.ippon, this.ipponCount);
            this.updateElement(this.elements.wazari, 0);
        }
        this.timer.checkIfScoreInGoldenScore();
    }

    removeWazari() {
        if (this.wazariCount === 1) {
            this.wazariCount--;
            this.updateElement(this.elements.wazari, this.wazariCount);
        } else if (this.wazariCount === 2) {
            this.wazariCount--;
            this.ipponCount=0;
            this.updateElement(this.elements.ippon, this.ipponCount);
            this.updateElement(this.elements.wazari, this.wazariCount);
        }
    }

    addYuko() {
        this.yukoCount++;
        this.updateElement(this.elements.yuko, this.yukoCount);
        this.timer.checkIfScoreInGoldenScore();
    }

    removeYuko() {
        if (this.yukoCount > 0) {
            this.yukoCount--;
            this.updateElement(this.elements.yuko, this.yukoCount);
        }
    }

    addShido() {
        switch (this.shidoCount) {
            case 0:
                this.shidoCount = 1;
                this.elements['shido1'].classList.add('from-yellow-400', 'via-yellow-500', 'to-yellow-400');
                break;
            case 1:
                this.shidoCount = 2;
                this.elements['shido2'].classList.add('from-yellow-400', 'via-yellow-500', 'to-yellow-400');
                break;
            case 2:
                this.timer.pause();
                this.shidoCount = 3;
                this.elements['shido3'].classList.add('from-red-500', 'via-red-600', 'to-red-500');
                break;
        }
    }

    removeShido() {
        switch (this.shidoCount) {
            case 3:
                this.shidoCount = 2;
                this.elements['shido3'].classList.remove('from-red-500', 'via-red-600', 'to-red-500');
                break;
            case 2:
                this.shidoCount = 1;
                this.elements['shido2'].classList.remove('from-yellow-400', 'via-yellow-500', 'to-yellow-400');
                break;
            case 1:
                this.shidoCount = 0;
                this.elements['shido1'].classList.remove('from-yellow-400', 'via-yellow-500', 'to-yellow-400');
                break;
        }
    }

}

class EventManager {
    constructor(timer, player, player2) {
        this.timer = timer;
        this.player = player;
        this.player2 = player2;
        this.winnerElement = document.getElementsByClassName("winnerElement")[0];
        this.winnerPlayer = null;
        this.initEvents();
    }

    setWinner(isPlayer1) {

        const player1Style = ['bg-slate-300'];
        const player2Style = ['bg-blue-900', 'text-white'];
        const textElement = this.winnerElement.getElementsByClassName("winnerText")[0];

        if (isPlayer1) {
            if (this.winnerPlayer === this.player) {
                this.winnerPlayer = null;
                this.winnerElement.classList.add('hidden');
                this.winnerElement.classList.remove(...player1Style);
            } else {
                this.winnerPlayer = this.player;
                textElement.textContent = "Atleta de Branco";
                this.winnerElement.classList.remove('hidden');
                this.winnerElement.classList.remove(...player2Style);
                this.winnerElement.classList.add(...player1Style);
            }
        } else {
            if (this.winnerPlayer === this.player2) {
                this.winnerPlayer = null;
                this.winnerElement.classList.add('hidden');
                this.winnerElement.classList.remove(...player2Style);
            } else {
                this.winnerPlayer = this.player2;
                textElement.textContent = "Atleta de Azul";
                this.winnerElement.classList.remove('hidden');
                this.winnerElement.classList.remove(...player1Style);
                this.winnerElement.classList.add(...player2Style);
            }
        }
    }

    initEvents() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'Space':
                    this.timer.isPaused ? this.timer.start() : this.timer.pause();
                    break;
                // Player 1  
                case 'KeyQ':
                    this.player.addIppon();
                    break;
                case 'KeyA':
                    this.player.removeIppon();
                    break;
                case 'KeyW':
                    this.player.addWazari();
                    break;
                case 'KeyS':
                    this.player.removeWazari();
                    break;
                case 'KeyE':
                    this.player.addYuko();
                    break;
                case 'KeyD':
                    this.player.removeYuko();
                    break;
                case 'KeyR':
                    this.player.addShido();
                    if (this.player.shidoCount === 3) {
                        this.player2.addIppon();
                    }
                    break;
                case 'KeyF':
                    this.player.removeShido();
                    if (this.player.shidoCount === 2) {
                        this.player2.removeIppon();
                    }
                    break;
                // Player 2
                case 'KeyY':
                    this.player2.addIppon();
                    break;
                case 'KeyH':
                    this.player2.removeIppon();
                    break;
                case 'KeyU':
                    this.player2.addWazari();
                    break;
                case 'KeyJ':
                    this.player2.removeWazari();
                    break;
                case 'KeyI':
                    this.player2.addYuko();
                    break;
                case 'KeyK':
                    this.player2.removeYuko();
                    break;
                case 'KeyO':
                    this.player2.addShido();
                    if (this.player2.shidoCount === 3) {
                        this.player.addIppon();
                    }
                    break;
                case 'KeyL':
                    this.player2.removeShido();
                    if (this.player2.shidoCount === 2) {
                        this.player.removeIppon();
                    }
                    break;
                // General
                case 'Digit1':
                    if (this.timer.isPaused) {
                        this.timer.reset(1);
                    }
                    break;
                case 'Digit2':
                    if (this.timer.isPaused) {
                        this.timer.reset(2);
                    }
                    break;
                case 'Digit3':
                    if (this.timer.isPaused) {
                        this.timer.reset(3);
                    }
                    break;
                case 'Digit4':
                    if (this.timer.isPaused) {
                        this.timer.reset(4);
                    }
                    break;
                case 'KeyB':
                    if (this.timer.isPaused) {
                        this.timer.goldenScore();
                    }
                    break;
                case 'ArrowLeft':
                    if (this.player2.osaekomi.osaekomiInterval || this.player2.osaekomi.isPaused) {
                        this.player2.osaekomi.stop();
                    }
                    if (!this.player.osaekomi.osaekomiInterval || this.player.osaekomi.isPaused) {
                        this.player.osaekomi.start();
                    } else {
                        this.player.osaekomi.pause();
                    }
                    break;
                case 'ArrowRight':
                    if (this.player.osaekomi.osaekomiInterval || this.player.osaekomi.isPaused) {
                        this.player.osaekomi.stop();
                    }
                    if (!this.player2.osaekomi.osaekomiInterval || this.player2.osaekomi.isPaused) {
                        this.player2.osaekomi.start();
                    } else {
                        this.player2.osaekomi.pause();
                    }
                    break;
                case 'ArrowDown':
                    if (this.player.osaekomi.osaekomiInterval || this.player.osaekomi.isPaused) {
                        this.player.osaekomi.stop();
                    }
                    if (this.player2.osaekomi.osaekomiInterval || this.player2.osaekomi.isPaused) {
                        this.player2.osaekomi.stop();
                    }
                    break;
                // Winners
                case 'KeyV':
                    this.setWinner(true);
                    break;
                case 'KeyN':
                    this.setWinner(false);
                    break;
            }
        });
    }
}

// Initialize Classes
const timer = new Timer(
    document.getElementsByClassName("timer")[0],
    document.getElementsByClassName("goldenscore")[0]
);

const player = new Player(timer, false, {
    ippon: document.getElementsByClassName("p1-ippon")[0],
    wazari: document.getElementsByClassName("p1-wazari")[0],
    yuko: document.getElementsByClassName("p1-yuko")[0],
    shido1: document.getElementsByClassName("p1-shido1")[0],
    shido2: document.getElementsByClassName("p1-shido2")[0],
    shido3: document.getElementsByClassName("p1-shido3")[0]
});

const player2 = new Player(timer, true, {
    ippon: document.getElementsByClassName("p2-ippon")[0],
    wazari: document.getElementsByClassName("p2-wazari")[0],
    yuko: document.getElementsByClassName("p2-yuko")[0],
    shido1: document.getElementsByClassName("p2-shido1")[0],
    shido2: document.getElementsByClassName("p2-shido2")[0],
    shido3: document.getElementsByClassName("p2-shido3")[0]
});

new EventManager(timer, player, player2);

timer.reset(4)