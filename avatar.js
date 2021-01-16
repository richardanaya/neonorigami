import { html, render } from 'https://unpkg.com/lit-html?module';

let firstTime = false;
let privateKey = null;
let exportedAvatar = null;
let currentIdentity = null;

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2);
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

const hasIdentityTemplate = () => html`
<div class="flex one center">
    <div style="max-width: 960px">
        <article>
            <section>
                <h1>Crypto Avatar</h1>
                <p>Hello <b>${currentIdentity.name}</b></p>
                <p>This is where you will be able to modify your avatar and export out it's data to use in virtual
                    worlds.</p>
            </section>
            ${firstTime ? html`
            <section>
                <h2>Don't forget!</h2>
                <p>This is your private key, save it somewhere safe. If you lose this private key you will
                    lose your ability to modify or verify ownership of this avatar.</p>
                <textarea>${privateKey}</textarea>
                <button @click="${savedPrivateKey}">I have put it some place safe</button>
            </section>
            ` : undefined}
            <section>
                <h2>Appearance</h2>
                <label for="skin_color">Skin Color:</label>
                <input @change="${skinChange} name=" skin_color" type="color" value="${currentIdentity.skin_color}">
            </section>
            <section>
                <h2>Preview</h2>
                <a-scene embedded>
                    <a-sphere id="avatar" position="0 1.25 -5" radius="1.25" color="${currentIdentity.skin_color}">
                    </a-sphere>
                    <a-sphere position="-.5 2.20 -4.25" radius=".25" color="white"></a-sphere>
                    <a-sphere position=".5 2.20 -4.25" radius=".25" color="white"></a-sphere>
                    <a-sphere position="-.5 2.10 -4.0" radius=".1" color="black"></a-sphere>
                    <a-sphere position=".5 2.10 -4.0" radius=".1" color="black"></a-sphere>
                    <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
                    <a-sky color="#ECECEC"></a-sky>
                </a-scene>
            </section>
            <section>
                ${exportedAvatar !== null ? html`<p>Here is your avatar data to take out into the world!
                    <textarea>${exportedAvatar}</textarea></p>` : undefined}
                    <button @click="${exportAvatar}">Export Avatar</button>
                    <button @click="${exit}">I'm Done</button>
            </section>
        </article>
    </div>
</div>`;

const createIdentityTemplate = () => html`
<div class="flex one center">
    <div style="max-width: 960px">
        <article>
            <section>
                <h1>Crypto Avatar</h1>
                <p>Welcome to this tool for creating/modifying avatars to use on virtual worlds. No information here
                    will be
                    stored on any server.</p>
                <h2>Are you new?</h2>
                <p>It looks like you don't have an active avatar identity. Would you like to create one? Give us a name
                    you'd
                    like for us to be able to give for this identity. This is the name the world will see. Worlds may
                    restrict
                    name length, filter profanity or non-standard characters, so its best to choose a simple name you
                    and
                    others
                    will understand.</p>
                <input id="avatar_name" type="text" />
                <button @click="${createIdentity}">Create Avatar</button>
                <h2>I already have an identity i'd like to use</h2>
                <label for="avatar_private_key">Private Key</label>
                <textarea name="avatar_private_key" id="avatar_private_key" type="text"></textarea>
                <label for="avatar_data">Avatar Data</label>
                <textarea name="avatar_data" id="avatar_data" type="text"></textarea><button
                    @click="${uploadIdentity}">Load
                    Avatar</button>
            </section>
        </article>
    </div>
</div>
`;

function skinChange() {
    exportedAvatar = null;
    let av = document.querySelector("#avatar");
    av.setAttribute("color", this.value);
    currentIdentity.skin_color = this.value;
    window.localStorage.setItem("neonorigami_identity", JSON.stringify(currentIdentity));
    renderAll();
}

function savedPrivateKey() {
    firstTime = false;
    renderAll();
}

function exit() {
    firstTime = false;
    exportedAvatar = null;
    privateKey = null;
    currentIdentity = null;
    window.localStorage.removeItem("neonorigami_private_key");
    window.localStorage.removeItem("neonorigami_identity");
    renderAll()
}


async function exportAvatar() {
    delete currentIdentity.signature;
    const priv = await window.crypto.subtle.importKey(
        "jwk",
        JSON.parse(privateKey),
        {
            name: "RSA-PSS",
            hash: { name: "SHA-256" },
        },
        true,
        ["sign"]
    );
    const sig = await window.crypto.subtle.sign(
        {
            name: "RSA-PSS",
            saltLength: 128,
        },
        priv,
        str2ab(JSON.stringify(currentIdentity))
    );
    currentIdentity.signature = ab2str(sig);
    exportedAvatar = JSON.stringify(currentIdentity)
    renderAll()
}

async function createIdentity() {
    let keys = await window.crypto.subtle.generateKey(
        {
            name: "RSA-PSS",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: { name: "SHA-256" },
        },
        true,
        ["sign", "verify"]
    );
    let pub = await window.crypto.subtle.exportKey(
        "jwk",
        keys.publicKey
    );

    let priv = await window.crypto.subtle.exportKey(
        "jwk",
        keys.privateKey
    );
    firstTime = true;
    const name = document.querySelector("#avatar_name").value;
    privateKey = JSON.stringify(priv)
    window.localStorage.setItem("neonorigami_private_key", privateKey);
    window.localStorage.setItem("neonorigami_identity", JSON.stringify({
        name,
        public_key: pub,
        skin_color: "#EF2D5E",
    }));
    renderAll()
}

function uploadIdentity() {
    privateKey = document.querySelector("#avatar_private_key").value;
    window.localStorage.setItem("neonorigami_private_key", privateKey);
    const data = document.querySelector("#avatar_data").value;
    window.localStorage.setItem("neonorigami_identity", data);
    renderAll()
}

async function renderAll() {
    let identity = window.localStorage.getItem("neonorigami_identity");
    let key = window.localStorage.getItem("neonorigami_private_key");
    const hasIdentity = identity != null && key != null;
    privateKey = key;
    currentIdentity = JSON.parse(identity);
    render(hasIdentity ? hasIdentityTemplate() : createIdentityTemplate(), document.body);
}

renderAll()
