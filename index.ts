import { WebSocket, WebSocketServer } from 'ws'
import { deleteClient, findClientID, setupRouter } from './_mediasoup'
import { onConnectProducerTransport } from './_mediasoup/onConnectProducerTransport'
import { onGetRouterRtpCapabilities } from './_mediasoup/onGetRouterRtpCapabilities'
import { IwsEvent } from './_mediasoup/interfaces'
import onCreateProducerTransport from './_mediasoup/onCreateProducerTransport'
import { onProduce } from './_mediasoup/onProduce'
import { onCreateConsumerTransport } from './_mediasoup/onCreateConsumerTransport'
import onConnectConsumerTransport from './_mediasoup/onConnectConsumerTransport'
import { onResume } from './_mediasoup/onResume'
import { onConsume } from './_mediasoup/onConsume'
import { v4 as uuidv4 } from 'uuid'
import { setWsLoadBalancer } from './_ws/variables'
import { Ijoin } from './_ws/interfaces'
import { sendToLoadBalancer } from './_ws/sendToLoadBalancer'
import { onFetchExistingProducerIDs } from './_mediasoup/onFetchExistingProducerIDs'
import dotenv from 'dotenv'

dotenv.config()

const launchWS = () => {
    const _wsLoadBalancer = new WebSocket(process.env.WS_LOAD_BALANCER_ADDR as string)

    setWsLoadBalancer(_wsLoadBalancer)

    _wsLoadBalancer.on('open',()=>{
        const message:Ijoin = {
            type:'join',
            payload:{
                serverHost: process.env.THIS_WS_ADDRESS as string
            }
        }

        sendToLoadBalancer(message)
    })

    const wsServer = new WebSocketServer({ port:+(process.env.WS_PORT as string), clientTracking:true })
    wsServer.on('connection',(socket,req)=>{
        socket.on('message',data=>{
            const 
                msg = data.toString(),
                {type,payload} = JSON.parse(msg) as IwsEvent

            switch (type) {
                case 'deleteClient':
                    deleteClient(payload.clientID)
                    break
                case 'getRouterRtpCapabilities':
                    onGetRouterRtpCapabilities(
                        socket,
                        payload.roomID,
                        req.headers['sec-websocket-key'] || uuidv4(),
                        payload.serverHost
                    )
                    break;
                case 'createProducerTransport':
                    onCreateProducerTransport(socket,payload.clientID,payload.kind)
                    break;
                case 'connectProducerTransport':
                    onConnectProducerTransport(payload,socket)
                    break;
                case 'produce':
                    onProduce(payload,socket)
                    break;
                case 'createConsumerTransport':
                    onCreateConsumerTransport(
                        socket,
                        payload.clientID,
                        payload.producerID,
                        payload.producerClientID,
                        payload.kind
                    )
                    break;
                case 'connectConsumerTransport':
                    onConnectConsumerTransport(payload.dtlsParameters,payload.transportID,socket)
                    break;
                case 'resume':
                    onResume(payload.rtpCapabilities,payload.transportID,payload.producerID,socket,payload.consumerID)
                    break
                case 'consume':
                    onConsume(payload.producerID,payload.consumerTranportID,payload.rtpCapabilities,socket)
                    break
                case 'fetchExistingProducerIDs':
                    onFetchExistingProducerIDs(payload.roomID,payload.clientID,socket)
                    break
                default: break;
            }
        })

        socket.on('close',()=>{
            const clientID = findClientID(socket)
            if (!!clientID) deleteClient(clientID)
        })
    })

    setInterval(()=>{
        wsServer.clients.forEach(client=>{
            client?.ping()
        })
    },30000)
}

const run = async () => {
    await setupRouter()
    launchWS()
}

run()