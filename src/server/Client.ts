import {Socket} from "socket.io";

export class Client {

    public username: string;

    public constructor(protected readonly socket: Socket) {
        this.username = "";
    }

    public init() {
        this.socket.on("session:username", (username: string) => {
            this.username = username;
        });
    }
}