import { SignalingChannel } from "./signaling_channel_gundb.js"

function uuid() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

export default class CyberDeck {
    static createPeer(config) {
        const signaling = new SignalingChannel(config.gundb, config.local, config.remote);

        let peer_configuration;
        if (config.xirsys) {
            if (config.debug) console.log("cyberdeck: using xirsys STUN and TURN");
            const userPass = config.xirsys.split(":");
            peer_configuration = {
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
        } else {
            if (config.debug) console.log("cyberdeck: using STUN only");
            peer_configuration = { iceServers: [{ urls: 'stun:' + config.stun }] };
        }
        const pc = new RTCPeerConnection(peer_configuration);

        pc.onicecandidate = ({ candidate }) => {
            if (config.debug) console.log("cyberdeck: identified ice candidate, sending to peer");
            signaling.send({ candidate: JSON.parse(JSON.stringify(candidate)) });
        }

        pc.onnegotiationneeded = async () => {
            try {
                await pc.setLocalDescription(await pc.createOffer());
                if (config.debug) console.log("cyberdeck: sending offer");
                signaling.send({ desc: JSON.parse(JSON.stringify(pc.localDescription)) });
            } catch (err) {
                console.error(err);
            }
        };

        pc.oniceconnectionstatechange = e => {
            if (config.debug) console.log("cyberdeck: peer connection state `" + pc.iceConnectionState + "`");
        }

        if (config.debug) console.log("cyberdeck: listening for offer");
        signaling.addListener(async ({ desc, candidate }) => {
            try {
                if (desc) {
                    if (desc.type === 'offer') {
                        if (config.debug) console.log("cyberdeck: offer received");
                        await pc.setRemoteDescription(desc);
                        await pc.setLocalDescription(await pc.createAnswer());
                        if (config.debug) console.log("cyberdeck: sending answer");
                        signaling.send({ desc: JSON.parse(JSON.stringify(pc.localDescription)) });
                    } else if (desc.type === 'answer') {
                        if (config.debug) console.log("cyberdeck: answer received");
                        await pc.setRemoteDescription(new RTCSessionDescription(desc));
                    } else {
                        console.error('Unsupported SDP type.');
                    }
                } else if (candidate) {
                    if (config.debug) console.log("cyberdeck: received ice candidate from peer");
                    await pc.addIceCandidate(candidate);
                }
            } catch (err) {
                console.error(err);
            }
        });
        return [pc,signaling];
    }

    static createInvite(config) {
        if (!config.local) {
            config.local = uuid();
            config.remote = uuid();
        }
        const [peer,signaling] = CyberDeck.createPeer(config);
        const dataChannel = peer.createDataChannel(config.name);
        if (config.data_channel_type) {
            if (config.debug) console.log("cyberdeck: using " + config.data_channel_type + " data channel type");
            dataChannel.binaryType = config.data_channel_type;
        } else {
            if (config.debug) console.log("cyberdeck: using string data channel type");
        }

        let errorPromise = new Promise(resolve => {
            dataChannel.onerror = (error) => {
                resolve({ error })
            };
        })
        let messagePromise = new Promise(resolve => {
            dataChannel.onmessage = (message) => {
                resolve({ message })
            };
        })
        let openPromise = new Promise(resolve => {
            dataChannel.onopen = (open) => {
                signaling.destroy();
                if (config.debug) console.log("cyberdeck: connection established, so signalling will stop");
                resolve({ open })
            };
        })
        let closePromise = new Promise(resolve => {
            dataChannel.onclose = (close) => {
                resolve({ close })
            };
        })

        return [config.local, config.remote, {
            send: dataChannel.send.bind(dataChannel),
            [Symbol.asyncIterator]() {
                return {
                    async next() {
                        let result = await Promise.race([errorPromise, messagePromise, openPromise, closePromise]);
                        if (result.error) {
                            errorPromise = new Promise(resolve => {
                                dataChannel.onerror = (error) => {
                                    resolve({ error })
                                };
                            })
                        } else if (result.message) {
                            messagePromise = new Promise(resolve => {
                                dataChannel.onmessage = (message) => {
                                    resolve({ message })
                                };
                            })
                        } else if (result.open) {
                            openPromise = new Promise(resolve => {
                                dataChannel.onopen = (open) => {
                                    resolve({ open })
                                };
                            })
                        } else if (result.close) {
                            closePromise = new Promise(resolve => {
                                dataChannel.onclose = (close) => {
                                    resolve({ close })
                                };
                            })
                            return { done: true, value: result };
                        }
                        return { done: result.close !== undefined, value: result };
                    }
                }
            }
        }];
    }

    static async joinInvite(config) {
        return new Promise(resolve => {
            const [peer,signaling] = CyberDeck.createPeer(config);
            if (config.debug) console.log("cyberdeck: waiting for data channel");
            peer.ondatachannel = function (ev) {
                const dataChannel = ev.channel;
                if (dataChannel.binaryType) {
                    if (config.debug) console.log("cyberdeck: data channel established of type string");
                } else {
                    if (config.debug) console.log("cyberdeck: data channel established of type " + dataChannel.binaryType);
                }
                let errorPromise = new Promise(resolve => {
                    dataChannel.onerror = (error) => {
                        resolve({ error })
                    };
                })
                let messagePromise = new Promise(resolve => {
                    dataChannel.onmessage = (message) => {
                        resolve({ message })
                    };
                })
                let openPromise = new Promise(resolve => {
                    dataChannel.onopen = (open) => {
                        signaling.destroy();
                        if (config.debug) console.log("cyberdeck: connection established, so signalling will stop");
                        resolve({ open })
                    };
                })
                let closePromise = new Promise(resolve => {
                    dataChannel.onclose = (close) => {
                        resolve({ close })
                    };
                })

                resolve({
                    send: dataChannel.send.bind(dataChannel),
                    [Symbol.asyncIterator]() {
                        return {
                            async next() {
                                let result = await Promise.race([errorPromise, messagePromise, openPromise, closePromise]);
                                if (result.error) {
                                    errorPromise = new Promise(resolve => {
                                        dataChannel.onerror = (error) => {
                                            resolve({ error })
                                        };
                                    })
                                } else if (result.message) {
                                    messagePromise = new Promise(resolve => {
                                        dataChannel.onmessage = (message) => {
                                            resolve({ message })
                                        };
                                    })
                                } else if (result.open) {
                                    openPromise = new Promise(resolve => {
                                        dataChannel.onopen = (open) => {
                                            resolve({ open })
                                        };
                                    })
                                } else if (result.close) {
                                    closePromise = new Promise(resolve => {
                                        dataChannel.onclose = (close) => {
                                            resolve({ close })
                                        };
                                    })
                                    return { done: true, value: result };
                                }
                                return { done: result.close !== undefined, value: result };
                            }
                        }
                    }
                });
            };
        })
    }
}