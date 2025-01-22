const timerElement = document.getElementsByClassName("timer")[0];
const goldenScoreElement = document.getElementsByClassName("goldenscore")[0];
const timerOsaekomiElement = document.getElementsByClassName("p1-osaekomi")[0];
const playerIpponElement = document.getElementsByClassName("p1-ippon")[0];
const playerWazariElement = document.getElementsByClassName("p1-wazari")[0];
const playerYukoElement = document.getElementsByClassName("p1-yuko")[0];
const playerShido1Element = document.getElementsByClassName("p1-shido1")[0];
const playerShido2Element = document.getElementsByClassName("p1-shido2")[0];
const playerShido3Element = document.getElementsByClassName("p1-shido3")[0];

//const audio = new Audio('https://www.soundjay.com/button/beep-07.wav');

let timerInterval;
let timerOsaekomiInterval;
let timerTime = 0;
let timerOsaekomiTime = 0;

let normalTimeFinished = false;
let isPaused = true;

let shidoCount = 0;
let yukoCount = 0;
let wazariCount = 0;
let ipponCount = 0;


function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function addIppon() {
  if (ipponCount === 0) {
    pauseTimer();
    ipponCount = 1;
    playerIpponElement.textContent = ipponCount;
  }
}

function removeIppon() {
  if (ipponCount > 0) {
    ipponCount = 0;
    if (wazariCount === 2) {
      wazariCount--;
    }
    playerIpponElement.textContent = ipponCount;
    playerWazariElement.textContent = wazariCount;
  }
}

function addWazari() {
  if (wazariCount === 0) {
    wazariCount++;
    playerWazariElement.textContent = wazariCount;
  } else if (wazariCount === 1 && ipponCount === 0) {
    pauseTimer();
    wazariCount++;
    ipponCount++;
    playerIpponElement.textContent = ipponCount;
    playerWazariElement.textContent = 0;
  }
}

function removeWazari() {
  if (wazariCount === 1) {
    wazariCount--;
    playerWazariElement.textContent = wazariCount;
  } else if (wazariCount === 2) {
    wazariCount--;
    ipponCount=0;
    playerIpponElement.textContent = ipponCount;
    playerWazariElement.textContent = wazariCount;
  }
}

function addYuko() {
  yukoCount++;
  playerYukoElement.textContent = yukoCount;
}

function removeYuko() {
  if (yukoCount > 0) {
    yukoCount--;
    playerYukoElement.textContent = yukoCount;
  }
}

function addShido() {
  switch (shidoCount) {
    case 0:
      shidoCount = 1;
      playerShido1Element.classList.add('from-yellow-400', 'via-yellow-500', 'to-yellow-400');
      break;
    case 1:
      shidoCount = 2;
      playerShido2Element.classList.add('from-yellow-400', 'via-yellow-500', 'to-yellow-400');
      break;
    case 2:
      pauseTimer();
      shidoCount = 3;
      playerShido3Element.classList.add();
      break;
  }
}

function removeShido() {
  switch (shidoCount) {
    case 3:
      removeIppon();
      shidoCount = 2;
      playerShido3Element.classList.remove('from-red-500', 'via-red-600', 'to-red-500');
      break;
    case 2:
      shidoCount = 1;
      playerShido2Element.classList.remove('from-yellow-400', 'via-yellow-500', 'to-yellow-400');
      break;
    case 1:
      shidoCount = 0;
      playerShido1Element.classList.remove('from-yellow-400', 'via-yellow-500', 'to-yellow-400');
      break;
  }
}

function startTimer() {
  if (ipponCount === 0) {
    isPaused = false;
    timerElement.classList.add('text-green-500');
    if (timerTime > 0 && !normalTimeFinished) {
      timerInterval = setInterval(function() {
        timerTime--;
        timerElement.textContent = formatTime(timerTime);
        if (timerTime === 0) {
          normalTimeFinished = true;
          pauseTimer();
          playSound();
        }
      }, 1000);
    } else {
      if (timerTime === 0) {
        goldenScoreElement.classList.remove('hidden');
      }
      timerInterval = setInterval(function() {
        timerTime++;
        timerElement.textContent = formatTime(timerTime);
      }, 1000);
    }
  }
}

function pauseTimer() {
  isPaused = true;
  timerElement.classList.remove('text-green-500');
  clearInterval(timerInterval);
}

function playSound() {
  //audio.play();
}

function startOsaekomi() {
  if (ipponCount === 0) {
    if (timerOsaekomiTime < 20) {
      if (isPaused) {
        startTimer();
      }
      timerOsaekomiElement.classList.remove('hidden');
      timerOsaekomiInterval = setInterval(function() {
        timerOsaekomiTime++;
        timerOsaekomiElement.textContent = timerOsaekomiTime;
        switch (timerOsaekomiTime) {
          case 5:
            addYuko();
            break;
          case 10:
            addWazari();
            break;
          case 20:
            addWazari();
            break;
        }
        // Substituir o true. Deve haver uma comparação entre os scores de cada atleta quando está em goldenscore.
        if ((ipponCount === 1) || timerOsaekomiTime >= 20) {
          pauseTimer();
          clearInterval(timerOsaekomiInterval);
        }
      }, 1000);
    }
  }
}

function stopOsaekomi() {
  timerOsaekomiTime = 0;
  timerOsaekomiElement.textContent = timerOsaekomiTime;
  clearInterval(timerOsaekomiInterval);
  timerOsaekomiElement.classList.add('hidden');
}

document.addEventListener('keydown', function(event) {

  switch (event.code) {
    case 'Space':
      if (isPaused) {
        startTimer();
      } else {
        pauseTimer();
      }
      break;

    case 'KeyQ':
      addIppon();
      break;

    case 'KeyA':
      removeIppon();
      break;

    case 'KeyW':
      addWazari();
      break;

    case 'KeyS':
      removeWazari();
      break;

    case 'KeyE':
      addYuko();
      break;

    case 'KeyD':
      removeYuko();
      break;

    case 'KeyR':
      addShido();
      break;

    case 'KeyF':
      removeShido();
      break;

    case 'KeyT':
      if (timerOsaekomiTime === 0) {
        startOsaekomi();
      }
      break;

    case 'KeyG':
      if (timerOsaekomiTime !== 0) {
        stopOsaekomi();
      }
      break;

    case 'Digit1':
      initializeTimer(1);
      break;

    case 'Digit2':
      initializeTimer(2);
      break;

    case 'Digit3':
      initializeTimer(3);
      break;

    case 'Digit4':
      initializeTimer(4);
      break;

    case 'ArrowUp':
      if (isPaused) {
        timerTime++;
        timerElement.textContent = formatTime(timerTime);
      }
      break;

    case 'ArrowDown':
      if (isPaused) {
        if (timerTime > 0) {
          timerTime--;
        }
        timerElement.textContent = formatTime(timerTime);
      }
      break;

  }
});

function initializeTimer(minutes) {
  timerTime = minutes * 60;
  timerElement.textContent = formatTime(timerTime);
}

initializeTimer(1);