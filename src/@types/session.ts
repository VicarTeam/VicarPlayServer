import {IChatMessage} from "./chat";

export type SessionInitMode = "connect"|"create";

export interface IClientIdenity {
    socketId: string;
    username: string;
    tsName: string;
    discordName: string;
    isHost: boolean;
}

export interface ISessionState {
    id: string;
    name: string;
    host: IClientIdenity;
    chatHistory: IChatMessage[];
    players: IClientIdenity[];
}
