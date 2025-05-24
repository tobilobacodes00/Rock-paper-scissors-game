// --- Utility Data ---
const funFacts = [
  "Rock, Paper, Scissors originated in China over 2,000 years ago.",
  "In Japan, it's called 'Jan-Ken'.",
  "There are world championships for Rock, Paper, Scissors.",
  "Statistically, most people choose Rock first.",
  "It's used to settle disputes in many cultures.",
  "There are over 30 known variants of the game."
];

// --- DOM Elements ---
const playerScoreSpanElement = document.getElementById("player-score");
const computerScoreSpanElement = document.getElementById("computer-score");
const roundResultsMsg = document.getElementById("results-msg");
const winnerMsgElement = document.getElementById("winner-msg");
const optionsContainer = document.querySelector(".options-container");
const resetGameBtn = document.getElementById("reset-game-btn");
const rockBtn = document.getElementById("rock-btn");
const paperBtn = document.getElementById("paper-btn");
const scissorsBtn = document.getElementById("scissors-btn");
const playerNameInput = document.getElementById("player-name");
const saveNameBtn = document.getElementById("save-name-btn");
const playerLabel = document.getElementById("player-label");
const roundsSelect = document.getElementById("rounds-select");
const roundsToWinSpan = document.getElementById("rounds-to-win");
const difficultySelect = document.getElementById("difficulty-select");
const historyList = document.getElementById("history-list");
const leaderboardList = document.getElementById("leaderboard-list");
const funFactP = document.getElementById("funfact");
const shareBtn = document.getElementById("share-btn");
const themeToggle = document.getElementById("theme-toggle");

// --- Audio ---
const audioWin = document.getElementById("audio-win");
const audioLose = document.getElementById("audio-lose");
const audioTie = document.getElementById("audio-tie");
const audioClick = document.getElementById("audio-click");

// --- Game State ---
let playerScore = 0;
let computerScore = 0;
let roundsToWin = parseInt(roundsSelect.value);
let difficulty = difficultySelect.value;
let playerName = localStorage.getItem("rps_playerName") || "Player";
let gameHistory = JSON.parse(localStorage.getItem("rps_history") || "[]");
let leaderboard = JSON.parse(localStorage.getItem("rps_leaderboard") || "[]");
let currentRound = 1;
let gameOver = false;

// --- Helper Functions ---
function getRandomComputerResult() {
  const options = ["Rock", "Paper", "Scissors"];
  if (difficulty === "easy") {
    return options[Math.floor(Math.random() * options.length)];
  }
  // Hard mode: try to beat the player if possible
  if (lastPlayerChoice) {
    if (lastPlayerChoice === "Rock") return "Paper";
    if (lastPlayerChoice === "Paper") return "Scissors";
    if (lastPlayerChoice === "Scissors") return "Rock";
  }
  return options[Math.floor(Math.random() * options.length)];
}

function hasPlayerWonTheRound(player, computer) {
  return (
    (player === "Rock" && computer === "Scissors") ||
    (player === "Scissors" && computer === "Paper") ||
    (player === "Paper" && computer === "Rock")
  );
}

function playSound(type) {
  try {
    if (type === "win") audioWin.currentTime = 0, audioWin.play();
    else if (type === "lose") audioLose.currentTime = 0, audioLose.play();
    else if (type === "tie") audioTie.currentTime = 0, audioTie.play();
    else if (type === "click") audioClick.currentTime = 0, audioClick.play();
  } catch (e) {
    // Ignore play errors (autoplay policy, etc.)
  }
}

function updateLeaderboard() {
  // Only update if player won
  if (playerScore === roundsToWin) {
    leaderboard.push({ name: playerName, score: playerScore, date: new Date().toLocaleString() });
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 5) leaderboard = leaderboard.slice(0, 5);
    localStorage.setItem("rps_leaderboard", JSON.stringify(leaderboard));
  }
  leaderboardList.innerHTML = leaderboard
    .map(
      (entry, i) =>
        `<li><strong>${i + 1}.</strong> ${entry.name} - ${entry.score} (${entry.date})</li>`
    )
    .join("");
}

function updateHistory(player, computer, result) {
  gameHistory.push({
    round: currentRound,
    player,
    computer,
    result,
  });
  if (gameHistory.length > 10) gameHistory = gameHistory.slice(-10);
  localStorage.setItem("rps_history", JSON.stringify(gameHistory));
  historyList.innerHTML = gameHistory
    .map(
      (h) =>
        `<li>Round ${h.round}: <b>${h.player}</b> vs <b>${h.computer}</b> — <span>${h.result}</span></li>`
    )
    .join("");
}

