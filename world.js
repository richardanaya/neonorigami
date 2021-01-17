import {CyberDeck} from "./js/cyberdeck/index.js"

export function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

(async function () {
    debugger;
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
            name: "my room"
        });
        let url = window.origin + window.location.pathname + `?gundb=${gundb}&stun=${stun}&join=gun&local=${remote_uuid}&remote=${local_uuid}`;
        if (xirsys) {
            url = window.origin + window.location.pathname + `?gundb=${gundb}&xirsys=${xirsys}&join=gun&local=${remote_uuid}&remote=${local_uuid}`;
        }
        console.log("Send this url to the other person: " + url);
        dataChannel.onerror = (error) => {
            console.log("Data Channel Error:", error);
        };

        dataChannel.onmessage = (event) => {
            console.log("Got Data Channel Message:", event.data);
        };

        dataChannel.onopen = () => {
            console.log("opened")
            document.body.innerHTML = "Sent the peer a message!"
            dataChannel.send("Hello World!");
        };

        dataChannel.onclose = () => {
            console.log("The Data Channel is Closed");
        };
    } else {
        let dataChannel = await CyberDeck.joinInvite({
            gundb,
            stun,
            xirsys,
            local,
            remote
        });
        dataChannel.onerror = (error) => {
            console.error("Data Channel Error:", error);
        };

        dataChannel.onmessage = (event) => {
            document.body.innerHTML = "Got Data Channel Message:" + event.data;
        };

        dataChannel.onopen = () => {
            console.log("opened")
            document.body.innerHTML = "data channel opened with peer!"
        };

        dataChannel.onclose = () => {
            console.log("The Data Channel is Closed");
        };
    }
})()