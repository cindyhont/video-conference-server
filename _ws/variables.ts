import { WebSocket } from 'ws'

let wsLoadBalancer: WebSocket

const setWsLoadBalancer = (_ws:WebSocket) => wsLoadBalancer = _ws

export {
    wsLoadBalancer,
    setWsLoadBalancer
}