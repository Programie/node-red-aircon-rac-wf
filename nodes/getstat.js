const Client = require("../lib/Client.js");

module.exports = function (RED) {
    function AirCon(config) {
        RED.nodes.createNode(this, config);

        let node = this;
        let client = new Client(node, config.host);

        node.on("input", function (msg) {
            client.getAirconStat()
                .then((airconStat) => {
                    msg.payload = new Map(Object.entries(airconStat));

                    node.send(msg);
                })
                .catch((error) => {
                    client.handleError(error);
                });
        });
    }

    RED.nodes.registerType("mitsubishi-aircon-getstat", AirCon);
}