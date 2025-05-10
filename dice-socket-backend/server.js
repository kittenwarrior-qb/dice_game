import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let players = [];

io.on("connection", (socket) => {
  console.log(`🟢 ${socket.id} connected`);

  socket.on("joinGame", (name) => {
    if (players.length >= 6) {
      socket.emit("joinError", "Room is full");
      return;
    }

    const player = { id: socket.id, name, total: 0 };
    players.push(player);
    io.emit("playersUpdate", players);
  });

  socket.on("rollDice", () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    players = players.map((p) => {
      if (p.id === socket.id) {
        p.total += roll;
      }
      return p;
    });

    const player = players.find((p) => p.id === socket.id);
    io.emit("diceRolled", { player, roll });
    io.emit("playersUpdate", players);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 ${socket.id} disconnected`);
    players = players.filter((p) => p.id !== socket.id);
    io.emit("playersUpdate", players);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server is running on http://localhost:3000");
});
