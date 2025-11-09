const words = `
apple river cloud light mouse dream stone quick brown jump smile chair plant sound space clean windy sharp ghost drift candy rain flame paper glass lucky ocean sweet funny watch brave fresh frost grape juice field match sleep dance clock brush tight magic storm night peace slide shine earth green happy clear yellow tiny large quiet soft fast slow blue pink black white rain sun sky bird tree fish grass road car bike book pen desk home door floor wall cup plate hand eye ear face hair mouth arm leg foot nose sand sea hill river leaf seed fire snow ice milk bread cake egg soup meat rice tea salt sugar city town village house park bridge street school class bench table light dark open close up down left right walk run jump sit stand talk read write play eat drink sing work rest sleep call help find look show stop start move stay build break cut join send keep give take feel smell touch taste know learn think love hate want need try wait hope dream hear see say tell ask answer push pull drive ride fly swim throw catch draw paint clean cook wash bake grow plant fix make use wear carry open close smile laugh cry yell shout win lose begin end change stay watch walk listen jump stand sit sleep rest wake move turn run move build find help call learn teach study count play read write speak laugh smile sing dance walk run talk watch cook bake clean wash paint draw fix cut open close drive ride swim fly jump throw catch sit stand sleep wake dream think feel love hate want need window planet future silver energy moment motion shadow memory whisper wonder travel escape hidden forest mountain valley beauty silence garden mirror rocket oceanic flavor golden silver system object number circle square power electric animal forest camera engine market people random stream family chance reason record nation travel guitar artist poetry number castle bridge energy reason forest broken planet shadow memory wonder breeze hunter chamber pocket castle prison market secret silver fallen window candle orange purple yellow violet market mirror planet forest dragon hidden rocket future animal camera puzzle action motion energy figure number bottle engine letter random symbol reason system charge pencil author reader office kitchen garden street corner bridge island tunnel canyon climber traveler hunter pirate sailor soldier captain general officer mission victory failure memory silence moment motion movement direction pattern channel signal volume surface texture feature control device charge electric battery wireless network browser server display monitor keyboard laptop charger system update upload download storage memory camera folder window option setting design project editor content version script syntax module function object return import export value method event element string number boolean array random filter reduce concat assign define create append remove update delete compute render layout format style border shadow margin padding height width center align justify display cursor scroll click hover focus submit reload refresh restart reset select toggle switch button input output screen cursor prompt browser window device sensor motion camera record stream volume audio player slider option control action search filter result random upload download connect server network cloud storage backup error signal timeout function return export import object method render layout position align shadow aesthetic algorithm ambiguous artificial astronomy biological catastrophic circumstance complexity consequence correlation cryptography determination discovery electricity environment exaggeration expression foundation hierarchy imagination independent instrument intelligence interaction interpret laboratory management metaphor motivation navigation observation perception philosophy population possibility prediction probability psychology realization revolution simulation situation structure technology transition university vocabulary volunteer architecture combination competition definition description education generation innovation leadership literature mathematics modification population preference profession relationship requirement responsible significant statistics temperature transmission typography application authentication calculation classification communication configuration conservation construction contradiction coordination determination documentation examination expectation foundation illustration implementation information integration interpretation investigation organization presentation representation reproduction specification synchronization transportation understanding visualization acknowledgment architecture circumference collaboration computation constellation cryptocurrency declaration decomposition discrimination distribution documentation identification justification manufacturing mathematical modification optimization parameter performance presentation reconciliation regulation simplification stimulation transformation visualization announcement architecture circumstance communication configuration consideration construction coordination determination documentation education implementation improvement information interaction interpretation investigation organization presentation representation responsibility satisfaction specification standardization synchronization transportation understanding visualization acknowledgment authentication characteristic collaboration computation constellation cryptography declaration demonstration discrimination distribution documentation engineering identification illumination investigation justification manufacturing mathematical optimization parameterization reconstruction simplification synchronization transformation visualization ! ? . , ; : ' " 1 2 3 4 5 6 7 8 9 0 ! ? . , ; : ' " 1 2 3 4 5 6 7 8 9 0 
`.split(" ");

let timeStarted = false;
let isTimeUp = false;
let timeLeft = 300;
let timeInterval;
let correctKeyStroke = 0;
let typedKeyStroke = 0;
let finalWpm = "00";
let finalAccuracy = "00";
const wordsLength = words.length;

const accuracyElement = document.querySelector(".accuracy");
const wpmElement = document.querySelector(".wpm");
const timeElement = document.getElementById("time");
const cursor = document.querySelector(".cursor");
const wordBox = document.querySelector(".word-box");
const hiddenInput = document.getElementById("hidden-input");

wordBox.setAttribute("tabindex", "0"); // make div focusable
loadWords();

// --- Helpers ---
function addClass(el, name) {
  el.classList.add(name);
}
function removeClass(el, name) {
  el.classList.remove(name);
}

function randomWords() {
  const randomIndex = Math.floor(Math.random() * wordsLength);
  return words[randomIndex];
}

function formatWords(word) {
  return `<div class="word">
    <span class="letter">${word
      .split("")
      .join(
        "</span><span class='letter'>"
      )}</span><span class="letter">&nbsp;</span>
  </div>`;
}

