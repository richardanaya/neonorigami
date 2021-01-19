export class SignalingChannelEthereum {
    constructor(eth_addr, local_uuid, remote_uuid) {
        this.web3 = new Web3(window.web3.currentProvider);
        this.lastMessageIndex = -1;
        this.outgoing = {};
        this.local_uuid = local_uuid;
        this.remote_uuid = remote_uuid;
        this.onmessage = undefined;
        this.sendIntervalHandler = undefined;
        this.receiveIntervalHandler = undefined;
        this.loggedIn = false;
        this.loggingIn = false;
        let abi = [
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_key",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_value",
                        "type": "string"
                    }
                ],
                "name": "set",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_key",
                        "type": "string"
                    }
                ],
                "name": "get",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        this.sendDirty = false;
        this.contract = new this.web3.eth.Contract(abi, eth_addr);
        this.sendIntervalHandler = window.setInterval(async () => {
            if (this.loggedIn && this.sendDirty) {
                this.sendDirty = false;
                await this.contract.methods["set"](this.remote_uuid, JSON.stringify(this.outgoing)).send({ from: this.accounts[0] })
            }
        }, 5000);
    }

    async send(data) {
        if (!this.loggedIn) {
            if (window.ethereum && !this.loggingIn) {
                this.loggingIn = true;
                try {
                    await ethereum.enable();
                    this.accounts = await this.web3.eth.getAccounts();
                    this.loggedIn = true;
                } catch (e) {
                    console.error(e);
                }
            }
        }
        if (this.outgoing.length === undefined) {
            this.outgoing.length = 0;
        }
        this.outgoing["message" + this.outgoing.length] = data;
        this.outgoing.length++;
        this.sendDirty = true;
    }

    addListener(listener) {
        this.onmessage = listener;
        this.receiveIntervalHandler = window.setInterval(async () => {
            if (!this.loggedIn) {
                if (window.ethereum && !this.loggingIn) {
                    this.loggingIn = true;
                    try {
                        await ethereum.enable();
                        this.accounts = await this.web3.eth.getAccounts();
                        this.loggedIn = true;
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
            if (this.loggedIn) {
                try {
                    const result = await this.contract.methods["get"](this.local_uuid).call({ from: this.accounts[0] })
                    if (result !== "") {
                        const data = JSON.parse(result)
                        if (this.onmessage) {
                            while (this.lastMessageIndex < data.length - 1) {
                                this.lastMessageIndex++;
                                const arg = data["message" + this.lastMessageIndex];
                                this.onmessage(arg)
                            }
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }, 1000);
    }

    destroy() {
        window.clearInterval(this.receiveIntervalHandler)
        window.clearInterval(this.sendIntervalHandler)
    }
}