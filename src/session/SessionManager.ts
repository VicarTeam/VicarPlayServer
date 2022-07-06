import Session from "./Session";
import Client from "../server/Client";
import {randomUUID} from "crypto";
import {MessageType} from "../@types/chat";

export default class SessionManager {

    private static readonly instance: SessionManager = new SessionManager();

    public readonly sessions: Session[];

    private constructor() {
        this.sessions = [];
    }

    public createSession(host: Client, name: string) {
        const sessionId = randomUUID();
        const session = new Session(sessionId, host, name);
        this.sessions.push(session);

        host.socket.emit("session:joined", host.identity, session.getStateFor(host));
    }

    public joinSession(player: Client, sessionId: string) {
        const session = this.getSession(sessionId);
        if (!session) {
            return;
        }

        player.session = session;
        player.socket.join("session-" + sessionId);
        player.socket.emit("session:joined", player.identity, session.getStateFor(player));

        session.players.push(player);
        session.updatePlayers("add", player.identity);
        session.sendMessage({
            type: MessageType.Status,
            sender: player.identity,
            content: "joined"
        });
    }

    public destroySession(session: Session, tellMe: boolean = true) {
        [...session.players].forEach(player => {
            session.removePlayer(player, false);
        });

        if (session.voiceIntegration) {
            session.voiceIntegration.stop().catch(() => {});
        }

        this.sessions.splice(this.sessions.indexOf(session), 1);

        if (tellMe) {
            session.host.socket.emit("session:closed");
        }

        session.host.session = null;
    }

    public getSession(sessionId: string): Session|null {
        return this.sessions.find(session => session.id === sessionId);
    }

    public static getInstance(): SessionManager {
        return SessionManager.instance;
    }
}
