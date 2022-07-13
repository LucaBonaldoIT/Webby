nickname = null;
address = null;

session_status = null;

const getTimestamp = () => {
  date = new Date();
  hours = date.getHours();
  minutes = date.getMinutes();
  return `${hours}:${minutes}`;
};

function update_handler() {
  packet = Connection.last_packet;
  current_page = $("#session-variables").children("current_page").html();

  if (packet.type == "chat-request") {
    load_chat(JSON.parse(packet.content));
  } else if (packet.type == "text") {
    if (packet.name == nickname) return;
    add_message(packet.name, packet.content, getTimestamp());
  }

  if (session_status != Connection.status) {
    session_status = Connection.status;
    $("#session-variables").children("status").html(session_status);

    if (session_status == "connected") {
      get_chat("global");
      $("#" + current_page).css("z-index", "0");
      $("#chat").css("z-index", "1");
      $("#session-variables").children("current_page").html("chat");
    } else if (session_status == "failed") {
      $("#" + current_page).css("z-index", "0");
      $("#disconnected").css("z-index", "1");
      $("#session-variables").children("current_page").html("disconnected");
    } else if (session_status == "connecting") {
      $("#" + current_page).css("z-index", "0");
      $("#connecting").css("z-index", "1");
      $("#session-variables").children("current_page").html("connecting");
    } else {
      // Todo - Add handling
    }
  } else {
    if (session_status == "connected") {
      // Todo - Add handling
      console.log("Still Connected");
    } else if (session_status == "failed") {
      console.log("Already not connected");
    } else {
      // Todo - Add handling
    }
  }
}

function end_tutorial() {
  if ($("#session-variables").children("address").html() == "null") return;
  if ($("#session-variables").children("nickname").html() == "null") return;

  nickname = $("#session-variables").children("nickname").html();
  address = $("#session-variables").children("address").html();

  Connection.configure(nickname, address, update_handler);
  Connection.open();
}

function send_message(e) {
  content = $("#send-message-input").val();
  if (content == "") return;
  timestamp = getTimestamp();
  add_message(nickname, content, timestamp);
  $("#send-message-input").val("");
  Connection.send(
    new Packet({
      name: nickname,
      address: address,
      type: "text",
      content: {
        recipient: "global",
        sender: nickname,
        text: content,
        timestamp: getTimestamp(),
      },
    })
  );
}

$("#submit-nickname").on("click", end_tutorial);
$("#send-message-button").on("click", send_message);
$("#send-message-input").on("keypress", function (e) {
  if (e.key === "Enter" || e.keyCode === 13) {
    content = $("#send-message-input").val();
    if (content == "") return;
    timestamp = getTimestamp();
    add_message(nickname, content, timestamp);
    $("#send-message-input").val("");
    Connection.send(
      new Packet({
        name: nickname,
        address: address,
        type: "text",
        content: {
          recipient: "global",
          sender: nickname,
          text: content,
          timestamp: getTimestamp(),
        },
      })
    );
  }
});

function get_chat(chat) {
  Connection.send(
    new Packet({
      name: nickname,
      address: address,
      type: "chat-request",
      content: chat,
    })
  );
}

function load_chat(chat) {
  clean_chat();
  for (let i = 0; i < chat["messages"].length; i++) {
    add_message(
      chat["messages"][i]["sender"],
      chat["messages"][i]["text"],
      chat["messages"][i]["timestamp"]
    );
  }
}

function add_chat(name) {
  $("#chat-boxes").append(`
    <div class='chat-box container d-flex flex-column justify-content-center my-2'>
      <p class='text-light h5 fw-bold'>${name}</p>
    </div>
  `);
}

function clean_chat() {
  $("#chat-texts").html("");
}

function add_message(name, content, timestamp) {
  align = "align-self-start";

  if (name == nickname) align = "align-self-end";

  $("#chat-texts").append(`
  <div class="message bg-dark d-flex flex-column shadow p-3 g-1 my-3 w-75 ${align}">
    <div class="sender align-self-start small fw-bold">${name}</div>
    <div class="content">${content}</div>
    <div class="timestamp align-self-end small fw-bold">${timestamp}</div>
  </div>
`);

  var elem = document.getElementById("chat-texts");
  elem.scrollTop = elem.scrollHeight;
}
