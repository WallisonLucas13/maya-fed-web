export class Environment {
    server: Server = new Server();
    paths: Paths = new Paths();
}

export class Paths {
    conversas: string = '/conversas';
    conversa: string = '/conversa';
    mensagem: string = '/mensagem';
}

export class Server {
    api_url: string = 'http://localhost:8080/mayaAI';
}
