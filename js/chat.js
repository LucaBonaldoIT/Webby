class Chat {
  static nickname = null;
  static address = null;
  static session_status = null;
  static current_chat = null;

  static opened_chat = ['global'];

  // Client/Server functions

  static open_connection() {

    Chat.nickname = Chat.getVariableFromHTML('nickname');
    Chat.address = Chat.getVariableFromHTML('address');
    Chat.current_chat = 'global';

    if (Chat.nickname == "null" || Chat.address == "null") return;

    Connection.configure(Chat.nickname, Chat.address, Chat.update_handler);
    Connection.open();

  }

  static send_message() {

    let content = $("#send-message-input").val();
    $("#send-message-input").val("");

    if (content == "")
      return;

    let timestamp = Chat.getTimestamp();

    Chat.append_message(Chat.nickname, content, timestamp);

    Connection.send(
      new Packet({
        name: Chat.nickname,
        address: Chat.address,
        type: "text",
        content: {
          recipient: Chat.current_chat,
          sender: Chat.nickname,
          text: content,
          timestamp: Chat.getTimestamp(),
        },
      })
    );
  }

  // Chat functions

  static clean_chat() {
    $("#chat-texts").html("");
  }

  static add_chat(name) {
    $("#chat-boxes").append(`
      <div id=${name + '-chat-box'} class='chat-box container d-flex flex-column justify-content-center my-2'>
        <p id=${name} class='text-light h5 fw-bold'>${name}</p>
      </div>
    `);
    Chat.opened_chat.push(name)
  }

  static get_chat(chat) {
    Connection.send(
      new Packet({
        name: Chat.nickname,
        address: Chat.address,
        type: "chat-request",
        content: chat,
      })
    );
  }

  static change_chat(chat) {
    if (!Nickname.is_valid(chat))
      return;

    if (Chat.opened_chat.indexOf(chat) == -1)
      Chat.add_chat(chat)

    Chat.clean_chat();

    $('#chat-boxes').children('.active-chat').removeClass('active-chat')
    Chat.current_chat = chat;
    $('#chat-boxes').children('#' + Chat.current_chat + '-chat-box').addClass('active-chat')
    Chat.get_chat(chat)

  }

  static load_chat(chat) {
    chat = JSON.parse(chat)
    for (let i = 0; i < chat["messages"].length; i++) {
      Chat.append_message(
        chat["messages"][i]["sender"],
        chat["messages"][i]["text"],
        chat["messages"][i]["timestamp"]
      );
    }
  }

  static append_message(name, content, timestamp) {
    let align = "align-self-start";

    if (name == Chat.nickname) align = "align-self-end";

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

  // Packet Handler

  static update_handler() {
    let packet = Connection.last_packet;
    Chat.current_page = Chat.getCurrentPage();

    console.log(packet)

    if (packet.type == "chat-request") {
      Chat.load_chat(packet.content);
    } else if (packet.type == "text") {
      let message = JSON.parse(packet.content)
      if (packet.name == Chat.nickname) return;

      if (Chat.current_chat == 'global')
        if (message['recipient'] == 'global')
          Chat.append_message(packet.name, message['text'], Chat.getTimestamp());

      if ((message['sender'] == Chat.current_chat) && (message['recipient'] == Chat.nickname))
        Chat.append_message(packet.name, message['text'], Chat.getTimestamp());
    }

    if (Chat.session_status != Connection.status) {
      Chat.session_status = Connection.status;
      Chat.setVariableToHTML('status', Chat.session_status)

      if (Chat.session_status == "connected") {
        Chat.changePageTo('connected')
        Chat.change_chat('global')
      } else if (Chat.session_status == "failed") {
        Chat.changePageTo('disconnected')
      } else if (Chat.session_status == "connecting") {
        Chat.changePageTo('connecting')

      } else {
        // Todo - Add handling
      }
    } else {
      if (Chat.session_status == "connected") {
        // Todo - Add handling
      } else if (Chat.session_status == "failed") {
        // Todo - Add handling
      } else {
        // Todo - Add handling
      }
    }
  }

  // Utilities

  static getTimestamp() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    return `${hours}:${minutes}`;
  };

  static getCurrentPage(){
    return Chat.getVariableFromHTML("current_page");
  };

  static changePageTo(page) {
    $("#" + Chat.current_page).css("z-index", "0");
    $("#" + page).css("z-index", "1");
    Chat.setVariableToHTML('current_page', 'chat')
  };

  static getVariableFromHTML(variable) {
    return $("#session-variables").children(variable).html();
  }

  static setVariableToHTML(variable, value) {
    return $("#session-variables").children(variable).html(value);
  }

}

// Listeners

$("#submit-nickname").on("click", Chat.open_connection);

$("#send-message-button").on("click", Chat.send_message);

$("#send-message-input").on("keypress", function (e) {
  if (e.key === "Enter" || e.keyCode === 13) {
    Chat.send_message();
  }
});

function temp_ChangeChat() {
  let new_chat = $('#new-chat-input').val();
  if (new_chat == '')
    return
  $('#new-chat-input').val('');
  Chat.change_chat(new_chat)
}

$("#search-chat-icon").on("click", temp_ChangeChat);

$("#new-chat-input").on("keypress", function (e) {
  if (e.key === "Enter" || e.keyCode === 13) {
    temp_ChangeChat();
  }
});

$('#chat-boxes').on('click', (e) => {
  chat = e.target.id
    if (chat != 'chat-boxes')
      Chat.change_chat(chat)
})