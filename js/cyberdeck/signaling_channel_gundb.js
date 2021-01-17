export class SignalingChannel {
    constructor(gundb_origin, local_uuid, remote_uuid) {
        this.gun = Gun({ peers: ['https://' + gundb_origin + "/gun"] });
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
        this.gun.get(this.remote_uuid).put({ content: JSON.stringify(this.outgoing) });
    }

    addListener(listener) {
        this.onmessage = listener;
        this.gun.get(this.local_uuid).on(d => {
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