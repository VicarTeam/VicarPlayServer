import VoiceIntegration from "./VoiceIntegration";
import {IClientIdenity} from "../@types/session";
import {IVoiceIntegrationData} from "../@types/voice";
import Session from "../session/Session";
import {Client, Guild, Intents, Snowflake, VoiceChannel, VoiceState} from "discord.js";

export default class DiscordIntegration extends VoiceIntegration {

    private client: Client|null = null;
    private guild: Guild|null = null;
    private mainChannel: Snowflake|null = null;
    private privateChannel: Snowflake|null = null;

    public constructor(data: IVoiceIntegrationData, session: Session) {
        super(data, session);
    }

    async onMove(client: IClientIdenity, toPrivate: boolean): Promise<void> {
        const member = await this.guild.members.fetch(client.discordName);
        if (!member) {
            return;
        }

        if (toPrivate) {
            await member.voice.setChannel(this.privateChannel);
        } else {
            await member.voice.setChannel(this.mainChannel);
        }
    }

    async start(): Promise<void> {
        this.client = new Client({intents: [Intents.FLAGS.GUILD_VOICE_STATES]});
        await this.client.login(this.data.dcToken);

        this.guild = await this.client.guilds.fetch(this.data.dcGuild);
        this.mainChannel = (<VoiceChannel> await this.guild.channels.fetch(this.data.mainChannel)).id;
        this.privateChannel = (<VoiceChannel> await this.guild.channels.fetch(this.data.privateChannel)).id;

        this.client.on("voiceStateUpdate", this.onVoiceStateUpdated);
    }

    async stop(): Promise<void> {
        this.client.off("voiceStateUpdate", this.onVoiceStateUpdated);
        this.client.destroy();
        this.client = null;
        this.guild = null;
        this.mainChannel = null;
        this.privateChannel = null;
    }

    async getVoiceState(client: IClientIdenity): Promise<boolean> {
        const member = await this.guild.members.fetch(client.discordName);
        if (!member || !member.voice) {
            return false;
        }
        return member.voice.channel.id === this.mainChannel;
    }

    private onVoiceStateUpdated = (oldState: VoiceState, newState: VoiceState) => {
        if (oldState.member !== newState.member) {
            return;
        }

        const client = this.session.host.identity.discordName === newState.member.id
            ? this.session.host
            : this.session.players.find(c => c.identity.discordName === newState.member.id);
        if (!client) {
            return;
        }

        client.setVoiceInMain(newState.channelId === this.mainChannel);
    }
}
