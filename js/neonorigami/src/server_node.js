import CyberDeck from "cyberdeck";

export class ServerNode {
    constructor(config) {
        this.config = config;
        this.join_url = undefined;
        let [local_uuid, remote_uuid, dataChannel] = CyberDeck.createInvite({
            name: "virtual_world",
            ...config
        });
        this.join_url = window.origin + window.location.pathname + `?gundb=${this.config.gundb}&stun=${this.config.stun}&join=gun&local=${remote_uuid}&remote=${local_uuid}`;
        if (this.config.xirsys) {
            this.join_url = window.origin + window.location.pathname + `?gundb=${this.config.gundb}&xirsys=${this.config.xirsys}&join=gun&local=${remote_uuid}&remote=${local_uuid}`;
        }
        this.dataChannel = dataChannel;
        window.setTimeout(this.run.bind(this),1);
    }

    async run(){
        for await (const ev of this.dataChannel) {
            if (ev.close) {
                return;
            }
            else if (ev.error) {
                console.error(ev.error)
            }
            else if (ev.message) {
                console.log(ev.message.data)
            }
            else if (ev.open) {
                this.dataChannel.send("server hello");
            }
        }
    }
}