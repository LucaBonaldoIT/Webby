function update_ip() {
    setTimeout(async () => {
        let response = await fetch("https://api.ipify.org/?format=json");
        let data = await response.json();
        $("#session-variables").children("address").html(data.ip);
    }, 1000)
}

update_ip()