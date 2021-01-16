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

const hasIdentityTemplate = () => html`<article class="card">
    <section>
        <h1>Crypto Avatar</h1>
        <p>Hello <b>${currentIdentity.name}</b></p>
        <p>This is where you will be able to modify your avatar and export out it's data to use in virtual worlds.</p>
    </section>
    ${firstTime ? html`
    <section>
        <h3>Don't forget!</h3>
        <p>This is your private key, save it somewhere safe. If you lose this private key you will
            lose your ability to modify or verify ownership of this avatar.</p>
        <textarea>${privateKey}</textarea>
        <button @click="${savedPrivateKey}">I have put it some place safe</button>
    </section>
    ` : undefined}
    <section>
        <button @click="${exportAvatar}">Export Avatar</button>
        <button @click="${exit}">I'm Done</button>
        ${exportedAvatar !== null ? html`<p>Here is your avatar data to take out into the world!
            <textarea>${exportedAvatar}</textarea>` : undefined}</p>
    </section>
</article>`;

const createIdentityTemplate = () => html`<article class="card">
    <section>
        <h1>Crypto Avatar</h1>
        <p>Welcome to this tool for creating/modifying avatars to use on virtual worlds. No information here will be
            stored on any server.</p>
        <h2>Are you new?</h2>
        <p>It looks like you don't have an active avatar identity. Would you like to create one? Give us a name you'd
            like for us to be able to give for this identity. This is the name the world will see. Worlds may restrict
            name length, filter profanity or non-standard characters, so its best to choose a simple name you and others
            will understand.</p>
        <input id="avatar_name" type="text" />
        <button @click="${createIdentity}">Create Avatar</button>
        <h2>I already have an identity i'd like to use</h2>
        <label for="avatar_private_key">Private Key</label>
        <textarea name="avatar_private_key" id="avatar_private_key" type="text"></textarea>
        <label for="avatar_data">Avatar Data</label>
        <textarea name="avatar_data" id="avatar_data" type="text"></textarea><button @click="${uploadIdentity}">Load
            Avatar</button>
    </section>
</article>
`;

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
    console.log("Exporting")
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

    console.log("private")
    let priv = await window.crypto.subtle.exportKey(
        "jwk",
        keys.privateKey
    );
    console.log("done private")
    console.log(priv)
    firstTime = true;
    const name = document.querySelector("#avatar_name").value;
    privateKey = JSON.stringify(priv)
    window.localStorage.setItem("neonorigami_private_key", privateKey);
    window.localStorage.setItem("neonorigami_identity", JSON.stringify({
        name,
        public_key: pub
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
