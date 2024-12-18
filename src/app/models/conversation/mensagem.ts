export type Mensagem = {
    conversationId: string;
    id: string;
    type: string;
    message: string;
    files?: string[];
    createdAt: Date;
}