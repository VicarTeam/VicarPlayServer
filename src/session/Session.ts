import Client from "../server/Client";
import {IChatMessage, MessageType} from "../@types/chat";
import {ISessionState} from "../@types/session";

export default class Session {

    public readonly players: Client[];
    public readonly chatHistory: IChatMessage[];

    public constructor(
        public readonly id: string,
        public readonly host: Client,
        public readonly name: string
    ) {
        this.players = [];
        this.chatHistory = [];

        this.host.session = this;
        this.host.socket.join("session-" + this.id);
    }

    public isHost(client: Client): boolean {
        return client === this.host;
    }

    public removePlayer(client: Client, tellChat: boolean = true, forced: boolean = false) {
        this.players.splice(this.players.indexOf(client), 1);

        client.session = null;
        client.socket.emit("session:closed");
        client.socket.leave("session-" + this.id);

        if (tellChat) {
            this.chatHistory.push({
                type: MessageType.Status,
                sender: client.identity,
                content: forced ? "kicked" : "left"
            });
        }
    }

    public getStateFor(client: Client): ISessionState {
        return {
            id: this.id,
            name: this.name,
            host: this.host.identity,
            chatHistory: this.chatHistory.filter(x => x.sender === client.identity || x.receiver === client.identity),
            players: this.players.map(x => x.identity)
        };
    }
}
