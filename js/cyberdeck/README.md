# cyberdeck

A library for ephemeral connections in the virtual web. This library is intented to use distributed storage technologies and webrtc. The basic idea is to give the the tools to get two browsers talking without the use of servers (or as few as possible).

Supported tech:
* gunDB
* STUN
* xirsys

## How to Use

Here's an extremely minimal scenario using STUN only

```html
<script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
<script type="module">
  import {CyberDeck} from "https://cdn.jsdelivr.net/npm/cyberdeck/cyberdeck.js"

(async function () {
    const isServer = getParameterByName("join") === null;
    if (isServer) {
        let [local_uuid, remote_uuid, dataChannel] = CyberDeck.createInvite({
            gundb: "gunjs.herokuapp.com",
            stun: "stun.l.my_stun_server.com:19302",
            name: "my room"
        });
        let url = window.origin + window.location.pathname + `?gundb=${gundb}&stun=${stun}&join=gun&local=${remote_uuid}&remote=${local_uuid}`;
        document.body.innerHTML = "Send this url to the other person: " + url;
        dataChannel.onopen = () => {
            dataChannel.send("Hello World!");
        };

    } else {
        let dataChannel = await CyberDeck.joinInvite({
            gundb: "gunjs.herokuapp.com",
            stun: "stun.l.my_stun_server.com:19302",
            local: getParameterByName("local"),
            remote: getParameterByName("rmeote")
        });
        dataChannel.onmessage = (event) => {
            document.body.innerHTML = event.data;
        };
    }
})()
  
export function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
</script>
```
