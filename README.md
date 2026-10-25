# Fechou! — frontend

Base oficial do frontend do **Fechou!**, um marketplace de serviços que pretende aproximar pessoas que procuram um serviço de prestadores profissionais. Esta versão estabelece a estrutura inicial para as próximas sprints; não representa o marketplace completo.

## Objetivo

Preparar uma aplicação web responsiva para descoberta de prestadores, apresentação de perfis, envio de solicitações, comunicação entre usuários e, em etapas futuras, recebimento e comparação de propostas e contratação.

## Stack

- React 19 com JavaScript e JSX.
- Vite 8 para desenvolvimento e build.
- React Router DOM 7 para navegação no cliente.
- Axios para preparar as chamadas HTTP.
- CSS convencional com variáveis, layout mobile-first e breakpoints em 480, 768, 1024 e 1440 px.
- ESLint para análise estática.

As versões resolvidas estão registradas em `package-lock.json`.

## Pré-requisitos

- Node.js 20.19+ ou 22.12+ (a versão atual do Vite requer uma dessas linhas ou mais recente).
- npm compatível com a versão do Node.js instalada.

## Instalação e execução

Na pasta `Marketplace-Servicos-Frontend`, instale exatamente as dependências registradas no lockfile:

```sh
npm ci
npm run dev
```

O Vite informa no terminal o endereço local para abrir no navegador. Para executar as verificações e gerar a versão de produção:

```sh
npm run lint
npm run build
npm run preview
```

`preview` serve localmente os arquivos já gerados em `dist/`; execute `npm run build` antes dele.

## Variáveis de ambiente

O frontend usa `VITE_API_URL` como endereço-base da API. O fallback para desenvolvimento local é `http://localhost:3001/api`.

O arquivo `.env.example` contém apenas um valor de exemplo e pode ser copiado para `.env`.

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edite `VITE_API_URL` em `.env` se a API usar outro endereço. Reinicie o servidor Vite depois de alterar variáveis de ambiente. `.env` e variantes locais são ignorados pelo Git; não coloque credenciais nesses arquivos.

## Estrutura principal

```text
public/                  Arquivos estáticos públicos
docs/                    Escopo, histórias e wireframes locais
src/auth/                Contexto central do estado demonstrativo da conta
src/components/          Cabeçalho, navegação e componentes comuns de tela e formulário
src/components/requests/ Formulário compartilhado de criação e edição de pedidos
src/pages/               Páginas públicas, de descoberta, conta, pedidos e conversas
src/services/            Cliente HTTP e serviços locais demonstrativos de conta, prestadores, pedidos e conversas
src/styles/              Variáveis e estilos globais
src/App.jsx               Rotas e layout compartilhado
src/main.jsx              Inicialização do React e importação de estilos
```

## Rotas disponíveis

- `/` — página inicial.
- `/servicos` — diretório demonstrativo com pesquisa por texto, categoria e bairro.
- `/prestadores/:id` — perfil demonstrativo com os dados compartilhados com a Home e o diretório.
- `/sobre` — visão do produto e estado da fundação.
- `/diagnostico-api` — chamada `GET /health` pela instância Axios configurada.
- `/entrar` — acesso local para um perfil criado no navegador ou para o perfil demonstrativo explícito.
- `/cadastro` — criação local de um perfil de apresentação.
- `/recuperar-senha` — validação demonstrativa; não envia e-mail.
- `/minha-conta` — perfil pessoal editável, protegido apenas pela navegação do frontend.
- `/solicitar-servico` — formulário protegido com preenchimento, revisão e confirmação de pedido local.
- `/meus-pedidos` — listagem dos pedidos da conta demonstrativa, com filtro por status.
- `/meus-pedidos/:requestId` — detalhes, histórico, edição de pedido aberto e cancelamento confirmado.
- `/conversas` — caixa de entrada local, agrupada pelos pedidos da conta.
- `/conversas/:conversationId` — histórico de mensagens demonstrativas ligado a pedido e prestador.
- Qualquer outra URL — página NotFound.

## Como experimentar a conta demonstrativa

Para entrar sem criar um perfil, abra `/entrar` e selecione **Entrar com perfil demonstrativo**. Essa ação cria localmente a identidade “Pessoa demonstrativa”. Também é possível cadastrar nome, e-mail e uma senha de pelo menos 8 caracteres. O formulário confere o preenchimento e a confirmação; a senha é descartada e não é verificada nem salva. Para entrar depois com um cadastro local, informe seu e-mail e qualquer senha não vazia: como não há autenticação real, a senha não é comparada.

Os perfis de conta (nome, e-mail, cidade, região e apresentação) ficam em `localStorage` neste navegador para que os dados demonstrativos sobrevivam a recarregamentos. O identificador da sessão fica em `sessionStorage`, portanto a sessão dura na aba atual e termina quando ela é fechada ou quando a pessoa sai da conta. Nenhuma senha ou token é armazenado. Os dados locais podem ser removidos limpando os dados do site no navegador.

