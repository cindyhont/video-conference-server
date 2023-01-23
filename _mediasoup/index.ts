import { Consumer, MediaKind, Producer, Router, Transport } from "mediasoup/node/lib/types";
import { WebSocket } from "ws";
import broadcast from "../_ws/broadcast";
import { IlbDeleteClient, InewClient } from "../_ws/interfaces";
import { sendToLoadBalancer } from "../_ws/sendToLoadBalancer";
import createWorker from "./createWorker";
import { IdeleteClient } from "./interfaces";

let 
    msRouter: Router,
    producers:{
        [id:string]:Producer;
    } = {},
    consumers:{
        [id:string]:Consumer;
    } = {},
    transports:{
        [id:string]:Transport;
    } = {},
    rooms:{
        [roomID:string]:string[]; // client IDs
    } = {},
    clients:{
        [id:string]:{
            roomID:string;
            socket:WebSocket;
            producerIDs?:{
                [kind:string]:string;
            };
            producerTransportIDs?:{
                [kind:string]:string;
            };
            consumerIDs?:{
                [producerClientID:string]:{
                    [kind:string]:string;
                }
            };
            consumerTransportIDs?:{
                [producerClientID:string]:{
                    [kind:string]:string;
                }
            };
        }
    } = {}

const 
    setupRouter = async() => {
        try {
            msRouter = await createWorker()
        } catch (error) {
            throw error
        }
    },
    setProducer = (_producer:Producer) => producers[_producer.id] = _producer,
    getProducer = (id:string) => producers[id],
    deleteProducer = (id:string) => {
        producers[id]?.close()
        delete producers[id]
    },
    setConsumer = (c:Consumer) => consumers[c.id] = c,
    getConsumer = (consumerID:string) => consumers[consumerID],
    setTransport = (_transport:Transport) => transports[_transport.id] = _transport,
    getTransport = (id:string) => transports[id],
    deleteTransport = (id:string) => {
        transports[id]?.close()
        delete transports[id]
    },
    addClient = (wsClient:WebSocket,roomID:string,clientID:string,serverHost:string) => {
        clients[clientID] = {
            socket:wsClient,
            roomID,
        }
        if (roomID in rooms) rooms[roomID] = [...rooms[roomID],clientID]
        else rooms[roomID] = [clientID]

        const message:InewClient = {
            type:'newClient',
            payload:{ 
                roomID,
                serverHost
            }
        }
        sendToLoadBalancer(message)
    },
    setClientProducerID = (clientID:string,producerID:string,kind:MediaKind) => {
        clients[clientID] = {
            ...clients[clientID],
            producerIDs:{
                ...(clients[clientID]?.producerIDs || {}),
                [kind]:producerID
            }
        }
    },
    setClientProducerTransportID = (clientID:string,producerTransportID:string,kind:MediaKind) => {
        clients[clientID] = {
            ...clients[clientID],
            producerTransportIDs:{
                ...(clients[clientID]?.producerTransportIDs || {}),
                [kind]:producerTransportID
            }
        }
    },
    setClientConsumerTransportID = (
        clientID:string,
        transportID:string,
        producerClientID:string,
        kind:MediaKind
    ) => {
        clients[clientID] = {
            ...clients[clientID],
            consumerTransportIDs:{
                ...(clients[clientID]?.consumerTransportIDs || {}),
                [producerClientID]:{
                    ...(clients[clientID]?.consumerTransportIDs?.[producerClientID] || {}),
                    [kind]:transportID
                }
            }
        }
    },
    setClientConsumerID = (
        clientID:string,
        consumerID:string,
        producerClientID:string,
        kind:MediaKind
    ) => {
        clients[clientID] = {
            ...clients[clientID],
            consumerIDs:{
                ...(clients[clientID]?.consumerIDs || {}),
                [producerClientID]:{
                    ...(clients[clientID]?.consumerIDs?.[producerClientID] || {}),
                    [kind]:consumerID
                }
            }
        }
    },
    findClientID = (ws:WebSocket) => {
        const 
            clientEntries = Object.entries(clients),
            clientCount = clientEntries.length

        for (let i=0; i<clientCount; i++){
            const [clientID,{socket}] = clientEntries[i]
            if (socket === ws) return clientID
        }
        return null
    },
    findRoomIdOfClient = (id:string) => clients[id]?.roomID || null,
    deleteClient = (clientID:string) => {
        const {
            roomID:thisClientRoomID,
            producerIDs,
            producerTransportIDs,
            consumerIDs:thisClientConsumerIDs,
            consumerTransportIDs:thisClientConsumerTransportIDs,
            socket
        } = clients[clientID]

        const broadcastMessage:IdeleteClient = {
            type:'deleteClient',
            payload:{ clientID }
        }
        broadcast(broadcastMessage,clientID)

        if (!!producerIDs){
            Object.values(producerIDs).forEach(producerID=>{
                deleteProducer(producerID)
            })
        }

        if (thisClientRoomID in rooms){
            if (rooms[thisClientRoomID].length===1 && rooms[thisClientRoomID][0]===clientID) delete rooms[thisClientRoomID]
            else rooms[thisClientRoomID] = [...rooms[thisClientRoomID].filter(e=>e!==clientID)]
        }
        if (!!producerIDs) {
            Object.values(producerIDs).forEach(producerID=>{
                deleteProducer(producerID)
            })
        }
        if (!!producerTransportIDs) {
            Object.values(producerTransportIDs).forEach(producerTransportID=>{
                deleteTransport(producerTransportID)
            })
        }

        if (!!thisClientConsumerIDs){
            Object.values(thisClientConsumerIDs).forEach(pair=>{
                Object.values(pair).forEach(e=>{
                    consumers[e]?.close()
                    delete consumers[e]
                })
            })
        }

        if (!!thisClientConsumerTransportIDs){
            Object.values(thisClientConsumerTransportIDs).forEach(pair=>{
                Object.values(pair).forEach(e=>{
                    transports[e]?.close()
                    delete transports[e]
                })
            })
        }

        socket?.terminate()
        delete clients[clientID]

        Object.values(clients).forEach(e=>{
            const {roomID,consumerIDs,consumerTransportIDs} = e
            if (roomID === thisClientRoomID){
                if (!!consumerIDs && clientID in consumerIDs){
                    Object.values(consumerIDs[clientID]).forEach(f=>{
                        consumers[f]?.close()
                        delete consumers[f]
                    })

                    delete consumerIDs[clientID]
                }
    
                if (!!consumerTransportIDs && clientID in consumerTransportIDs){
                    Object.values(consumerTransportIDs[clientID]).forEach(f=>{
                        transports[f]?.close()
                        delete transports[f]
                    })

                    delete consumerTransportIDs[clientID]
                }
            }
        })

        const message:IlbDeleteClient = {
            type:'deleteClient',
            payload:{ roomID:thisClientRoomID }
        }
        sendToLoadBalancer(message)
    }

export {
    msRouter,
    rooms,
    clients,
    setupRouter,
    setProducer,
    getProducer,
    setConsumer,
    getConsumer,
    deleteProducer,
    setTransport,
    getTransport,
    deleteTransport,
    addClient,
    setClientProducerID,
    setClientProducerTransportID,
    setClientConsumerTransportID,
    setClientConsumerID,
    findClientID,
    findRoomIdOfClient,
    deleteClient,
    // addConsumerTransport,
}