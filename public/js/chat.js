/**
 * ------------------------------------------------
 *
 * Client side script for connecting
 * and interacting with the chat server
 *
 * Uses the following scripts loaded in markup:
 *
 * io - (/socket.io/socket.io.js - made available by the node server in index.js
 * qs - utility for parsing query strings
 * moment - utility for date manipulation
 * mustache - template parsing
 * ------------------------------------------------
 */

// Grab existing socket
const socket = io();

// DOM Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true // remove the '?' before the first param
});

/**
 * Scroll chat message container if
 * the container is currently displaying the
 * latest message
 *
 * @returns undefined
 */
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  // substracting 'newMessageHeight' because we need to
  // compare BEFORE the new message is added, otherwise
  // containerHeight would never be lesser or equal to scrollOffset
  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// ------------------------------------------------
// Server socket events listeners
// ------------------------------------------------

// Server message event listener
socket.on("message", message => {
  // Compile template with data
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

// Location message event listener
socket.on("locationMessage", ({ username, url, createdAt }) => {
  console.log(url);
  const html = Mustache.render(locationMessageTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

// Chat room event listener
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector("#sidebar").innerHTML = html;
});

// ------------------------------------------------
// DOM events listeners
// ------------------------------------------------

// Message form submit event listener
$messageForm.addEventListener("submit", e => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, error => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("Message delivered");
  });
});

// Send my location button click event listener
$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");

  // ... getCurrentPosition does not support async/await or
  // promises. But it is asynchronic so we use a regular callback
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

// On script load, send a join event to the server
socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
