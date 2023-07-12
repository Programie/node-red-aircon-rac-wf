"use strict";

const axios = require("axios");

const AirconStatClass = require("./AirconStat.js");
const AirconStatCoderClass = require("./AirconStatCoder.js");

class Client {
    constructor(node, host, operatorId, deviceId) {
        this.node = node;
        this.host = host;
        this.operatorId = operatorId || "";
        this.deviceId = deviceId || "";
        this.airconId = "";

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

        return await axios.post(`http://${this.host}:51443`, data, {
            headers: {
                "Connection": "close",
                "Content-Type": "application/json;charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "accept": "application/json"
            },
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