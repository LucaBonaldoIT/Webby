function check_password(e) {
  current_password = $("#password-input").val();
  err = $("#password-error-box");

  err_list = "<ul>";

  c = 0;

  if (current_password.length < 8) {
    c++;
    err_list += "<li>Passwords should be at least 8 characters long!</li>";
  }

  if (current_password.indexOf(" ") >= 0) {
    c++;
    err_list += "<li>Passwords should not contain white spaces!</li>";
  }

  if (!/^[a-zA-Z0-9 ]+$/.test(current_password)) {
    c++;
    err_list += "<li>Passwords should not contain symbols!</li>";
  }

  if (c == 0) {
    err.css("display", "none");
    $("#session-variables").children("password").html(current_password);
  } else {
    err.css("display", "block");
    $("#session-variables").children("password").html("null");
  }

  err_list += "</ul>";

  err.html(err_list);
}

class Password {
  static is_valid(password) {
    if (password.length < 8) {
      return false;
    }

    if (nickname.indexOf(" ") >= 0) {
      return false;
    }

    if (!/^[a-zA-Z0-9 ]+$/.test(nickname)) {
      return false;
    }
    return true;
  }
}

$("#password-input").on("keyup", check_password);

$("#submit-nickname").on("click", check_password);
