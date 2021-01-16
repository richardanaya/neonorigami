const gun = Gun({ peers: ['https://gunjs.herokuapp.com/gun'] });

class SignalingChannel {
    constructor(local_uuid, remote_uuid) {
        this.lastMessageIndex = -1;
        this.outgoing = {};
        this.local_uuid = local_uuid;
        this.remote_uuid = remote_uuid;
        this.onmessage = undefined;
    }

    send(data) {
        if (this.outgoing.length === undefined) {
            this.outgoing.length = 0;
        }
        this.outgoing["message" + this.outgoing.length] = data;
        this.outgoing.length++;
        gun.get(this.remote_uuid).put({ content: JSON.stringify(this.outgoing) });
    }

    addListener(listener) {
        console.log("listening for data on " + this.local_uuid);
        this.onmessage = listener;
        gun.get(this.local_uuid).on(d => {
            const data = JSON.parse(d.content)
            if (this.onmessage) {
                while (this.lastMessageIndex < data.length - 1) {
                    this.lastMessageIndex++;
                    const arg = data["message" + this.lastMessageIndex];
                    this.onmessage(arg)
                }
            }
        });
    }
}

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

let stun = getParameterByName("stun");

const isServer = getParameterByName("join") === null;

let local_uuid = uuid();
let remote_uuid = uuid();

if (isServer) {
    document.body.innerHTML = "Send this url to the other person: <br>" + window.origin + window.location.pathname + `?stun=${stun}&join=gun&local=${remote_uuid}&remote=${local_uuid}`;
} else {
    const tmp = local_uuid;
    local_uuid = getParameterByName("local");
    remote_uuid = getParameterByName("remote");
}

const signaling = new SignalingChannel(local_uuid, remote_uuid);
const configuration = { iceServers: [{ urls: 'stun:' + stun }] };
const pc = new RTCPeerConnection(configuration);

// Send any ice candidates to the other peer.
pc.onicecandidate = ({ candidate }) => {
    signaling.send({ candidate: JSON.parse(JSON.stringify(candidate)) });
}

// Let the "negotiationneeded" event trigger offer generation.
pc.onnegotiationneeded = async () => {
    try {
        console.log("creating offer to send to client");
        await pc.setLocalDescription(await pc.createOffer());
        // Send the offer to the other peer.
        signaling.send({ desc: JSON.parse(JSON.stringify(pc.localDescription)) });
        console.log("offer sent");
    } catch (err) {
        console.error(err);
    }
};

// Once remote track media arrives, show it in remote video element.
pc.ontrack = (event) => {
    // Don't set srcObject again if it is already set.
    if (remoteView.srcObject) return;
    remoteView.srcObject = event.streams[0];
};

pc.oniceconnectionstatechange = e => console.log("Connection state:" + pc.iceConnectionState);

// Call start() to initiate.
async function start() {
    try {
        if (isServer) {
            console.log('Creating data channel');
            const dataChannel =
                pc.createDataChannel("myLabel");

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
            document.body.innerHTML = "Waiting to receive network info of server ... "
            pc.ondatachannel = function (ev) {
                console.log('Data channel is created!');
                const dataChannel = ev.channel;
                dataChannel.onerror = (error) => {
                    console.log("Data Channel Error:", error);
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
            };
        }
    } catch (err) {
        console.error(err);
    }
}

signaling.addListener(async ({ desc, candidate }) => {
    try {
        if (desc) {
            // If you get an offer, you need to reply with an answer.
            if (desc.type === 'offer') {
                console.log("received offer");
                await pc.setRemoteDescription(desc);
                await pc.setLocalDescription(await pc.createAnswer());
                console.log("sending answer");
                document.body.innerHTML = "Connecting ... this may take awhile (i've seen this take up to a minute)"
                signaling.send({ desc: JSON.parse(JSON.stringify(pc.localDescription)) });
            } else if (desc.type === 'answer') {
                console.log("received answer");
                await pc.setRemoteDescription(new RTCSessionDescription(desc));
                document.body.innerHTML = "A client wants to talk with us ... connecting"
            } else {
                console.log('Unsupported SDP type.');
            }
        } else if (candidate) {
            console.log("received candidate");
            await pc.addIceCandidate(candidate);
        }
    } catch (err) {
        console.error(err);
    }
});

start()