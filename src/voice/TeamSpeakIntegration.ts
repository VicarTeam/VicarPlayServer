import VoiceIntegration from "./VoiceIntegration";
import {IClientIdenity} from "../@types/session";
import {IVoiceIntegrationData} from "../@types/voice";
import Session from "../session/Session";
import { TeamSpeak } from "ts3-nodejs-library";
import { ClientMoved } from "ts3-nodejs-library/lib/types/Events";

export default class TeamSpeakIntegration extends VoiceIntegration {

    private bot: TeamSpeak|null = null;
    private mainChannel: any|null = null;
    private privateChannel: any|null = null;
    private ignoreReconnect: boolean = false;

    public constructor(data: IVoiceIntegrationData, session: Session) {
        super(data, session);
    }

    async onMove(client: IClientIdenity, toPrivate: boolean): Promise<void> {
        const clientObj = await this.bot.getClientByName(client.tsName);
        if (!clientObj) {
            return;
        }

        if (toPrivate) {
            await clientObj.move(this.privateChannel);
        } else {
            await clientObj.move(this.mainChannel);
        }
    }

    async start(): Promise<void> {
        this.ignoreReconnect = false;
        this.bot = await TeamSpeak.connect({
            host: this.data.tsHost,
            serverport: this.data.tsPort,
            queryport: this.data.tsQueryPort,
            username: this.data.tsUsername,
            password: this.data.tsPassword,
            nickname: this.generateTsNickname()
        });

        this.mainChannel = (await this.bot.getChannelByName(this.data.mainChannel)).cid;
        this.privateChannel = (await this.bot.getChannelByName(this.data.privateChannel)).cid;

        this.bot.on("clientmoved", this.onClientMove);
        this.bot.on("close", async () => {
            if (!this.ignoreReconnect) {
                await this.bot.reconnect(-1, 1000);
            }
        });
    }

    async stop(): Promise<void> {
        this.ignoreReconnect = true;
        this.bot.off("clientmoved", this.onClientMove);
        await this.bot.quit();

        this.bot = null;
        this.mainChannel = null;
        this.privateChannel = null;
    }

    async getVoiceState(idenity: IClientIdenity): Promise<boolean> {
        const client = await this.bot.getClientByName(idenity.tsName);
        if (!client) {
            return false;
        }

        return client.cid === this.mainChannel;
    }

    private onClientMove(e: ClientMoved) {
        const client = this.session.players.find(x => x.identity.tsName === e.client.nickname);
        if (!client) {
            return;
        }

        client.setVoiceInMain(e.channel.cid === this.mainChannel);
    }

    private generateTsNickname() {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let nickname = "";
        for (let i = 0; i < 6; i++) {
            nickname += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return "VicarPlay-" + nickname;
    }
}
