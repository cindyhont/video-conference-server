import { RtpCapabilities, Transport } from "mediasoup/node/lib/types"
import { WebSocket } from "ws"
import { addConsumerTransport, getProducer, msRouter } from "."
import send from "../_ws/send"
import createWebRtcTransport from "./createWebRtcTransport"
import { IconsumerTransportCreated } from "./interfaces"

const 
    onCreateConsumerTransport = async (ws:WebSocket,clientID:string,producerID:string) => {
        try {
            let { transport, params } = await createWebRtcTransport()
            addConsumerTransport(transport,clientID)

            const message:IconsumerTransportCreated = {
                type:'consumerTransportCreated',
                payload:{
                    consumerTransportParams:params,
                    producerID,
                }
            }
            send(message,ws)
        } catch (error) {
            console.error(error)
        }
    },
    createConsumer = async (producerId:string, consumerTranport:Transport, rtpCapabilities:RtpCapabilities) => {
        if (!msRouter.canConsume({producerId,rtpCapabilities})){
            console.error('can not consume')
            return
        }

        let consumer
        try {
            consumer = await consumerTranport.consume({
                producerId,
                rtpCapabilities,
                paused: getProducer(producerId).kind === 'video'
            })
        } catch (error) {
            console.error('consume failed: ',error)
            return
        }

        return {
            id:consumer.id,
            kind:consumer.kind,
            rtpParameters:consumer.rtpParameters,
            type:consumer.type,
            producerPaused:consumer.producerPaused,
        }
    }

export { onCreateConsumerTransport }