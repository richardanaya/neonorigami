# cyberdeck

A library for ephemeral connections in the virtual web. This library is intented to use webrtc and distributed storage technologies for signalling. The basic idea is to give the the tools to get two browsers talking with as few servers as possible.

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
            local: getQueryString("local"),
            remote: getQueryString("rmeote")
        });
        dataChannel.onmessage = (event) => {
            document.body.innerHTML = event.data;
        };
    }
})()
  
var getQueryString = function (field, url) {
	var href = url ? url : window.location.href;
	var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
	var string = reg.exec(href);
	return string ? string[1] : null;
};
</script>
```
