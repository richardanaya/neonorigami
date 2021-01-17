import 'aframe';
import { ClientNode } from './client_node';
import { ServerNode } from './server_node';
console.log("ＶＩＲＴＵＡＬ　ＲＥＡＬＩＴＹ　延ヶ安")
import { queryString } from "./util";

class NeonOirgami extends HTMLElement {
    connectedCallback() {
        this.innerHTML = "NEON ORIGAMI!"
        if (queryString("join")) {
            this.node = new ClientNode({
                gundb: queryString("gundb"),
                stun: queryString("stun"),
                xirsys: queryString("xirsys"),
                local: queryString("local"),
                remote: queryString("remote"),
                debug: true,
            })
        } else {
            this.node = new ServerNode({
                gundb: queryString("gundb"),
                stun: queryString("stun"),
                xirsys: queryString("xirsys"),
                debug: true,
            })
            console.log(this.node.join_url);
        }
    }
}
window.customElements.define('neon-origami', NeonOirgami);