import { MensagemPreview } from "./mensagem-preview";

export type ConversationPreview = {
    id: string;
    title: string;
    username: string;
    lastUserMessage: MensagemPreview;
    createdAt: Date;
}