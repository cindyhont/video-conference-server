import { ConsumerType, DtlsParameters, IceCandidate, IceParameters, MediaKind, RtpCapabilities, RtpParameters } from "mediasoup/node/lib/types";

export interface IgetRouterRtpCapabilities {
    type:'getRouterRtpCapabilities';
    payload:{
        roomID:string;
        serverHost:string;
    }
}

export interface IdeleteClient {
    type:'deleteClient';
    payload:{
        clientID:string;
    }
}

export interface IcreateProducerTransport {
    type:'createProducerTransport';
    payload:{
        forceTcp:boolean;
        rtpCapabilities:RtpCapabilities;
        clientID:string;
    }
}

export interface IconnectProducerTransport {
    type:'connectProducerTransport';
    payload:{
        transportID:string;
        dtlsParameters:DtlsParameters;
    };
}

export interface Iproduce {
    type:'produce';
    payload:{
        clientID:string;
        transportID:string;
        kind:MediaKind;
        rtpParameters:RtpParameters;
    };
}

export interface IcreateConsumerTransport {
    type:'createConsumerTransport',
    payload:{
        clientID:string;
        producerID:string;
    };
}

export interface IconnectConsumerTransport {
    type:'connectConsumerTransport',
    payload:{
        dtlsParameters: DtlsParameters;
        transportID:string;
    }
}

export interface Iresume {
    type:'resume';
    payload:{
        rtpCapabilities:RtpCapabilities;
        transportID:string;
        producerID:string;
    };
}

export interface Iconsume {
    type:'consume';
    payload:{
        rtpCapabilities:RtpCapabilities;
        producerID:string;
        consumerTranportID:string;
    };
}

export interface IfetchExistingProducerIDs {
    type:'fetchExistingProducerIDs',
    payload:{
        roomID:string;
        clientID:string;
    }
}

export type IwsEvent = IgetRouterRtpCapabilities
    | IdeleteClient
    | IcreateProducerTransport
    | IconnectProducerTransport
    | Iproduce
    | IcreateConsumerTransport
    | IconnectConsumerTransport
    | Iresume
    | Iconsume
    | IfetchExistingProducerIDs

// send message

export interface IrouterCapabilities {
    type:'routerCapabilities';
    payload:{
        rtpCapabilities:RtpCapabilities;
        clientID:string;
    }
}

export interface IproducerTransportCreated {
    type:'producerTransportCreated';
    payload:{
        id: string;
        iceParameters: IceParameters;
        iceCandidates: IceCandidate[];
        dtlsParameters: DtlsParameters;
    };
}

export interface IproducerConnected {
    type:'producerConnected';
}

export interface Iproduced {
    type:'produced';
    payload:{
        id:string;
    };
}

export interface IconsumerTransportCreated {
    type:'consumerTransportCreated';
    payload:{
        consumerTransportParams:{
            id: string;
            iceParameters: IceParameters;
            iceCandidates: IceCandidate[];
            dtlsParameters: DtlsParameters;
        };
        producerID:string;
    }
}

export interface IconsumerConnected {
    type:'consumerConnected';
    payload:{
        transportID:string;
    }
}

export interface Iresumed {
    type:'resumed';
    payload?:undefined;
}

export interface Isubscribed {
    type:'subscribed',
    payload:{
        producerID: string;
        consumerID: string;
        kind: MediaKind;
        rtpParameters: RtpParameters;
        type: ConsumerType;
        producerPaused: boolean;
    }
}

export interface IexistingProducerIDs {
    type:'existingProducerIDs',
    payload:{
        producerIDs:string[];
    }
}

export type IwsMessage = IrouterCapabilities
    | IproducerTransportCreated
    | IproducerConnected
    | Iproduced
    | IconsumerTransportCreated
    | IconsumerConnected
    | Iresumed
    | Isubscribed
    | IexistingProducerIDs

// broadcast message

export interface InewProducer {
    type:'newProducer';
    payload:{
        producerID:string;
    }
}

export interface IdeleteProducer {
    type:'deleteProducer';
    payload:{
        producerID:string;
    }
}

export type IwsBroadcast = InewProducer
    | IdeleteProducer