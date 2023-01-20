import { MediaKind, RtpParameters } from "mediasoup/node/lib/types";
import { WebSocket } from "ws";
import { getTransport, setClient, setProducer } from ".";
import broadcast from "../_ws/broadcast";
import send from "../_ws/send";
import { InewProducer, Iproduced } from "./interfaces";

const onProduce = async (
    {
        clientID,
        transportID,
        kind,
        rtpParameters
    }:{
        clientID:string;
        transportID:string;
        kind:MediaKind;
        rtpParameters:RtpParameters;
    },
    ws:WebSocket,
) => {
    const producer = await getTransport(transportID).produce({kind,rtpParameters})
    setProducer(producer)
    setClient({
        id:clientID,
        producerID:producer.id
    })

    const sendMessage:Iproduced = {
        type:'produced',
        payload:{
            id:producer.id,
        },
    }
    send(sendMessage,ws)

    const broadcastMessage:InewProducer = {
        type:'newProducer',
        payload:{
            producerID:producer.id,
        }
    }
    broadcast(broadcastMessage,clientID)
}

export { onProduce }