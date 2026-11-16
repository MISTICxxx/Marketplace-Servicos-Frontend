# Fechou! — frontend

Frontend React do marketplace Fechou!, integrado à API Node.js na pasta vizinha `Marketplace-Servicos-api/api`. Cadastro, login, perfil, diretório de prestadores, pedidos e conversas usam a API; os registros são persistidos no MySQL.

## Executar a aplicação

Requisitos: Node.js 20.19+ e npm.

### 1. Inicie a API

Na pasta `Marketplace-Servicos-api/api`, configure o arquivo `.env` com os dados do MySQL e execute:

```powershell
npm install
npm run dev
```

O schema configurado em `MYSQL_DATABASE` precisa existir. As tabelas são criadas pela API ao iniciar. Confirme a disponibilidade em `http://localhost:3001/health`.

### 2. Inicie o frontend

Em outro terminal, na pasta `Marketplace-Servicos-Frontend`, execute:

```powershell
npm ci
npm run dev
```

O `.env` do frontend já configura `VITE_API_URL=http://localhost:3001/api`. Se mudar a URL da API, atualize essa variável e reinicie o Vite.

## Fluxos conectados

- `/cadastro` e `/entrar`: criam conta e autenticam com senha no backend. O token JWT fica no `sessionStorage` da aba.
- `/minha-conta`: consulta e atualiza o perfil da conta autenticada.
- `/painel-prestador`: publica o perfil, categorias, bairros atendidos e serviços no diretório.
- `/servicos` e `/prestadores/:id`: consultam prestadores cadastrados no backend.
- `/solicitar-servico`, `/meus-pedidos` e `/meus-pedidos/:requestId`: criam, listam, editam e cancelam pedidos, mantendo o histórico no banco.
- `/conversas` e `/conversas/:conversationId`: abrem conversas vinculadas a pedidos e persistem mensagens no backend.
- `/diagnostico-api`: verifica `GET /api/health`.

Crie uma conta pelo cadastro; não há perfis de demonstração pré-configurados. A recuperação de senha ainda é apenas uma tela demonstrativa e não envia e-mail. Propostas, contratação e pagamentos também não fazem parte dos fluxos atuais.

## Testes funcionais

- `npm test`: testes de componentes e serviços em DOM simulado; as chamadas HTTP são controladas e não acessam a API ou o banco.
- `npm run test:watch`: executa a mesma suíte em modo de observação.
- `npm run test:integration`: chama a API real pelos serviços do frontend. Antes, inicie a API somente com o MySQL descartável descrito na documentação técnica do backend e configure, no PowerShell, `FECHOU_FRONTEND_TEST_API_URL` com uma URL explícita como `http://127.0.0.1:33001/api`. Remova a variável com `Remove-Item Env:FECHOU_FRONTEND_TEST_API_URL` ao terminar.

A integração rejeita URLs sem `127.0.0.1`, porta explícita de teste ou o caminho `/api`; sem a variável, ela encerra antes de fazer requisições. O teste cria contas e registros fictícios no banco conectado à API, então nunca o execute contra um banco compartilhado. Os testes usam DOM simulado e não substituem revisão visual no navegador.

## Stack e comandos

- React 19, Vite, React Router e Axios.
- `npm run dev`: servidor local.
- `npm run lint`: análise estática.
- `npm run build`: build de produção.
- `npm run preview`: visualiza o build após executar `npm run build`.
- `npm test`, `npm run test:watch` e `npm run test:integration`: testes funcionais descritos acima.
