import WebSocket from "ws"
import { addClient, msRouter } from "."
import send from "../_ws/send"
import { IrouterCapabilities } from "./interfaces"

const onGetRouterRtpCapabilities = (ws:WebSocket,roomID:string,clientID:string,serverHost:string) => {
    addClient(ws,roomID,clientID,serverHost)
    const message:IrouterCapabilities = {
        type:'routerCapabilities',
        payload:{
            rtpCapabilities:msRouter.rtpCapabilities,
            clientID
        }
    }
    send(message,ws)
}

export { onGetRouterRtpCapabilities }