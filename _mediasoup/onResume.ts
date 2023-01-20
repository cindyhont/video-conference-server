import { RtpCapabilities } from "mediasoup/node/lib/types"
import { WebSocket } from "ws"
import { getTransport } from "."
import send from "../_ws/send"
import { Iresumed } from "./interfaces"

const onResume = async (rtpCapabilities:RtpCapabilities,transportID:string,producerID:string,ws:WebSocket) => {
    const consumer = await getTransport(transportID)?.consume({
        producerId:producerID,
        rtpCapabilities,
    })
    await consumer.resume()

    const message:Iresumed = {
        type:'resumed'
    }
    send(message,ws)
}

export { onResume }