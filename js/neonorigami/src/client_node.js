import CyberDeck from "cyberdeck";

export class ClientNode {
    constructor(config) {
        this.config = config;
        setTimeout(async ()=>{
            let dataChannel = await CyberDeck.joinInvite({
                ...config
            });
            this.dataChannel = dataChannel;
            window.setTimeout(this.run.bind(this),1);
        },1);
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
                this.dataChannel.send("client hello");
            }
        }
    }
}