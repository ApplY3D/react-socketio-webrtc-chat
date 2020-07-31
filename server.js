const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const moment = require("moment");

const rooms = new Map([]);

app.use(express.json());

app.get("/room/:id", (req, res) => {
  const roomId = req.params.id;
  const data = rooms.has(roomId)
    ? {
        roomId,
        users: [...rooms.get(roomId).get("users").values()],
        messages: [...rooms.get(roomId).get("messages").values()],
      }
    : {
        roomId,
        users: [],
        messages: [],
      };
  res.json(data);
});

app.post("/rooms", (req, res) => {
  const { roomId, userName, userId } = req.body;
  if (!rooms.has(roomId)) {
    rooms.set(
      roomId,
      new Map([
        ["users", []],
        ["messages", []],
      ])
    );
  }
  res.send();
});

// ** SOCKET ** \\

io.on("connection", (socket) => {
  socket.emit("id", socket.id);

  socket.on("ROOM:JOIN", (data) => {
    socket.join(data.roomId);
    const user = {
      userId: socket.id,
      userName: data.userName,
    };
    rooms.get(data.roomId).get("users").push(user);
    const users = [...rooms.get(data.roomId).get("users").values()];
    socket.to(data.roomId).emit("ROOM:SET_USERS", users);
  });

  socket.on("ROOM:NEW_MESSAGE", (data) => {
    const obj = {
      userId: data.userId,
      userName: data.userName,
      text: data.text,
      time: moment().format("LTS"),
    };
    rooms.get(data.roomId).get("messages").push(obj);
    socket.to(data.roomId).broadcast.emit("ROOM:NEW_MESSAGE", obj);
  });

  socket.on("disconnect", () => {
    rooms.forEach((value, roomId) => {
      const removeIndex = value
        .get("users")
        .findIndex((user) => user.userId === socket.id);
      if (removeIndex !== -1) {
        value.get("users").splice(removeIndex, 1);
        const users = [...value.get("users").values()];
        socket.to(roomId).broadcast.emit("ROOM:SET_USERS", users);
      }
    });
  });

  // ** WEBRTC ** \\

  socket.on("CALL:USER", (data) => {
    socket.to(data.userToCall).emit("CALL:RECEIVE", {
      signal: data.signalData,
      from: data.from,
    });
  });

  // когда человек, которому звоним принял звонок
  socket.on("CALL:ACCEPTED_BY_USER", (data) => {
    socket.to(data.to).emit("CALL:ACCEPTED", data.signal);
  });

  // когда человек, которому звоним отменил звонок
  socket.on("CALL:CANCELED_BY_USER", (data) => {
    socket.to(data.to).emit("CALL:CANCELED", data);
  });

  // человек позвонил а потом решил отменить звонок
  socket.on("CALL:REJECTED_BY_USER_WHO_CALL", (data) => {
    socket.to(data.to).emit("CALL:REJECTED_BY_OWNER", data.from);
  });
});

server.listen(3001, () => {
  console.log("Server start");
});
