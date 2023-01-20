// messages to load balancer

export interface Ijoin {
    type:'join';
    payload:{
        serverHost:string;
    }
}

export interface InewClient {
    type:'newClient';
    payload:{
        roomID:string;
        serverHost:string;
    }
}

export interface IdeleteClient {
    type:'deleteClient';
    payload:{
        roomID:string;
        deleteRoom:boolean;
    }
}

export type IlbEvent = Ijoin
    | InewClient
    | IdeleteClient