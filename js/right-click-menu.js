is_menu_open = false;

$(document).on("contextmenu", function (e) {
  e.preventDefault();

  if (!is_menu_open) {
    $(".right-click-menu")
      .css("left", e.pageX + "px")
      .css("top", e.pageY + "px")
      .css("pointer-events", "all")
      .css("z-index", "2")
      .css("opacity", "1");

    is_menu_open = true;
  } else {
    $(".right-click-menu")
      .css("pointer-events", "none")
      .css("z-index", "0")
      .css("opacity", "0");
    is_menu_open = false;
  }
});

$(document).on("click", function (e) {
  if (!is_menu_open) return;

  $(".right-click-menu")
    .css("pointer-events", "none")
    .css("z-index", "0")
    .css("opacity", "0");
  is_menu_open = false;
  e.preventDefault();
});

$(document).on("click", ".right-click-menu", function (e) {
  if (!is_menu_open) return;

  $(".right-click-menu")
    .css("pointer-events", "none")
    .css("z-index", "0")
    .css("opacity", "0");
  is_menu_open = false;
});
