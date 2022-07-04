import {IClientIdenity} from "./session";

export enum MessageType {
    BroadcastMessage,
    PrivateMessage,
    BroadcastCommand,
    PrivateCommand,
    SecretCommand,
    BroadcastAvatar,
    PrivateAvatar,
    Status,
    Raw
}

export interface IChatMessage {
    type: MessageType;
    content: any;
    sender: IClientIdenity;
    receiver?: IClientIdenity;
}
