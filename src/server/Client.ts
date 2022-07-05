import {Socket} from "socket.io";
import {IClientIdenity, SessionInitMode} from "../@types/session";
import Session from "../session/Session";
import SessionManager from "../session/SessionManager";
import {IChatMessage} from "../@types/chat";

export default class Client {

    public identity: IClientIdenity | null;
    public session: Session | null = null;

    public constructor(public readonly socket: Socket) {
        this.identity = null;
    }

    public init() {
        this.socket.on("disconnecting", () => {
            if (!this.session) {
                return;
            }

            if (this.session.isHost(this)) {
                SessionManager.getInstance().destroySession(this.session, false);
            } else {
                this.session.removePlayer(this);
            }
        });

        this.socket.on("session:init", (mode: SessionInitMode, identity: IClientIdenity, payload: string) => {
            if (this.session) {
                return;
            }

            this.identity = identity;
            this.identity.isHost = mode === "create";
            this.identity.socketId = this.socket.id;

            if (mode === "create") {
                SessionManager.getInstance().createSession(this, payload);
            } else {
                SessionManager.getInstance().joinSession(this, payload);
            }
        });
        this.socket.on("session:close", () => {
            if (!this.session) {
                return;
            }

            if (this.session.isHost(this)) {
                SessionManager.getInstance().destroySession(this.session);
            } else {
                this.session.removePlayer(this);
            }
        });
        this.socket.on("chat:message", (message: IChatMessage) => {
            if (!this.session) {
                return;
            }

            this.session.sendMessage(message, this);
        });
        this.socket.on("players:kick", (player: IClientIdenity) => {
            if (!this.session || !this.session.isHost(this)) {
                return;
            }

            const client = this.session.players.find(x => x.identity.socketId === player.socketId);
            if (!client) {
                return;
            }

            this.session.removePlayer(client, true, true);
        });
        this.socket.on("sync-char:request", (targetSocketId: string, savingChar: string) => {
            if (!this.session || !this.session.isHost(this)) {
                return;
            }

            const client = this.session.players.find(x => x.identity.socketId === targetSocketId);
            if (!client) {
                return;
            }

            client.socket.emit("sync-char:request", savingChar);
        });
        this.socket.on("sync-char:response", (savingChar: string, char: any) => {
            if (!this.session || this.session.isHost(this)) {
                return;
            }

            this.session.host.socket.emit("sync-char:response", this.identity.socketId, savingChar, char);
        });
        this.socket.on("sync-char:update", (char: any) => {
            if (!this.session || this.session.isHost(this)) {
                return;
            }

            this.session.host.socket.emit("sync-char:update", this.identity.socketId, char);
        });
    }
}
