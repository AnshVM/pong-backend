import * as ws from "ws";
declare module 'ws' {
    export interface WebSocketOP extends WebSocket {
        id:string;
        roomId: string;
    } 
}

