import 'aframe';
import { ClientNode } from './client_node';
import { ServerNode } from './server_node';
console.log("ＶＩＲＴＵＡＬ　ＲＥＡＬＩＴＹ　延ヶ安")
import { queryString } from "./util";
import { LitElement, html, css } from 'lit-element';


class NeonOrigami extends LitElement {
  constructor() {
    super();
  }

  static get styles() {
    return css`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100;400;700&display=swap');

        a {
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          color: transparent;
          text-shadow: 0 0 .1rem black;
        }

        a:hover {
          text-decoration: underline;
          font-weight: bold;
          color: #333;
          text-shadow: 0 0 .1rem black;
        }

        .noselect {
          -webkit-touch-callout: none; /* iOS Safari */
            -webkit-user-select: none; /* Safari */
             -khtml-user-select: none; /* Konqueror HTML */
               -moz-user-select: none; /* Old versions of Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
                    user-select: none; /* Non-prefixed version, currently
                                          supported by Chrome, Edge, Opera and Firefox */
        }

        .flip-card {
            font-family: 'IBM Plex Sans', sans-serif;
            background-color: transparent;
            width: 100%;
            height: 100%;
            perspective: 1000px; /* Remove this if you don't want the 3D effect */
          }
          
          /* This container is needed to position the front and back side */
          .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.8s;
            transform-style: preserve-3d;
          }
          
          /* Do an horizontal flip when you move the mouse over the flip box container */
          .flip-card.flipped .flip-card-inner {
            transform: rotateY(180deg);
          }
          
          /* Position the front and back side */
          .flip-card-front, .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden; /* Safari */
            backface-visibility: hidden;
            border-radius: 50px;
            background: #e0e0e0;
            box-shadow:  20px 20px 60px #bebebe,
            -20px -20px 60px #ffffff;
          }
  
          .flip-card-back {
            transform: rotateY(180deg);
          }

          .card-content {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
          }

          .flex-vertical {
            display: flex;
            flex-direction: column;
          }

          .flex-justify-center {
            justify-items: center;
          }

          .flex-justify-start {
            justify-items: start;
          }

          flex-align-center {
            align-items: center;
          }

          .flex-align-start {
            align-items: start;
          }

          .title {
            text-transform: uppercase;
            font-weight: bold;
            font-size: 1.4rem;
            margin-top: .3rem;
            margin-bottom: 1rem;
            text-shadow: 0 0 .1rem black;
          }

          .menu {
            margin: 1rem;
          }

          .menu a {
            line-height: 1.6rem;
          }
        `;
  }

  connectedCallback() {
    super.connectedCallback();
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
    this.innerHTML = ` <a-scene>
      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
      <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
      <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
      <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
      <a-sky color="#ECECEC"></a-sky>
    </a-scene>`
  }

  render() {
    return html`<div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <div class="card-content">
              <div class="menu flex-vertical flex-align-start">
                <span class="title noselect">Neon Origami</span>
                <a @click="${this.createWorld}">create a world</a>
                <a @click="${this.joinWorld}">join a world</a>
                <a href="https://neonorigami.com/avatar.html">my avatar</a>
                <a href="https://neonorigami.com/help.html">help</a>
                <a href="https://github.com/richardanaya/neonorigami">github</a>
              </div>
            </div>
          </div>
          <div class="flip-card-back">
          <slot></slot>
          </div>
        </div>
      </div>`;
  }

  createWorld() {
    this.shadowRoot.querySelector(".flip-card").classList.add("flipped");
  }
  joinWorld() {
    this.shadowRoot.querySelector(".flip-card").classList.add("flipped");
  }
  openAvatar() {

  }
}
window.customElements.define('neon-origami', NeonOrigami);