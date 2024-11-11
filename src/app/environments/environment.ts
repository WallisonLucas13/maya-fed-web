export class Environment {
    server: Server = new Server();
    paths: Paths = new Paths();
}

export class Paths {
    conversas: string = '/conversas';
    conversa: string = '/conversa';
    mensagem: string = '/mensagem';
    register: string = '/register';
    login: string = '/login';
}

export class Server {
    api_url: string = 'http://localhost:8080/api/maya';
    api_auth_url: string = 'http://localhost:8080/api/auth';
}
