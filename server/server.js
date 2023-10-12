const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// const session = require('express-session');

// app.use(session({
//     secret: 'b70f2585-2e7e-4b73-9142-9a2fd5e37b79',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 1000 * 60 * 60 }
// }))

const User = require("./user");

const { v4: uuidv4 } = require("uuid");

var __dirname = process.cwd() + "/public/";
const PORT = process.env.PORT || 3000;

app.use(function (req, res, next) {
  var err = null;
  try {
    decodeURIComponent(req.path);
  } catch (e) {
    err = e;
  }
  if (err) {
    console.log(err, req.url);
    return res.redirect(["https://", req.get("Host"), "/404"].join(""));
  }
  next();
});

console.log(__dirname);

// static folder
// app.use(express.static("public"));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "index.html");
});

// Catch all
app.get("*", (req, res) => {
  res.sendFile(__dirname + "404.html");
});

const users = new Map();
const ids = [];
const proxies = new Map();
const colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink"];

io.on("connection", (socket) => {
  socket.on("name", (name) => {
    userCreationHandler(socket, name);
  });

  socket.on("user-exists", (proxy) => {
    if (proxies.has(proxy)) {
      const id = proxies.get(proxy);
      const user = users.get(id);
      if (user) {
        console.log("accept")
        socket.emit("user-accepted", user);
        io.emit("user-joined", Array.from(users.values()));
      }
    }
  });

  socket.on("position", (proxy, position) => {
    if (proxies.has(proxy)) {
      const id = proxies.get(proxy);
      const user = users.get(id);
      if (user) {
        user.position = position;
        socket.broadcast.emit("position-updated", Array.from(users.values()));
      }
    }
  });

  socket.on("disconnect", () => {});
});
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

function userCreationHandler(socket, name) {
  if (name && name.length > 0) {
    console.log(`User ${name} attempting to join`);
    let isUniqueID = false;
    let id;
    let isUniqueProxy = false;
    let proxy;
    while (!isUniqueID) {
      id = uuidv4();
      if (!ids.includes(id)) {
        isUniqueID = true;
        ids.push(id);
      }
    }

    while (!isUniqueProxy) {
      proxy = uuidv4();
      if (!proxies.has(proxy)) {
        isUniqueProxy = true;
        proxies.set(proxy, id);
      }
    }

    if (isUniqueID && isUniqueProxy) {
      const u = new User(proxy, name, colors[random(0, colors.length - 1)]);
      users.set(id, u);
      console.log(`User ${u.name} joined`);
      socket.emit("user-accepted", u);
      socket.broadcast.emit("user-joined", Array.from(users.values()));
    }
  }
}

/**
 * [random - generates a random number between min and max]
 *
 * **Both the min and max are inclusive**
 *
 * @param   {number}  min  [the lower bound]
 * @param   {number}  max  [the upper bound]
 *
 * @return  {[type]}       [the random number]
 */
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
