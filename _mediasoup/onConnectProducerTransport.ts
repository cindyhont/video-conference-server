import { DtlsParameters } from "mediasoup/node/lib/types"
import WebSocket from "ws"
import { getTransport, setTransport } from "."
// import { producerTransport } from "."
import send from "../_ws/send"
import { IproducerConnected } from "./interfaces"

const onConnectProducerTransport = async (
    {
        transportID,
        dtlsParameters
    }:{
        transportID:string;
        dtlsParameters: DtlsParameters;
    },
    ws:WebSocket
) => {
    await getTransport(transportID).connect({dtlsParameters})
    
    const message:IproducerConnected = {
        type:'producerConnected',
    }
    send(message,ws)
}

export { onConnectProducerTransport }