import { RtpCapabilities } from "mediasoup/node/lib/types"
import { WebSocket } from "ws"
import { getConsumer, getTransport } from "."
import send from "../_ws/send"
import { Iresumed } from "./interfaces"

const onResume = async (rtpCapabilities:RtpCapabilities,transportID:string,producerID:string,ws:WebSocket,consumerID:string) => {
    // const consumer = await getTransport(transportID)?.consume({
    //     producerId:producerID,
    //     rtpCapabilities,
    // })
    // await consumer.resume()
    await getConsumer(consumerID).resume()

    const message:Iresumed = {
        type:'resumed',
        payload:{
            consumerTransportID:transportID
        }
    }
    send(message,ws)
}

export { onResume }