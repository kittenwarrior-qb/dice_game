let player_list = [];
let result_list = [];
let dice_faces = ["1", "2", "3", "4", "5", "6"];
let player_points = {};
let currentPlayerIndex = 0;
let rounds = 1;
let usedDiceFaces = [];
let previousScores = []; // To keep track of the previous scores after each round

const socket = io("http://localhost:3000");

// _____________________________________VALUE________________________________________

const add_player_input = document.getElementById("add_player_input");
const add_player_button = document.getElementById("add_player_button");
const start_button = document.getElementById("start_button");
const playerList = document.getElementById("player_list");
const roll_dice_button = document.getElementById("roll_dice_button");
const dice_result = document.getElementById("dice_result");
const scoreboard = document.getElementById("scoreboard");
const reset_game_button = document.getElementById("reset_game_button");

// _____________________________________LOGIC________________________________________

add_player_button.addEventListener("click", function () {
  const player_name = add_player_input.value.trim();
  if (player_name) {
    socket.emit("addPlayer", player_name); // Gửi thông tin người chơi lên server
    player_list.push(player_name);
    player_points[player_name] = 0;
    add_player_input.value = "";
    updatePlayerList();
  }
});

socket.on("updatePlayerList", (players) => {
  player_list = players;
  updatePlayerList();
});

start_button.addEventListener("click", function () {
  if (player_list.length < 2) {
    alert("Please add at least 2 players.");
    return;
  }
  socket.emit("startGame"); // Gửi sự kiện bắt đầu trò chơi lên server
  roll_dice_button.disabled = false;
  start_button.disabled = true;
  document.getElementById("gameArea").style.display = "block";
});

reset_game_button.addEventListener("click", function () {
  player_list = [];
  result_list = [];
  player_points = {};
  add_player_input.value = "";
  roll_dice_button.disabled = true;
  start_button.disabled = false;
  document.getElementById("gameArea").style.display = "none";
  dice_result.innerHTML = "";
  scoreboard.innerHTML = "";
  playerList.innerHTML = "";
  previousScores = []; // Reset previous scores
});

let currentRoundResults = [];

roll_dice_button.addEventListener("click", function () {
  socket.emit("rollDice", player_list[currentPlayerIndex]); // Gửi yêu cầu đổ xúc xắc lên server
});

// Nhận kết quả đổ xúc xắc và cập nhật giao diện
socket.on("diceRolled", (data) => {
  const { player, roll } = data;
  player_points[player] += roll;
  dice_result.innerHTML += `${player} lắc ra ${roll}<br>`;
  currentPlayerIndex = (currentPlayerIndex + 1) % player_list.length;

  if (currentPlayerIndex === 0) {
    rounds++;
    usedDiceFaces = [];
  }

  updateScoreboard();
});

function applyUniqueScores() {
  let seenScores = new Set();
  let changes = [];

  Object.keys(player_points).forEach((player) => {
    let score = player_points[player];

    while (seenScores.has(score)) {
      score++;
    }
    player_points[player] = score;
    seenScores.add(score);
    changes.push(`${player} new score: ${score}`);
  });

  if (changes.length > 0) {
    console.log("Adjusted scores for uniqueness:", changes);
  }
}

function updateScoreboard() {
  let scoreboardHtml = "<h3>Điểm hiện tại:</h3><ul>";

  player_list.forEach((player) => {
    const points = player_points[player] ?? 0;
    scoreboardHtml += `<li>${player}: ${points}</li>`;
  });

  scoreboardHtml += "</ul>";
  scoreboard.innerHTML = scoreboardHtml;
}

function updatePlayerList() {
  playerList.innerHTML = "";
  player_list.forEach((player, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${player}`;
    playerList.appendChild(li);
  });

  start_button.disabled = player_list.length < 2;
}

document.addEventListener("DOMContentLoaded", function () {
  console.log(player_points);
});
