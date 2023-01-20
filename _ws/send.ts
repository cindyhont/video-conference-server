import { WebSocket } from "ws";
import { IwsMessage } from "../_mediasoup/interfaces";

const send = (message:IwsMessage,ws:WebSocket) => {
    ws.send(JSON.stringify(message))
}

export default send