O controle de acesso de `/minha-conta`, `/solicitar-servico` e `/meus-pedidos` é somente uma proteção de navegação no React; a verificação de propriedade dos pedidos também ocorre localmente e não oferece segurança nem substitui autorização no servidor. A recuperação não envia e-mail e não cria tokens. Cadastro, login, perfil, pedidos e recuperação deverão ser substituídos por operações reais da API Node.js quando ela existir. A página de diagnóstico continua verificando a API real sem simular sua disponibilidade.

## Pedidos demonstrativos

Com a sessão iniciada, solicite um serviço pela Home, pelo diretório ou diretamente em `/solicitar-servico`. Informe título, categoria, descrição, cidade e estado; bairro, data, horário e orçamento são opcionais. A cidade e a região começam preenchidas com os dados do perfil, quando disponíveis, sem alterar o perfil. O formulário tem uma etapa de revisão, e só a confirmação final grava o pedido.

Em `/meus-pedidos`, os pedidos da conta atual aparecem do mais recente ao mais antigo e podem ser filtrados por status. Os detalhes permitem editar um pedido aberto ou cancelá-lo mediante confirmação. O cancelamento preserva o pedido e seu histórico. A estrutura local inclui identificador estável, `ownerId`, campos do pedido, status `open`/`cancelled`, datas `createdAt`/`updatedAt` e uma lista de eventos de histórico (`created`, `edited`, `cancelled`).

Os pedidos ficam em `localStorage` na chave `fechou.demo.requests.v1`, associados ao ID estável do perfil. O serviço local verifica a propriedade em listagem, consulta, edição e cancelamento. Isso serve para demonstrar a navegação e não protege dados contra inspeção ou alteração no navegador; autorização real pertence à API futura. Se o armazenamento local estiver indisponível ou inválido, a interface informa o erro. Pedidos não são enviados a prestadores; as conversas locais descritas abaixo não notificam profissionais; propostas e contratações não ocorrem.

Para testar pedidos: entre em `/entrar` com **Entrar com perfil demonstrativo**, crie um pedido, confira a revisão e confirme. Edite e salve para registrar o histórico. Para testar conversas, use um pedido ainda aberto: no diretório, abra um perfil demonstrativo, selecione **Iniciar conversa** e associe o pedido. Envie uma mensagem e atualize a página para conferir a persistência. O controle **Adicionar resposta de demonstração** grava explicitamente uma resposta fictícia, identificada no histórico. Ao retornar à caixa de entrada, essa mensagem aparece como não lida; abrir a conversa marca o indicador localmente como lido. Repetir a abertura para o mesmo par de pedido e prestador recupera a conversa existente. Por fim, cancele o pedido para conferir que o histórico continua acessível, mas somente para leitura.

Conversas usam `localStorage` na chave `fechou.demo.conversations.v1`, sem cópias dos dados do pedido ou do prestador. Cada registro guarda `id`, `requestId`, `ownerId`, `providerId`, datas de criação/atualização, data da última mensagem e uma lista de mensagens (`id`, `conversationId`, `senderId`, tipo de remetente, texto, data, flag demonstrativa e data de leitura). A listagem, leitura e escrita verificam o ID da conta; a criação exige um pedido aberto da conta atual e um perfil de prestador disponível. Uma combinação pedido + prestador é única por conta e reutiliza o identificador já criado. Pedidos cancelados mantêm o histórico acessível em modo somente leitura. Essas verificações são locais e não oferecem autorização real.

Mensagens e a resposta do prestador são exclusivamente conteúdo de demonstração no navegador. A resposta do outro lado só é gravada após ação explícita; nenhum profissional real recebe ou envia mensagens. A sessão dura na aba atual em `sessionStorage`, enquanto perfis, pedidos e conversas demonstrativos permanecem no `localStorage` após recarregar. A API futura deverá fornecer autenticação e autorização no servidor, persistência, envio e recebimento de mensagens (e, se necessário, sincronização e notificações); nenhuma comunicação em tempo real existe nesta sprint.

## Estado e próximas etapas

A aplicação inclui Home e diretório com busca e filtros locais, perfis demonstrativos, páginas de acesso, sessão local, perfil pessoal editável, gerenciamento local de pedidos e caixa de entrada/conversas demonstrativas. Perfis de prestadores, regiões, valores e avaliações do diretório são conteúdo ilustrativo. O cliente Axios e o diagnóstico estão preparados para a API, mas não há backend mockado neste repositório.

Propostas, comparação de orçamentos, contratação, pagamentos, dados reais e autenticação/autorização no servidor permanecem para etapas futuras. Cadastro, sessão, pedidos e conversas locais deverão ser substituídos ou sincronizados com a API Node.js quando ela existir. A API será mantida em um repositório separado. As telas locais em `docs/wireframes/` são wireframes HTML de baixa fidelidade; a transposição para Figma e o compartilhamento de um link continuam pendentes.
