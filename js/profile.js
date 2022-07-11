connection = null;

function end_tutorial() {

    if ($('#session-variables').children('address').html() == 'null')
        return;
    if ($('#session-variables').children('nickname').html() == 'null')
        return;

    Connection.configure($('#session-variables').children('address').html());
    Connection.open();

}

$('#submit-nickname').on('click', end_tutorial)