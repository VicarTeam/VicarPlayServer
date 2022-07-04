import {Socket} from "socket.io";
import {IClientIdenity, SessionInitMode} from "../@types/session";
import Session from "../session/Session";
import SessionManager from "../session/SessionManager";

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
    }
}
