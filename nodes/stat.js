const Client = require("../lib/Client.js");

function getClient(node, config) {
    return new Client(node, config.host, config.useHttps, config.operatorId, config.deviceId);
}

module.exports = function (RED) {
    function GetStatNode(config) {
        RED.nodes.createNode(this, config);

        let node = this;
        let client = getClient(node, config);

        node.on("input", function (msg) {
            client.getAirconStat()
                .then((airconStat) => {
                    msg.name = config.name;
                    msg.host = config.host;
                    msg.payload = Object.fromEntries(Object.entries(airconStat));

                    node.send(msg);
                })
                .catch((error) => {
                    client.handleError(error);
                });
        });
    }

    RED.nodes.registerType("mitsubishi-aircon-getstat", GetStatNode);

    function SetStatNode(config) {
        RED.nodes.createNode(this, config);

        let node = this;
        let client = getClient(node, config);

        node.on("input", function (msg) {
            client.getAirconStat()
                .then((airconStat) => {
                    for (let key in msg.payload) {
                        airconStat[key] = msg.payload[key];
                    }

                    client.setAirconStat()
                        .then((data) => {
                            msg.name = config.name;
                            msg.host = config.host;
                            msg.payload = data;

                            node.send(msg);
                        })
                        .catch((error) => {
                            client.handleError(error);
                        });
                })
                .catch((error) => {
                    client.handleError(error);
                });
        });
    }

    RED.nodes.registerType("mitsubishi-aircon-setstat", SetStatNode);
}
