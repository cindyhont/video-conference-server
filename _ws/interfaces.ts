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

export interface IlbDeleteClient {
    type:'deleteClient';
    payload:{
        roomID:string;
    }
}

export type IlbEvent = Ijoin
    | InewClient
    | IlbDeleteClient