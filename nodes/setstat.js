const Client = require("../lib/Client.js");

module.exports = function (RED) {
    function AirCon(config) {
        RED.nodes.createNode(this, config);

        let node = this;
        let client = new Client(node, config.host);

        node.on("input", function (msg) {
            client.getAirconStat()
                .then((airconStat) => {
                    for (let key in msg.payload) {
                        airconStat[key] = msg.payload[key];
                    }

                    client.setAirconStat()
                        .then((data) => {
                            msg.payload = data;

                            node.send(msg);
                        });
                })
                .catch((error) => {
                    client.handleError(error);
                });
        });
    }

    RED.nodes.registerType("mitsubishi-aircon-setstat", AirCon);
}