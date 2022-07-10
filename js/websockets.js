class Message {
  constructor(dict) {
    this.address = dict["address"];
    this.type = dict["type"];
    this.content = dict["content"];
  }
  toJSON() {
    return { address: this.address, type: this.type, content: this.content };
  }
}

server_address = "151.42.218.228";
session_ip = "NO-IP";
handshake_successful = false;
ping_successful = false;

async function get_ip(params) {
  let response = await fetch("https://api.ipify.org/?format=json");
  let data = await response.json();
  session_ip = data.ip;
  if (session_ip == server_address) session_ip = "SERVER";
}

socket = new WebSocket("ws://" + server_address + ":8763");

socket.onerror = function (e) {
  $("#connection-status").css("background-color", "red").html("NOT CONNECTED");
};

socket.onopen = function (e) {
  get_ip().finally(() => {
    let m = new Message({
      address: session_ip,
      type: "handshake",
      content: "",
    });
    socket.send(JSON.stringify(m.toJSON()));
    $("#connection-status").css("background-color", "orange").html("HANDSHAKE");
  });
};

socket.onmessage = function (event) {
  message = new Message(JSON.parse(event.data));

  if (message.address == server_address) {
    if (message.type == "handshake") {
      if (message.content == "success") {
        $("#connection-status")
          .css("background-color", "green")
          .html("CONNECTED");
        message = new Message({
          address: session_ip,
          type: "text",
          content: "Joined the chat",
        });
        socket.send(JSON.stringify(message.toJSON()));
        setInterval(function () {
          let m = new Message({
            address: session_ip,
            type: "ping",
            content: "",
          });
          socket.send(JSON.stringify(m.toJSON()));
          ping_successful = false;
          setTimeout(function () {
            if (!ping_successful)
              $("#connection-status")
                .css("background-color", "red")
                .html("NOT CONNECTED");
          }, 10000);
        }, 30000);
      }
    } else if (message.type == "ping" && message.content == "alive") {
      ping_successful = true;
    }
  } else if (message.type == "text") $("#response").html(message.content);
};

$("#send-message").on("click", () => {
  content = $("#message").val();
  $("#message").val("");
  message = new Message({
    address: session_ip,
    type: "text",
    content: content,
  });
  socket.send(JSON.stringify(message.toJSON()));
});

$("#message").on("keypress", function (e) {
  if (e.key === "Enter" || e.keyCode === 13) {
    e.preventDefault();
    content = $("#message").val();
    $("#message").val("");
    message = new Message({
      address: session_ip,
      type: "text",
      content: content,
    });
    socket.send(JSON.stringify(message.toJSON()));
  }
});
