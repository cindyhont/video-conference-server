import { Producer, Router, Transport } from "mediasoup/node/lib/types";
import { WebSocket } from "ws";
import broadcast from "../_ws/broadcast";
import { IdeleteClient, InewClient } from "../_ws/interfaces";
import { sendToLoadBalancer } from "../_ws/sendToLoadBalancer";
import createWorker from "./createWorker";
import { IdeleteProducer } from "./interfaces";

let 
    msRouter: Router,
    producers:{
        [id:string]:Producer;
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
            producerID?:string;
            producerTransportID?:string;
            consumerTransportIDs:string[];
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
    deleteProducer = (id:string) => delete producers[id],
    setTransport = (_transport:Transport) => transports[_transport.id] = _transport,
    getTransport = (id:string) => transports[id],
    deleteTransport = (id:string) => delete transports[id],
    addClient = (wsClient:WebSocket,roomID:string,clientID:string,serverHost:string) => {
        clients[clientID] = {
            socket:wsClient,
            roomID,
            consumerTransportIDs:[]
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
    setClient = (
        {
            id,
            producerID,
            producerTransportID,
        }:{
            id:string;
            producerID?:string;
            producerTransportID?:string;
        }
    ) => {
        clients[id] = {
            ...clients[id],
            ...(!!producerID && {producerID}),
            ...(!!producerTransportID && {producerTransportID}),
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
    deleteClient = (id:string) => {
        const {roomID,producerID,producerTransportID,consumerTransportIDs,socket} = clients[id]

        const deleteRoom = !!producerID

        if (!!producerID){
            const broadcastMessage:IdeleteProducer = {
                type:'deleteProducer',
                payload:{ producerID }
            }
            broadcast(broadcastMessage,id)
        }

        if (roomID in rooms){
            if (rooms[roomID].length===1 && rooms[roomID][0]===id) delete rooms[roomID]
            else rooms[roomID] = [...rooms[roomID].filter(e=>e!==id)]
        }
        if (!!producerID) deleteProducer(producerID)
        if (!!producerTransportID) deleteTransport(producerTransportID)
        if (!!consumerTransportIDs.length) consumerTransportIDs.forEach(e=>{ delete transports[e] })
        socket?.terminate()
        delete clients[id]

        const message:IdeleteClient = {
            type:'deleteClient',
            payload:{ roomID, deleteRoom }
        }
        sendToLoadBalancer(message)
    },
    addConsumerTransport = (transport:Transport,clientID:string) => {
        transports[transport.id] = transport
        clients[clientID].consumerTransportIDs = [...clients[clientID].consumerTransportIDs,transport.id]
    }

export {
    msRouter,
    rooms,
    clients,
    setupRouter,
    setProducer,
    getProducer,
    deleteProducer,
    setTransport,
    getTransport,
    deleteTransport,
    addClient,
    setClient,
    findClientID,
    findRoomIdOfClient,
    deleteClient,
    addConsumerTransport,
}