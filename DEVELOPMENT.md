# Development

## Test in Node-RED

Start a local Node-RED instance running in a Docker container:
```bash
docker volume create node-red
docker run --rm --name node-red -v $PWD:/aircon-node:ro -v node-red:/data -p 1880:1880 nodered/node-red
```

In a second shell, install the module in Node-RED:
```bash
docker exec -it node-red bash
cd /data
npm install /aircon-node
```

Restart Node-RED by restarting the Docker container:
```shell
docker restart node-red
```

Open Node-RED in your browser by going to http://localhost:1880.

Now you should find the getstat and setstat nodes in the palette list.