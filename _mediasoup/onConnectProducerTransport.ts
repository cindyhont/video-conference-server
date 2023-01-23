import { DtlsParameters, MediaKind } from "mediasoup/node/lib/types"
import WebSocket from "ws"
import { getTransport, setTransport } from "."
// import { producerTransport } from "."
import send from "../_ws/send"
import { IproducerConnected } from "./interfaces"

const onConnectProducerTransport = async (
    {
        transportID,
        dtlsParameters,
        mediaKind
    }:{
        transportID:string;
        dtlsParameters: DtlsParameters;
        mediaKind:MediaKind;
    },
    ws:WebSocket
) => {
    await getTransport(transportID).connect({dtlsParameters})
    
    const message:IproducerConnected = {
        type:'producerConnected',
        payload:{
            mediaKind
        }
    }
    send(message,ws)
}

export { onConnectProducerTransport }