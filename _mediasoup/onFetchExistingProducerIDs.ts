import { WebSocket } from "ws"
import { clients, rooms } from "."
import send from "../_ws/send"
import { IexistingProducerIDs } from "./interfaces"

const onFetchExistingProducerIDs = (roomID:string,clientID:string,ws:WebSocket) => {
    if (!(roomID in rooms)) return

    const clientIDs = rooms[roomID].filter(e=>e!==clientID)
    if (!clientIDs.length) return

    const producerIDs = clientIDs
        .map(e=>clients[e].producerID || '')
        .filter(e=>e !== '')
    if (!producerIDs.length) return

    const message:IexistingProducerIDs = {
        type:'existingProducerIDs',
        payload:{
            producerIDs
        }
    }
    send(message,ws)
}

export { onFetchExistingProducerIDs }