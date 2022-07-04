import Server from "./server/Server";

require("dotenv").config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import {createServer} from "http";
import * as sio from "socket.io";

const app = express();
const httpServer = createServer(app);
Server.init(new sio.Server(httpServer));

app.use(express.json());
app.use(helmet());
app.use(cors({
    origin: process.env.CORS
}));

httpServer.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
