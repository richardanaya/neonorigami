import Gun from 'gun/gun'

export class SignalingChannelGun {
    constructor(gundb_origin, local_uuid, remote_uuid) {
        this.gun = Gun({
            peers: ['https://' + gundb_origin + "/gun"],
            retry: -1,
        });
        this.lastMessageIndex = -1;
        this.outgoing = {};
        this.local_uuid = local_uuid;
        this.remote_uuid = remote_uuid;
        this.onmessage = undefined;
    }

    async send(data) {
        if (this.outgoing.length === undefined) {
            this.outgoing.length = 0;
        }
        this.outgoing["message" + this.outgoing.length] = data;
        this.outgoing.length++;
        this.gun.get(this.remote_uuid).put({ content: JSON.stringify(this.outgoing) });
    }

    addListener(listener) {
        this.onmessage = listener;
        if (this.listenerHandle) {
            this.listenerHandle.off()
        }
        this.listenerHandle = this.gun.get(this.local_uuid)
        this.listenerHandle.on(d => {
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

    destroy() {
        if (this.listenerHandle) {
            this.listenerHandle.off()
        }
        this.listenerHandle = undefined;
        // HACK: shutting down Gun's connection to a websocket currently has bugs in it
        // I have to say goodbye twice
        var mesh = this.gun.back('opt.mesh');
        var peers = this.gun.back('opt.peers');
        Object.keys(peers).forEach(id => {
            mesh.bye(id)
        });
        window.setTimeout(() => {
            var mesh = this.gun.back('opt.mesh');
            var peers = this.gun.back('opt.peers');
            Object.keys(peers).forEach(id => {
                mesh.bye(id)
            });
            this.gun = undefined
        }, 5000);
    }
}