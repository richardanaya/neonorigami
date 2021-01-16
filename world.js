function uuid() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const isServer = getParameterByName("join") === null;

const gun = Gun({ peers: ['https://gunjs.herokuapp.com/gun'] });
const peer = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
});
peer.onicecandidate = e => {
    console.log(e)
}

function start(channel) {
    channel.onmessage = () => {
        console.log("data channel message");
    };
    channel.onopen = () => {
        console.log("data channel open");
    };
    channel.onclose = () => {
        console.log("data channel close");
    };
}

if (isServer) {
    (async function () {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        let offer_uuid = uuid();
        let answer_uuid = uuid();
        document.querySelector("#url").innerHTML = window.origin + window.location.pathname + `?join=gun&offer=${offer_uuid}&answer=${answer_uuid}`;
        console.log("sending offer to " + offer_uuid);
        gun.get(offer_uuid).put(JSON.parse(JSON.stringify(offer)));
        console.log("waiting for answer at " + answer_uuid);
        gun.get(answer_uuid).on(async function (data) {
            console.log("answer received");
            await peer.setRemoteDescription(new RTCSessionDescription(data));
            console.log("peer handshake complete");
            const channel = peer.createDataChannel("sendChannel");
            console.log("data channel created");
            start(channel);
        })
    })()
} else {
    let offer_uuid = getParameterByName("offer");
    let answer_uuid = getParameterByName("answer");
    console.log("waiting for offer");
    gun.get(offer_uuid).on(async function (data) {
        console.log("offer received at " + offer_uuid);
        await peer.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        console.log("sending answer to " + answer_uuid);
        gun.get(answer_uuid).put(JSON.parse(JSON.stringify(answer)));
        console.log("peer handshake complete");
        peer.ondatachannel = (event) => {
            console.log("data channel received");
            const channel = event.channel;
            start(channel);
        };
    })
}