function showRandomFunFact() {
  funFactP.textContent = funFacts[Math.floor(Math.random() * funFacts.length)];
}

function updatePlayerNameUI() {
  playerLabel.textContent = playerName;
  playerNameInput.value = playerName;
}

function resetGameState() {
  playerScore = 0;
  computerScore = 0;
  currentRound = 1;
  gameOver = false;
  playerScoreSpanElement.innerText = playerScore;
  computerScoreSpanElement.innerText = computerScore;
  winnerMsgElement.innerText = "";
  roundResultsMsg.innerText = "";
  resetGameBtn.style.display = "none";
  optionsContainer.style.display = "block";
  showRandomFunFact();
}

function setTheme(mode) {
  if (mode === "dark") {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "🌙Dark Mode";
  } else {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    themeToggle.textContent = "☀️Light Mode";
  }
  localStorage.setItem("rps_theme", mode);
}

// --- Main Game Logic ---
let lastPlayerChoice = null;

function getRoundResults(userOption) {
  lastPlayerChoice = userOption;
  const computerResult = getRandomComputerResult();
  let resultText = "";
  let resultType = "";

  if (hasPlayerWonTheRound(userOption, computerResult)) {
    playerScore++;
    resultText = `${playerName} wins! ${userOption} beats ${computerResult}`;
    resultType = "win";
  } else if (computerResult === userOption) {
    resultText = `It's a tie! Both chose ${userOption}`;
    resultType = "tie";
  } else {
    computerScore++;
    resultText = `Computer wins! ${computerResult} beats ${userOption}`;
    resultType = "lose";
  }

  updateHistory(userOption, computerResult, resultText);
  playSound(resultType);

  return resultText;
}

function showResults(userOption) {
  if (gameOver) return;
  roundResultsMsg.innerText = getRoundResults(userOption);
  computerScoreSpanElement.innerText = computerScore;
  playerScoreSpanElement.innerText = playerScore;

  if (playerScore === roundsToWin || computerScore === roundsToWin) {
    gameOver = true;
    winnerMsgElement.innerText = `${
      playerScore === roundsToWin ? playerName : "Computer"
    } has won the game!`;
    resetGameBtn.style.display = "block";
    optionsContainer.style.display = "none";
    updateLeaderboard();
  }
  currentRound++;
}

function resetGame() {
  resetGameState();
}

function savePlayerName() {
  playerName = playerNameInput.value.trim() || "Player";
  localStorage.setItem("rps_playerName", playerName);
  updatePlayerNameUI();
}

function handleRoundsChange() {
  roundsToWin = parseInt(roundsSelect.value);
  roundsToWinSpan.textContent = roundsToWin;
  resetGame();
}

function handleDifficultyChange() {
  difficulty = difficultySelect.value;
  resetGame();
}

function handleThemeToggle() {
  const isDark = document.body.classList.contains("dark-mode");
  setTheme(isDark ? "light" : "dark");
}



// --- Event Listeners ---
rockBtn.addEventListener("click", function () {
  playSound("click");
  showResults("Rock");
});
paperBtn.addEventListener("click", function () {
  playSound("click");
  showResults("Paper");
});
scissorsBtn.addEventListener("click", function () {
  playSound("click");
  showResults("Scissors");
});
resetGameBtn.addEventListener("click", resetGame);
saveNameBtn.addEventListener("click", savePlayerName);
roundsSelect.addEventListener("change", handleRoundsChange);
difficultySelect.addEventListener("change", handleDifficultyChange);
themeToggle.addEventListener("click", handleThemeToggle);
shareBtn.addEventListener("click", handleShare);

// --- Accessibility: Keyboard Navigation ---
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement === playerNameInput) {
    savePlayerName();
  }
});

// --- Initial Setup ---
(function init() {
  updatePlayerNameUI();
  roundsToWinSpan.textContent = roundsToWin;
  difficultySelect.value = difficulty;
  showRandomFunFact();
  // Theme
  const savedTheme = localStorage.getItem("rps_theme") || "dark";
  setTheme(savedTheme);
  // History & Leaderboard
  historyList.innerHTML = "";
  leaderboardList.innerHTML = "";
  gameHistory.forEach((h) =>
    updateHistory(h.player, h.computer, h.result)
  );
  leaderboard.forEach(() => updateLeaderboard());
  resetGameState();
})();