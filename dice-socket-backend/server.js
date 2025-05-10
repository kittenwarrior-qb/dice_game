const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];
let playerPoints = {};
let currentPlayerIndex = 0;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("New player connected");

  // Thêm người chơi
  socket.on("addPlayer", (playerName) => {
    players.push(playerName);
    playerPoints[playerName] = 0;
    io.emit("updatePlayerList", players); // Cập nhật danh sách người chơi cho tất cả client
  });

  // Bắt đầu trò chơi
  socket.on("startGame", () => {
    io.emit("startGame"); // Phát ra sự kiện bắt đầu cho tất cả các client
  });

  // Xử lý đổ xúc xắc
  socket.on("rollDice", (playerName) => {
    const roll = Math.floor(Math.random() * 6) + 1;
    playerPoints[playerName] += roll;

    // Gửi kết quả đổ xúc xắc cho tất cả các client
    io.emit("diceRolled", { player: playerName, roll });

    // Tiến đến người chơi tiếp theo
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  });

  // Khi người chơi ngắt kết nối
  socket.on("disconnect", () => {
    console.log("Player disconnected");
    players = players.filter((player) => player !== socket.id);
    io.emit("updatePlayerList", players);
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
