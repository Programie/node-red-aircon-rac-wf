# node-red-aircon-rac-wf

This node is based on the [ioBroker implementation from wolkeSoftware](https://github.com/wolkeSoftware/ioBroker.woso_mitsu_aircon_rac).

## Nodes

Currently, there are two nodes available.

### mitsubishi-aircon-getstat

This node is used to retrieve the current state of the air con.

Any input is ignored. The decoded state is written to the `payload` property of the message.

### mitsubishi-aircon-setstat

This node is used to change the current state of the air con.

The payload sent to this node is encoded and transferred to the air con.

You may specify any property contained in the `payload` property returned by the `mitsubishi-aircon-getstat` node.

Example payload (changes operation mode to cooling and turns on the device):

```json
{
  "operationMode": 1,
  "operation": true
}
```

## Aircon Stat

| Field                | Values                                          | Changeable? | Description              |
|----------------------|-------------------------------------------------|-------------|--------------------------|
| airFlow              | 0: Auto, 1-4: Fan speed                         | yes         | Fan speed                |
| coolHotJudge         |                                                 | yes         | Vacant Property Mode     |
| electric             |                                                 | no          |                          |
| entrust              |                                                 | no          |                          |
| errorCode            |                                                 | no          |                          |
| indoorTemp           |                                                 | no          | Room temperature         |
| isAutoHeating        |                                                 | no          |                          |
| isSelfCleanOperation |                                                 | no          |                          |
| isSelfCleanReset     |                                                 | no          |                          |
| isVacantProperty     |                                                 | no          |                          |
| modelNo              |                                                 | no          |                          |
| operation            | 0: Off, 1: On                                   | yes         | Power state (on/off)     |
| operationMode        | 0: Auto, 1: Cooling, 2: Heating, 3: Fan, 4: Dry | yes         | Current operation mode   |
| outdoorTemp          |                                                 | no          | Outdoor temperature      |
| presetTemp           |                                                 | yes         | Target temperature       |
| windDirectionLR      | 0: Auto, 1-7                                    | yes         | Horizontal fan direction |
| windDirectionUD      | 0: Auto, 1-4                                    | yes         | Vertical fan direction   |