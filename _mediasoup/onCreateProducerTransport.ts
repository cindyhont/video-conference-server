import send from "../_ws/send"
import createWebRtcTransport from "./createWebRtcTransport"
import { IproducerTransportCreated } from "./interfaces"
import { WebSocket } from 'ws'
import { setClientProducerTransportID, setTransport } from "."
import { MediaKind } from "mediasoup/node/lib/types"

const onCreateProducerTransport = async (ws:WebSocket,clientID:string,kind:MediaKind) => {
    try {
        const { transport, params } = await createWebRtcTransport()
        setClientProducerTransportID(
            clientID,
            transport.id,
            kind
        )
        setTransport(transport)

        const message:IproducerTransportCreated = {
            type:'producerTransportCreated',
            payload: {params,kind}
        }
        send(message,ws)
    } catch (error) {
        console.error(error)
        ws.send(JSON.stringify({
            type:'error',
            payload: error
        }))
    }
}

export default onCreateProducerTransport