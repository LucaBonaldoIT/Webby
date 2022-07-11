nickname = null;
address = null;

session_status = null;

function update_handler() {
  message = Connection.last_message;
  current_page = $('#session-variables').children('current_page').html()

  if (session_status != Connection.status) {
    session_status = Connection.status;
    $("#session-variables").children("status").html(session_status);

    if (session_status == "connected") {
        $('#'+current_page).css('z-index', '0')
        $('#chat').css('z-index', '1')
        $("#session-variables").children("current_page").html('chat');

    } else if (session_status == "failed") {
        $('#'+current_page).css('z-index', '0')
        $('#disconnected').css('z-index', '1')
        $("#session-variables").children("current_page").html('disconnected');

    } else if (session_status == "connecting") {
        $('#'+current_page).css('z-index', '0')
        $('#connecting').css('z-index', '1')
        $("#session-variables").children("current_page").html('connecting');

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

$("#submit-nickname").on("click", end_tutorial);
