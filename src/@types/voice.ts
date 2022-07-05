export enum VoiceType {
    Discord = "dc", TeamSpeak = "ts"
}

export interface IVoiceIntegrationData {
    type: VoiceType;
    mainChannel: string;
    privateChannel: string;
    dcToken: string;
    dcGuild: string;
    tsHost: string;
    tsPort: number;
    tsQueryPort: number;
    tsUsername: string;
    tsPassword: string;
}
