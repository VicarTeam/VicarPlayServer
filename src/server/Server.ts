import * as sio from 'socket.io';
import Client from "./Client";

export default class Server {

    private static instance: Server;
    private readonly clients: Client[];

    private constructor(public readonly server: sio.Server) {
        this.clients = [];
    }

    private init() {
        this.server.on('connection', (socket) => {
            const client = new Client(socket);
            this.clients.push(client);

            socket.on('disconnect', () => {
                this.clients.splice(this.clients.indexOf(client), 1);
            });

            client.init();

            console.log('Client connected!');
        });
    }

    public static init(io: sio.Server) {
        if (Server.instance) {
            throw new Error('Server is already initialized');
        }

        Server.instance = new Server(io);
        Server.instance.init();
    }

    public static getInstance(): Server {
        if (!Server.instance) {
            throw new Error('Server is not initialized');
        }

        return Server.instance;
    }
}
