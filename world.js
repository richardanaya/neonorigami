import {CyberDeck} from "./js/cyberdeck/cyberdeck.js"

export function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function log(msg){
    document.querySelector('textarea').innerHTML = msg+"\n"+document.querySelector('textarea').innerHTML;
}

(async function () {
    const gundb = getParameterByName("gundb");
    const stun = getParameterByName("stun");
    const xirsys = getParameterByName("xirsys");
    const local = getParameterByName("local");
    const remote = getParameterByName("remote");

    const isServer = getParameterByName("join") === null;
    if (isServer) {
        let [local_uuid, remote_uuid, dataChannel] = CyberDeck.createInvite({
            gundb,
            stun,
            xirsys,
            name: "my room",
            debug: true,
        });
        let url = window.origin + window.location.pathname + `?gundb=${gundb}&stun=${stun}&join=gun&local=${remote_uuid}&remote=${local_uuid}`;
        if (xirsys) {
            url = window.origin + window.location.pathname + `?gundb=${gundb}&xirsys=${xirsys}&join=gun&local=${remote_uuid}&remote=${local_uuid}`;
        }
        log("Send this url to the other person: " + url);
        dataChannel.onerror = (error) => {
            log("Data Channel Error:", error);
        };

        dataChannel.onmessage = (event) => {
            log("Client: "+ event.data);
        };

        dataChannel.onopen = () => {
            log("Connection established")
            dataChannel.send("Server has entered the chat");
        };

        dataChannel.onclose = () => {
            log("Client has left")
        };
        document.querySelector("button").addEventListener("click",()=>{
            log("Server: "+document.querySelector("input").value)
            dataChannel.send(document.querySelector("input").value)
            document.querySelector("input").value = ""
        })
    } else {
        let dataChannel = await CyberDeck.joinInvite({
            gundb,
            stun,
            xirsys,
            local,
            remote,
            debug: true,
        });
        dataChannel.onerror = (error) => {
            log("Data Channel Error:", error);
        };

        dataChannel.onmessage = (event) => {
            log("Server: "+ event.data);
        };

        dataChannel.onopen = () => {
            log("Connection established")
            dataChannel.send("Client has entered the chat");
        };

        dataChannel.onclose = () => {
            log("Server has left")
        };
        document.querySelector("button").addEventListener("click",()=>{
            log("Client: "+document.querySelector("input").value)
            dataChannel.send(document.querySelector("input").value)
            document.querySelector("input").value = ""
        })
    }
})()