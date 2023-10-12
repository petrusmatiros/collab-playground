const socket = io();

const namePrompt = document.getElementById("name-prompt");
const nameInput = document.getElementById("name-input");
const nameSubmit = document.getElementById("name-submit");
const playground = document.getElementById("playground");
const cursor = document.getElementById("cursor");
const cursorName = document.getElementById("cursor-name");
const cursorIcon = document.getElementById("cursor-icon");
const cursors = document.getElementById("cursors");

let userPosition = { x: 0, y: 0 };

socket.on("connect", () => {
  console.log("Connected to server");
  checkIfUserExists();
});

function checkIfUserExists() {
  const c = getCookie("userid");
  if (c) {
    socket.emit("user-exists", c);
  } else {
    namePrompt.style.display = "block";
    playground.style.display = "none";
  }
}

function inputName(el) {
  function errorHandling(s) {
    if (s && s.length > 0) {
      s = s.trim();
    } else {
      s = "Anonymous";
    }
    return s;
  }
  nameOfUser = errorHandling(el.parentElement.children[1].value);
  socket.emit("name", nameOfUser);
}

socket.on("user-accepted", (user) => {
  namePrompt.style.display = "none";
  playground.style.display = "block";

  document.cookie = `userid=${user.id}; path=/; SameSite=Lax; max-age=${
    1000 * 60 * 60
  }`;

  document.addEventListener("mousemove", (event) => {
    const c = getCookie("userid");
    if (c) {
      userPosition = { x: event.clientX, y: event.clientY };
      socket.emit("position", c, userPosition);
      updateCursor();
    }
  });
});

function handleUserColor(color) {
  if (color && color.length > 0) {
    color = color.trim();
    if (
      color === "red" ||
      color === "blue" ||
      color === "green" ||
      color === "yellow" ||
      color === "purple" ||
      color === "orange" ||
      color === "pink"
    ) {
      return color;
    } else {
      return "blue";
    }
  }
}

function getCookie(name) {
  const cookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith(name + "="));
  if (!cookie) {
    return null;
  }
  return cookie.split("=")[1];
}

socket.on("position-updated", (users) => {
  updateCursor(users);
});

socket.on("user-joined", (users) => {
  var c = getCookie("userid");
  cursors.textContent = "";
  if (c) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id !== c) {
        // New cursor
        const newCursor = cursor.cloneNode(true);
        newCursor.id = users[i].id;

        const cursorChildren = newCursor.children;

        // Set name with color
        cursorChildren[1].textContent = users[i].name;
        cursorChildren[1].class = "";
        cursorChildren[1].classList.add(handleUserColor(users[i].color));

        // Set color of cursor
        cursorChildren[0].style.fill = users[i].color;

        cursors.appendChild(newCursor);
      }
    }
  }

  socket.emit("position", c, userPosition);
});

socket.on("user-left", (name) => {
  console.log(`User ${name} left`);
});

function updateCursor(users) {
  var c = getCookie("userid");
  if (c) {
    if (users) {
      for (let i = 0; i < users.length; i++) {
        if (users[i].id !== c) {
          const style = `display:block !important;left:${users[i].position.x}px;top:${users[i].position.y}px;`;
          const newCursor = document.getElementById(users[i].id);
          if (newCursor) {
            newCursor.style = style;
          }
        }
      }
    }
  }
}
