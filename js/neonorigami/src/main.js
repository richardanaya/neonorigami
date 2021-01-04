import 'aframe';
console.log("ＶＩＲＴＵＡＬ　ＲＥＡＬＩＴＹ　延ヶ安")


class NeonOirgami extends HTMLElement {
    connectedCallback(){
        this.innerHTML = "NEON ORIGAMI!"
    }
}
window.customElements.define('neon-origami', NeonOirgami);