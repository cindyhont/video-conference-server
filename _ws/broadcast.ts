import { clients, findRoomIdOfClient, rooms } from "../_mediasoup";
import { IwsBroadcast } from "../_mediasoup/interfaces";

const broadcast = (message:IwsBroadcast,clientID:string) => {
    const 
        msg = JSON.stringify(message),
        roomID = findRoomIdOfClient(clientID)

    if (!roomID) return

    const clientIDs = rooms[roomID]

    clientIDs.forEach(clientId=>{
        if (clientID !== clientId && clientID in clients && !!clients[clientId].producerIDs) clients[clientId]?.socket?.send(msg)
    })
}

export default broadcast