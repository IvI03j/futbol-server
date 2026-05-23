const WebSocket = require("ws");
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

let esperando = null;

wss.on("connection", (ws) => {
    console.log("Jugador conectado");

    if (esperando === null) {
        // Primer jugador, espera
        esperando = ws;
        ws.send(JSON.stringify({ tipo: "esperando" }));
        console.log("Jugador 1 esperando...");

        ws.on("close", () => {
            if (esperando === ws) {
                esperando = null;
                console.log("Jugador 1 desconectado mientras esperaba");
            }
        });

        ws.on("message", (data) => {
            // Jugador 1 no manda nada mientras espera
        });

    } else {
        // Segundo jugador, emparejamos
        const j1 = esperando;
        const j2 = ws;
        esperando = null;

        console.log("¡Partida encontrada!");

        j1.send(JSON.stringify({ tipo: "emparejado", rol: "host" }));
        j2.send(JSON.stringify({ tipo: "emparejado", rol: "cliente" }));

        // Relay de mensajes entre los dos
        j1.on("message", (data) => {
            if (j2.readyState === WebSocket.OPEN) j2.send(data);
        });

        j2.on("message", (data) => {
            if (j1.readyState === WebSocket.OPEN) j1.send(data);
        });

        j1.on("close", () => {
            if (j2.readyState === WebSocket.OPEN)
                j2.send(JSON.stringify({ tipo: "rival_desconectado" }));
        });

        j2.on("close", () => {
            if (j1.readyState === WebSocket.OPEN)
                j1.send(JSON.stringify({ tipo: "rival_desconectado" }));
        });
    }
});

console.log("Servidor matchmaking en puerto", PORT);