function loadWords() {
  const wordContainer = document.querySelector(".words");
  wordContainer.innerHTML = "";
  for (let i = 0; i < 200; i++) {
    wordContainer.innerHTML += formatWords(randomWords());
  }
  addClass(document.querySelector(".word"), "current");
  addClass(document.querySelector(".letter"), "current");
}

function scrollToActiveWords() {
  const activeWord = document.querySelector(".word.current");
  activeWord.scrollIntoView({ block: "center", behavior: "auto" });
}

// --- Cursor Focus Handling ---
hiddenInput.addEventListener("focus", () => {
  cursor.style.visibility = "visible";
})

hiddenInput.addEventListener("blur", () => {
  cursor.style.visibility = "hidden";
});

wordBox.addEventListener("click", () => {
  hiddenInput.focus();
});

// --- Typing Logic ---
hiddenInput.addEventListener("input", (e) => {
  if (isTimeUp === true) return;

  const value = e.target.value;
  const key = value[value.length - 1]; // last typed character
  if (!key) return;

  const currentLetter = document.querySelector(".letter.current");
  const currentWord = document.querySelector(".word.current");
  if (!currentLetter || !currentWord) {
    e.target.value = "";
    return;
  }

  const expected = currentLetter.textContent;

  if (!timeStarted && key.length === 1) {
    timeStarted = true;
    startTimer();
  }

  // ignore special stuff (mobile doesn't send backspace normally)
  if (key === "Backspace" || key === "Enter") {
    e.target.value = "";
    return;
  }

  typedKeyStroke++;

  if (expected === "\u00A0") {
    const isSpaceCorrect = key === " ";
    if (isSpaceCorrect) correctKeyStroke++;
    addClass(currentLetter, isSpaceCorrect ? "correct" : "wrong");
    removeClass(currentLetter, "current");
    removeClass(currentWord, "current");
    const nextWord = currentWord.nextElementSibling;
    if (nextWord) {
      addClass(nextWord, "current");
      addClass(nextWord.querySelector(".letter"), "current");
    }
  } else if (key.length === 1) {
    let isCorrect = key === expected;
    if (isCorrect) correctKeyStroke++;
    addClass(currentLetter, isCorrect ? "correct" : "incorrect");
    removeClass(currentLetter, "current");
    addClass(currentLetter.nextElementSibling, "current");
  }

  scrollToActiveWords();
  updateCursorPostion();
  calculateAccuracy();
  calculateWpm();

  // always clear hidden input after processing
  e.target.value = "";
});

// --- Timer ---
function updateTimeDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timeElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function startTimer() {
  timeInterval = setInterval(() => {
    timeLeft--;
    updateTimeDisplay();
    if (timeLeft <= 0) {
      clearInterval(timeInterval);
      alert(
        `Time's up \n wPM: ${calculateWpm()} \n Accuracy: ${calculateAccuracy()}`
      );
      timeStarted = false;
      isTimeUp = true;
      cursor.style.display = "none";
      addClass(wordBox, "grey-box");
    }
  }, 1000);
}

// --- update cursor position ---
function updateCursorPostion() {
  const nextLetter = document.querySelector(".letter.current");
  const rect = nextLetter.getBoundingClientRect();

  const container = wordBox.getBoundingClientRect();

  cursor.style.top = rect.top - container.top + "px";
  cursor.style.left = rect.left - container.left + "px";
}

// --- WPM & Accuracy ---
function calculateWpm() {
  const timeSpent = 300 - timeLeft;
  if (timeSpent <= 0) return 0;
  const wordsTyped = correctKeyStroke / 5;
  const wpm = wordsTyped / (timeSpent / 60);
  finalWpm = isNaN(wpm) || !isFinite(wpm) ? "0" : wpm.toFixed(2);
  wpmElement.textContent = "WPM: " + finalWpm;
  return finalWpm;
}

function calculateAccuracy() {
  const accuracy = (correctKeyStroke / typedKeyStroke) * 100;
  finalAccuracy =
    isNaN(accuracy) || !isFinite(accuracy) ? "0" : accuracy.toFixed(2);
  accuracyElement.textContent = "Accuracy: " + finalAccuracy + "%";
  return finalAccuracy;
}

// --- Window Load & Restart ---
window.addEventListener(
  "load",
  () => (document.querySelector(".words").scrollTop = 0)
);

document.querySelector(".restart").addEventListener("click", () => {
  timeStarted = false;
  isTimeUp = false;
  timeLeft = 300;
  correctKeyStroke = 0;
  typedKeyStroke = 0;
  finalWpm = "00";
  finalAccuracy = "00";
  clearInterval(timeInterval);
  loadWords();
  timeElement.textContent = "00:00";
  wpmElement.textContent = "WPM: " + finalWpm;
  accuracyElement.textContent = "Accuracy: " + finalAccuracy + "%";
  document.querySelector(".words").scrollTop = 0;
  cursor.style.top = "13px";
  cursor.style.left = "10px";
  hiddenInput.focus();
  removeClass(wordBox, "grey-box");
  cursor.style.display = "inline-block";
});
