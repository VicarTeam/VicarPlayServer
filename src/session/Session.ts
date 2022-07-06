import Client from "../server/Client";
import {IChatMessage, MessageType} from "../@types/chat";
import {IClientIdenity, ISessionState} from "../@types/session";
import Server from "../server/Server";
import VoiceIntegration from "../voice/VoiceIntegration";

export default class Session {

    public readonly players: Client[];
    public readonly chatHistory: IChatMessage[];
    public voiceIntegration: VoiceIntegration|null = null;

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

    public sendMessage(message: IChatMessage, sender: Client = this.host) {
        this.chatHistory.push(message);

        if (message.receiver) {
            if (message.receiver.isHost) {
                this.host.socket.emit("chat:message", message);
            } else {
                this.players.find(x => x.identity.socketId === message.receiver.socketId)?.socket.emit("chat:message", message);
            }

            sender.socket.emit("chat:message", message);
        } else {
            Server.getInstance().server.to("session-" + this.id).emit("chat:message", message);
        }
    }

    public removePlayer(client: Client, tellChat: boolean = true, forced: boolean = false) {
        this.players.splice(this.players.indexOf(client), 1);

        client.session = null;
        client.socket.emit("session:closed");
        client.socket.leave("session-" + this.id);

        if (tellChat) {
            this.updatePlayers("remove", client.identity);
            this.sendMessage({
                type: MessageType.Status,
                sender: client.identity,
                content: forced ? "kicked" : "left"
            });
        }
    }

    public updatePlayers(mode: "add"|"remove", client: IClientIdenity) {
        Server.getInstance().server.to("session-" + this.id).emit("players:update", mode, client);
    }

    public getStateFor(client: Client): ISessionState {
        return {
            id: this.id,
            name: this.name,
            host: this.host.identity,
            chatHistory: this.chatHistory.filter(x => x.sender === client.identity || x.receiver === client.identity || !x.receiver),
            players: this.players.map(x => x.identity)
        };
    }
}
