import {IVoiceIntegrationData} from "../@types/voice";
import {IClientIdenity} from "../@types/session";
import Client from "../server/Client";
import Session from "../session/Session";

export default abstract class VoiceIntegration {

    protected constructor(
        public readonly data: IVoiceIntegrationData,
        public readonly session: Session
    ) { }

    public abstract start(): Promise<void>;
    public abstract stop(): Promise<void>;
    public abstract getVoiceState(client: IClientIdenity): Promise<boolean>;

    protected abstract onMove(client: IClientIdenity, toPrivate: boolean): Promise<void>;

    public async move(client: Client, toPrivate: boolean): Promise<void> {
        try {
            await this.onMove(client.identity, toPrivate);

            client.setVoiceInMain(!toPrivate);
        } catch (e) {
            console.error(e);
        }
    }
}
