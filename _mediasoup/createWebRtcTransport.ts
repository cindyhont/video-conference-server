import { TransportListenIp } from "mediasoup/node/lib/types"
import { msRouter } from "."
import dotenv from 'dotenv'

dotenv.config()

const createWebRtcTransport = async() => {
    const transport = await msRouter.createWebRtcTransport({
        listenIps:[
            {
                ip:process.env.HOST_PRIVATE_IP,
                announcedIp:process.env.HOST_PUBLIC_IP,
            }
        ] as TransportListenIp[],
        enableUdp: true,
        enableTcp: true,
        enableSctp: true,
        preferUdp: true,
        initialAvailableOutgoingBitrate: 1000000,
    })

    try {
        await transport.setMaxIncomingBitrate(1500000)
    } catch (error) {
        console.error(error)
    }

    const { id, iceParameters, iceCandidates, dtlsParameters } = transport

    return {
        transport,
        params:{
            id,
            iceParameters, 
            iceCandidates, 
            dtlsParameters
        }
    }
}

export default createWebRtcTransport