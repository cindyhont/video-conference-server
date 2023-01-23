import { Consumer, RtpCapabilities } from "mediasoup/node/lib/types"
import { WebSocket } from "ws"
import { getTransport, msRouter, setConsumer } from "."
import send from "../_ws/send"
import { Isubscribed } from "./interfaces"

const 
    onConsume = async(producerID:string, consumerTranportID:string, rtpCapabilities:RtpCapabilities,ws:WebSocket) => {
        const payload = await createConsumer(producerID,consumerTranportID,rtpCapabilities)
        if (!payload) return

        const message:Isubscribed = {
                type:'subscribed',
                payload
            }
        send(message,ws)
    },
    createConsumer = async (producerId:string, consumerTranportID:string, rtpCapabilities:RtpCapabilities) => {
        if (!msRouter.canConsume({producerId,rtpCapabilities})){
            console.error('can not consume')
            return
        }

        let consumer:Consumer
        try {
            consumer = await getTransport(consumerTranportID).consume({
                producerId,
                rtpCapabilities,
                paused: true,//false,//getProducer(producerId).kind !== 'video',
            })
            setConsumer(consumer)
        } catch (error) {
            console.error('consume failed: ',error)
            return
        }

        return {
            producerID:producerId,
            consumerID:consumer.id,
            kind:consumer.kind,
            rtpParameters:consumer.rtpParameters,
            type:consumer.type,
            producerPaused:consumer.producerPaused,
        }
    }

export { onConsume }