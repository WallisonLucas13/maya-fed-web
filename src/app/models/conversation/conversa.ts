import { Mensagem } from "./mensagem";

export type Conversa = {
    id: string;
    username: string;
    title: string;
    messages: Mensagem[];
    createdAt: Date;
}