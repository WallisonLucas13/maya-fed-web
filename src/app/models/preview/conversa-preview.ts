import { MensagemPreview } from "./mensagem-preview";

export type ConversaPreview = {
    id: string;
    title: string;
    username: string;
    lastUserMessage: MensagemPreview;
    createdAt: Date;
}