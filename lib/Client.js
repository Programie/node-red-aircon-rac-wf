"use strict";

const axios = require("axios");
const https = require("https");

const AirconStatClass = require("./AirconStat.js");
const AirconStatCoderClass = require("./AirconStatCoder.js");

class Client {
    constructor(node, config) {
        this.node = node;
        // "auto", "http" or "https". Nodes created before the protocol became
        // a choice only carry the useHttps checkbox: an explicit tick means
        // HTTPS was picked on purpose and is kept, while its unticked default
        // was never a decision and is better served by detection.
        this.configuredProtocol = config.protocol || (config.useHttps ? "https" : "auto");
        // Protocol known to work, learned on the first successful request.
        this.protocol = this.configuredProtocol === "auto" ? null : this.configuredProtocol;
        this.host = config.host;
        this.operatorId = config.operatorId || "";
        this.deviceId = config.deviceId || "";
        this.airconId = "";

        // Ignore self-signed certificate (in case HTTPS is used)
        this.httpsAgent = new https.Agent({
            rejectUnauthorized: false
        });

        this.airconStat = new AirconStatClass();
        this.airconStatCoder = new AirconStatCoderClass();
    }

    async post(command, contents = null) {
        let now = Date.now();
        let timestamp = Math.floor(now / 1000);

        let data = {
            "apiVer": "1.0",
            "command": command,
            "operatorId": this.operatorId,
            "deviceId": this.deviceId,
            "timestamp": timestamp
        };

        if (contents !== null) {
            data["contents"] = contents;
        }

        this.node.debug(`Sending data: ${JSON.stringify(data)}`);

        if (this.protocol !== null) {
            return await this.request(this.protocol, command, data).catch((error) => {
                if (this.configuredProtocol === "auto") {
                    // The module may have been updated to the other firmware
                    // branch, so allow detection to run again on the next
                    // request instead of failing from here on.
                    this.protocol = null;
                }

                throw error;
            });
        }

        // Modules ship with one of two firmware branches: older ones speak
        // plain HTTP on port 51443, newer ones TLS. Asking the wrong one ends
        // in a dropped connection ("socket hang up") or a TLS error rather
        // than an answer, so try both and remember what works.
        const protocols = ["http", "https"];

        for (const [index, protocol] of protocols.entries()) {
            try {
                const response = await this.request(protocol, command, data);

                this.node.log(`Detected ${protocol.toUpperCase()} as the protocol of ${this.host}`);
                this.protocol = protocol;

                return response;
            } catch (error) {
                if (index === protocols.length - 1) {
                    throw error;
                }

                this.node.debug(`Request via ${protocol.toUpperCase()} failed, trying ${protocols[index + 1].toUpperCase()}: ${error}`);
            }
        }
    }

    async request(protocol, command, data) {
        return await axios.post(`${protocol}://${this.host}:51443/beaver/command/${command}`, data, {
            headers: {
                "Connection": "close",
                "Content-Type": "application/json;charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "accept": "application/json"
            },
            httpsAgent: this.httpsAgent,
            timeout: 5000
        }).then((response) => {
            let data = response.data;

            this.node.debug(`Response: ${JSON.stringify(data)}`);
            return data;
        });
    }

    setNodeStatus(success) {
        this.node.status({
            fill: success ? "green" : " red",
            shape: "dot",
            text: success ? "success" : "error"
        });
    }

    handleError(error) {
        this.setNodeStatus(false);
        this.node.error(error);
    }

    async getAirconStat() {
        return await this.post("getAirconStat")
            .then((data) => {
                this.setNodeStatus(true);

                this.airconId = data.contents.airconId;
                this.airconStatCoder.fromBase64(this.airconStat, data.contents.airconStat);

                return this.airconStat;
            });
    }

    async setAirconStat() {
        let contents = {
            "airconId": this.airconId,
            "airconStat": this.airconStatCoder.toBase64(this.airconStat)
        };

        return await this.post("setAirconStat", contents)
            .then((data) => {
                this.setNodeStatus(data.result === 0);

                return data;
            });
    }
}

module.exports = Client;
