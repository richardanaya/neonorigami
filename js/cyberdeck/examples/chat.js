async function run() {
    if (queryString("join") === null) {
        let [local_uuid, remote_uuid, dataChannel] = CyberDeck.createInvite({
            gundb: queryString("gundb"),
            stun: queryString("stun"),
            xirsys: queryString("xirsys"),
            name: "my room",
            debug: true,
        });
        let url = window.origin + window.location.pathname + `?gundb=${queryString("gundb")}&stun=${queryString("stun")}&join=gun&local=${remote_uuid}&remote=${local_uuid}`;
        if (queryString("xirsys")) {
            url = window.origin + window.location.pathname + `?gundb=${queryString("gundb")}&xirsys=${queryString("xirsys")}&join=gun&local=${remote_uuid}&remote=${local_uuid}`;
        }

        document.querySelector("button").addEventListener("click", () => {
            log("Server: " + document.querySelector("input").value)
            dataChannel.send(document.querySelector("input").value)
            document.querySelector("input").value = ""
        })


        log("Send this url to the other person: " + url);

        for await (const ev of dataChannel) {
            if (ev.close) log("Client has left")
            else if (ev.error) log("Data Channel Error:", ev.error);
            else if (ev.message) log("Client: " + ev.message.data);
            else if (ev.open) {
                log("Connection established")
                dataChannel.send("Server has entered the chat");
            }
        }
    } else {
        const dataChannel = await CyberDeck.joinInvite({
            gundb: queryString("gundb"),
            stun: queryString("stun"),
            xirsys: queryString("xirsys"),
            local: queryString("local"),
            remote: queryString("remote"),
            debug: true,
        });
        document.querySelector("button").addEventListener("click", () => {
            log("Client: " + document.querySelector("input").value)
            dataChannel.send(document.querySelector("input").value)
            document.querySelector("input").value = ""
        })
        for await (const ev of dataChannel) {
            if (ev.close) log("Server has left")
            else if (ev.error) log("Data Channel Error:", ev.error);
            else if (ev.message) log("Server: " + ev.message.data);
            else if (ev.open) {
                log("Connection established")
                dataChannel.send("Client has entered the chat");
            }
        }
    }
}

export function queryString(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function log(msg) {
    document.querySelector('textarea').innerHTML = msg + "\n" + document.querySelector('textarea').innerHTML;
}

run()