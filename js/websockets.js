class Ping {
  static interval = 30000;
  static delay = 10000;
}

class Message {
  constructor(dict) {
    this.name = dict["name"];
    this.address = dict["address"];
    this.type = dict["type"];
    this.content = dict["content"];
  }
  toJSON() {
    return {
      name: this.name,
      address: this.address,
      type: this.type,
      content: this.content,
    };
  }
}

class Connection {
  static server_address = "localhost";
  static client_address = null;
  static client_name = null;
  static status = null;
  static socket = null;
  static handshake_status = null;
  static ping_status = null;

  static configure(name, address) {
    Connection.client_name = name;
    Connection.client_address = address;
  }

  static send(message) {
    Connection.socket.send(JSON.stringify(message.toJSON()));
  }

  static open() {
    Connection.socket = new WebSocket(
      "ws://" + Connection.server_address + ":8763"
    );

    Connection.status = "connecting";

    Connection.socket.onerror = function (e) {
      // Todo - add onerror
    };

    Connection.socket.onopen = function (e) {
      Connection.send(
        new Message({
          name: Connection.client_name,
          address: Connection.client_address,
          type: "handshake",
          content: "",
        })
      );
    };

    Connection.socket.onmessage = function (event) {
      let message = new Message(JSON.parse(event.data));

      if (message.address == Connection.server_address) {
        // Start server message

        if (message.type == "handshake") {
          // Handshake start

          if (message.content == "success") {
            Connection.status = "connected";
            Connection.handshake_status = "good";

            message = new Message({
              address: Connection.client_address,
              type: "text",
              content: "Joined the chat",
            });

            Connection.send(message);

            setInterval(function () {
              let ping = new Message({
                address: Connection.client_address,
                type: "ping",
                content: "",
              });

              Connection.send(ping);

              Connection.ping_status = "waiting";

              setTimeout(function () {
                if (Connection.ping_status == "good");
                else {
                  Connection.status = "disconnected";
                  Connection.ping_status = "failed";
                }
              }, Ping.delay);
            }, Ping.interval);
          }

          // Handshake end
        } else if (message.type == "ping" && message.content == "alive") {
          // Ping start

          Connection.ping_status = "good";
        }

        // Ping end

        // End server message
      } else if (message.type == "text")
        // Start other client message

        $("#response").html(message.content);

      // End other client message
    };
  }
}

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
