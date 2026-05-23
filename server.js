const WebSocket = require("ws");
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

let clients = {};
let nextId = 1;

wss.on("connection", (ws) => {
    const id = nextId++;
    clients[id] = ws;
    console.log("Jugador conectado:", id);

    ws.on("message", (data) => {
        for (const [cid, client] of Object.entries(clients)) {
            if (parseInt(cid) !== id && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        }
    });

    ws.on("close", () => {
        delete clients[id];
        console.log("Jugador desconectado:", id);
    });
});

console.log("Servidor relay en puerto", PORT);
