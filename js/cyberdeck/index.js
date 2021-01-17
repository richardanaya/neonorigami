import {SignalingChannel} from "./signaling_channel_gundb.js"

function uuid() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

export class CyberDeck {
    static createPeer(config) {
        const signaling = new SignalingChannel(config.gundb, config.local, config.remote);
        let configuration = { iceServers: [{ urls: 'stun:' + config.stun }] };
        if (config.xirsys) {
            const userPass = xonfig.xirsys.split(":");
            configuration = {
                iceServers: [{
                    urls: ["stun:ws-turn2.xirsys.com"]
                }, {
                    username: userPass[0],
                    credential: userPass[1],
                    urls: [
                        "turn:ws-turn2.xirsys.com:80?transport=udp",
                        "turn:ws-turn2.xirsys.com:3478?transport=udp",
                        "turn:ws-turn2.xirsys.com:80?transport=tcp",
                        "turn:ws-turn2.xirsys.com:3478?transport=tcp",
                        "turns:ws-turn2.xirsys.com:443?transport=tcp",
                        "turns:ws-turn2.xirsys.com:5349?transport=tcp"
                    ]
                }]
            }
        }
        const pc = new RTCPeerConnection(configuration);

        pc.onicecandidate = ({ candidate }) => {
            signaling.send({ candidate: JSON.parse(JSON.stringify(candidate)) });
        }

        pc.onnegotiationneeded = async () => {
            try {
                await pc.setLocalDescription(await pc.createOffer());
                signaling.send({ desc: JSON.parse(JSON.stringify(pc.localDescription)) });
                console.log("offer sent");
            } catch (err) {
                console.error(err);
            }
        };

        pc.oniceconnectionstatechange = e => console.log("Connection state:" + pc.iceConnectionState);

        signaling.addListener(async ({ desc, candidate }) => {
            try {
                if (desc) {
                    if (desc.type === 'offer') {
                        await pc.setRemoteDescription(desc);
                        await pc.setLocalDescription(await pc.createAnswer());
                        signaling.send({ desc: JSON.parse(JSON.stringify(pc.localDescription)) });
                    } else if (desc.type === 'answer') {
                        await pc.setRemoteDescription(new RTCSessionDescription(desc));
                    } else {
                        console.error('Unsupported SDP type.');
                    }
                } else if (candidate) {
                    await pc.addIceCandidate(candidate);
                }
            } catch (err) {
                console.error(err);
            }
        });
        return pc;
    }

    static createInvite(config, channelName) {
        if(!config.local){
            config.local = uuid();
            config.remote = uuid();
        }
        const peer = CyberDeck.createPeer(config);
        const dataChannel = peer.createDataChannel(channelName);
        return [config.local, config.remote, dataChannel];
    }

    static async joinInvite(config) {
        return new Promise(resolve => {
            const peer = CyberDeck.createPeer(config);
            peer.ondatachannel = function (ev) {
                resolve(ev.channel);
            };
        })
    }
}