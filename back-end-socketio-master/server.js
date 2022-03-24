import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
let ROOMS = [
  {
    name: "Global chat",
    participants: 0,
    id: 0,
    sockets: [],
  },
  {
    name: "Funny",
    participants: 0,
    id: 1,
    sockets: [],
  },
];

function createRoom({ name }) {
  const room = {
    name: name,
    participants: 0,
    id: 1,
    sockets: [],
  };
  articles.push(article);
  return article;
}

let app = express();
let http = createServer(app);
const PORT = 8080;
const io = new Server(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

io.on("connection", (socket) => {
  // socket object may be used to send specific messages to the new connected client
  console.log("new client connected");
  socket.emit("connection", null);
  socket.on("channel-join", (id) => {
    console.log("channel join", id);
    ROOMS.forEach((c) => {
      if (c.id === id) {
        if (c.sockets.indexOf(socket.id) == -1) {
          c.sockets.push(socket.id);
          c.participants++;
          io.emit("channel", c);
        }
      } else {
        let index = c.sockets.indexOf(socket.id);
        if (index != -1) {
          c.sockets.splice(index, 1);
          c.participants--;
          io.emit("channel", c);
        }
      }
    });

    return id;
  });
  socket.on("send-message", (message) => {
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    ROOMS.forEach((c) => {
      let index = c.sockets.indexOf(socket.id);
      if (index != -1) {
        c.sockets.splice(index, 1);
        c.participants--;
        io.emit("channel", c);
      }
    });
  });
});

/**
 * @description This methos retirves the static channels
 */
app.get("/getChannels", (req, res) => {
  res.json({
    channels: ROOMS,
  });
});

app.post("/createRoom", (req, res) => {
  const { name } = req.body;
  const newRoom = createRoom({ name });

  res
    .status(HTTP_CREATED)
    .header("Location", `/room/${newRoom.id}`)
    .json(newRoom);
});
