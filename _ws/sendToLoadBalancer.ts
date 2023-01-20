import { IlbEvent } from "./interfaces";
import { wsLoadBalancer } from "./variables";

const sendToLoadBalancer = (message:IlbEvent) => {
    wsLoadBalancer.send(JSON.stringify(message))
}

export { sendToLoadBalancer }