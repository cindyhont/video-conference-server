import {
    createWorker,
} from "mediasoup";
import { 
    RtpCodecCapability, 
} from "mediasoup/node/lib/types";
import dotenv from 'dotenv'

dotenv.config()

const createMsWorker = async () => {
    const worker = await createWorker({
        logLevel: 'warn',
        logTags: [
            'info',
            'ice',
            'dtls',
            'rtp',
            'srtp',
            'rtcp',
        ],
        rtcMinPort: +(<string>process.env.RTC_MIN_PORT),
        rtcMaxPort: +(<string>process.env.RTC_MAX_PORT),
    });
    
    worker.on('died',()=>{
        console.error('ms server died, exit in 2 seconds. (pid:%d)',worker.pid)
        setTimeout(()=>process.exit(1),2000)
    })

    const 
        mediaCodecs = [
            {
                kind: 'audio',
                mimeType: 'audio/opus',
                clockRate: 48000,
                channels: 2
            },
            {
                kind: 'video',
                mimeType: 'video/VP8',
                clockRate: 90000,
                parameters:{
                    'x-google-start-bitrate': 1000
                }
            },
        ] as RtpCodecCapability[],
        router = await worker.createRouter({ mediaCodecs })

    return router
}

export default createMsWorker