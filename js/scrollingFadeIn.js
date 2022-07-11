$(document).ready(function () {
  setTimeout(function () {

    k = 200
    i = 150

    setTimeout(function () {
      $("#title-0").animate(
        { opacity: "1" },
        {
          step: function (now, fx) {
            $(this).css("transform", "translateY(" + (now) * -30 + "px)"); //
          },
          duration: "normal",
        },
        "linear"
      );
    }, k);

    k += i

    setTimeout(function () {
      $("#title-1").animate(
        { opacity: "1" },
        {
          step: function (now, fx) {
            $(this).css("transform", "translateY(" + (now) * -30 + "px)"); //
          },
          duration: "normal",
        },
        "linear"
      );
    }, k);
    k += i

    setTimeout(function () {
      $("#title-2").animate(
        { opacity: "1" },
        {
          step: function (now, fx) {
            $(this).css("transform", "translateY(" + (now) * -30 + "px)"); //
          },
          duration: "normal",
        },
        "linear"
      );
    }, k);
    k += i

    setTimeout(function () {
      $("#title-3").animate(
        { opacity: "1" },
        {
          step: function (now, fx) {
            $(this).css("transform", "translateY(" + (now) * -30 + "px)"); //
          },
          duration: "normal",
        },
        "linear"
      );
    }, k);
    k += i

    setTimeout(function () {
      $("#form").animate(
        { opacity: "1" },
        {
          step: function (now, fx) {
            $(this).css("transform", "translateY(" + (now) * -30 + "px)"); //
          },
          duration: "normal",
        },
        "linear"
      );
    }, k);
    k += i

  }, 0); // Set delay to 1500 to sync with other animations

  /* Every time the window is scrolled ... */
  $(window).scroll(function () {
    /* Check the location of each desired element */
    $(".fade-in").each(function (i) {
      var bottom_of_object = $(this).position().top + $(this).outerHeight();
      var bottom_of_window = $(window).scrollTop() + $(window).height();

      /* If the object is completely visible in the window, fade it it */
      if (bottom_of_window > bottom_of_object) {
        $(this).animate(
          { opacity: "1" },
          {
            step: function (now, fx) {
              $(this).css("transform", "translateY(" + (1 - now) * 50 + "px)"); //
            },
            duration: "slow",
          },
          "linear"
        );
      }
    });
  });
});
