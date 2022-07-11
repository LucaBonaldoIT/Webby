function check_nickname(e) {
  current_nickname = $("#nickname-input").val();
  err = $("#nickname-error-box");

  err_list = "<ul>";

  c = 0;

  if (current_nickname.length < 3) {
    c++;
    err_list += "<li>Nicknames should be at least 3 characters long!</li>";
  }

  if (current_nickname.indexOf(" ") >= 0) {
    c++;
    err_list += "<li>Nicknames should not contain white spaces!</li>";
  }

  if (c == 0) {
    $("#nickname-error-box").css("display", "none");
    $("#session-variables").children('nickname').html(current_nickname)
  } else {
    $("#nickname-error-box").css("display", "block");
    $("#session-variables").children('nickname').html('null')
  }

  err_list += "</ul>";

  $("#nickname-error-box").html(err_list);
}

$("#nickname-input").on("keyup", check_nickname);

$("#submit-nickname").on("click", check_nickname);
