import { html, render } from 'https://unpkg.com/lit-html?module';

let firstTime = false;
let privateKey = null;
let exportedAvatar = null;
let currentIdentity = null;

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
        <p>Welcome to this tool for creating/modifying avatars to use on virtual worlds. No information here will be stored on any server.</p>
        <h2>Are you new?</h2>
        <p>It looks like you don't have an active avatar identity. Would you like to create one? Give us a name you'd like for us to be able to give for this identity. This is the name the world will see. Worlds may restrict name length, filter profanity or non-standard characters, so its best to choose a simple name you and others will understand.</p>
        <input id="avatar_name" type="text" />
        <button @click="${createIdentity}">Create Avatar</button>
        <h2>I already have an identity i'd like to use</h2>
        <label for="avatar_private_key">Private Key</label>
        <textarea name="avatar_private_key" id="avatar_private_key" type="text"></textarea>
        <label for="avatar_data">Avatar Data</label>
        <textarea name="avatar_data" id="avatar_data" type="text"></textarea><button
            @click="${uploadIdentity}">Load Avatar</button>
    </section>
</article>
`;

function savedPrivateKey() {
    firstTime = false;
    renderAll();
}

function exit() {
    privateKey = null;
    currentIdentity = null;
    window.localStorage.removeItem("neonorigami_private_key");
    window.localStorage.removeItem("neonorigami_identity");
    renderAll()
}


function exportAvatar() {
    console.log("Exporting")
    exportedAvatar = "a;slkdnf;lasdkn"
    renderAll()
}

function createIdentity() {
    firstTime = true;
    const name = document.querySelector("#avatar_name").value;
    privateKey = "abc"
    window.localStorage.setItem("neonorigami_private_key", privateKey);
    window.localStorage.setItem("neonorigami_identity", JSON.stringify({
        name
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
