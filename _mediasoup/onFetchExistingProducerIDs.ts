import { WebSocket } from "ws"
import { clients, rooms } from "."
import send from "../_ws/send"
import { IexistingProducerIDs } from "./interfaces"

const onFetchExistingProducerIDs = (roomID:string,clientID:string,ws:WebSocket) => {
    if (!(roomID in rooms)) return

    const clientIDs = rooms[roomID].filter(e=>e!==clientID)
    if (!clientIDs.length) return

    let payload:{
        [_clientID:string]:{
            [kind:string]:string;
        }
    } = {}

    clientIDs.forEach(_clientID=>{
        if (_clientID in clients && !!clients[_clientID]?.producerIDs){
            payload[_clientID] = clients[_clientID].producerIDs as { [kind:string]:string; }
        }
    })

    if (Object.keys(payload).length){
        const message:IexistingProducerIDs = {
            type:'existingProducerIDs',
            payload
        }
        send(message,ws)
    }
}

export { onFetchExistingProducerIDs }