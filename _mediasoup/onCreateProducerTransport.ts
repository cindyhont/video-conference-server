import send from "../_ws/send"
import createWebRtcTransport from "./createWebRtcTransport"
import { IproducerTransportCreated } from "./interfaces"
import { WebSocket } from 'ws'
import { setClient, setTransport } from "."

const onCreateProducerTransport = async (ws:WebSocket,clientID:string) => {
    try {
        const { transport, params } = await createWebRtcTransport()
        setClient({
            id:clientID,
            producerTransportID:transport.id
        })
        setTransport(transport)

        const message:IproducerTransportCreated = {
            type:'producerTransportCreated',
            payload: params
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