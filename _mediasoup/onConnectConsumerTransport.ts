import { DtlsParameters } from "mediasoup/node/lib/types";
import { WebSocket } from "ws";
import { getTransport } from ".";
import send from "../_ws/send";
import { IconsumerConnected } from "./interfaces";

const onConnectConsumerTransport = async (dtlsParameters: DtlsParameters,transportID:string,ws:WebSocket) => {
    await getTransport(transportID).connect({dtlsParameters})

    const message:IconsumerConnected = {
        type:'consumerConnected',
        payload:{ transportID }
    }
    send(message,ws)
}

export default onConnectConsumerTransport