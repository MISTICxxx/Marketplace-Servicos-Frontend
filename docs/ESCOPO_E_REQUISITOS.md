# Escopo e requisitos — Fechou!

## Objetivos do projeto

Preparar um marketplace de serviços que facilite a descoberta de prestadores, a apresentação de profissionais e o contato entre consumidores e prestadores. Nas etapas seguintes, o produto pretende apoiar solicitações, comunicação, recebimento e comparação de propostas e contratação.

## Problema que o produto pretende resolver

Quem precisa contratar um serviço pode ter dificuldade para descobrir profissionais, entender o que oferecem e organizar o contato para explicar uma necessidade e avaliar alternativas.

## Proposta de solução

O Fechou! pretende reunir em um único produto a descoberta de prestadores, seus perfis, o envio de solicitações e a comunicação entre as pessoas envolvidas. A comparação de orçamentos e a contratação fazem parte da visão futura do marketplace.

## Escopo inicial do MVP

O MVP do produto prevê os seguintes fluxos, que serão implementados em etapas:

1. Descobrir prestadores por serviço.
2. Consultar o perfil e a apresentação de um prestador.
3. Criar uma solicitação de serviço e, com a API, enviá-la ao marketplace.
4. Comunicar-se com a outra pessoa sobre a solicitação.
5. Receber e comparar propostas para decidir como prosseguir.

As primeiras etapas prepararam a base, a descoberta demonstrativa de prestadores e as telas de acesso e perfil pessoal com dados locais. Esta sprint acrescenta criação, revisão e gerenciamento de solicitações no navegador; não cria API nem persistência no servidor.

## Requisitos funcionais iniciais

- **RF01 — Descoberta:** o consumidor poderá localizar prestadores por categoria ou serviço quando o diretório for implementado.
- **RF02 — Perfil:** o consumidor poderá consultar a apresentação e as informações disponibilizadas por um prestador.
- **RF03 — Solicitação local:** uma pessoa com sessão demonstrativa poderá preencher e revisar os detalhes do serviço e confirmar o registro local do pedido.
- **RF04 — Comunicação:** consumidor e prestador poderão trocar mensagens relacionadas a uma solicitação.
- **RF05 — Propostas:** o consumidor poderá receber e comparar propostas associadas ao serviço solicitado.
- **RF06 — Navegação do frontend:** a fundação disponibiliza páginas inicial, serviços, institucional, diagnóstico da API e uma página para rotas inexistentes.
- **RF07 — Integração preparada:** o frontend disponibiliza uma chamada HTTP configurável para verificar o endpoint `GET /health` quando a API estiver disponível.
- **RF08 — Conta demonstrativa:** a pessoa pode criar uma identidade local, abrir o perfil de demonstração e navegar por rotas de acesso sem enviar credenciais a um servidor.
- **RF09 — Perfil pessoal demonstrativo:** a pessoa autenticada na sessão local pode consultar e editar nome, cidade, região e apresentação no armazenamento do navegador.
- **RF10 — Navegação de conta:** páginas públicas de login, cadastro e recuperação explicam os limites locais; `/minha-conta` exige uma sessão apenas no frontend.
- **RF11 — Lista pessoal de pedidos:** a pessoa autenticada pode consultar apenas pedidos associados ao ID estável de seu perfil, ordenados dos mais recentes, e filtrar abertos ou cancelados.
- **RF12 — Detalhes e histórico:** a pessoa pode abrir seu pedido, consultar os dados e eventos de criação, edição e cancelamento; identificadores de outra conta não revelam os dados do pedido.
- **RF13 — Edição de pedido:** pedidos abertos podem ser revisados e editados após confirmação, preservando ID, proprietário e data de criação e atualizando a data de modificação.
- **RF14 — Cancelamento de pedido:** a pessoa confirma explicitamente o cancelamento de um pedido aberto; ele passa a `cancelled`, mantém seus dados e histórico e deixa de aceitar edição.
- **RF15 — Persistência demonstrativa:** pedidos são armazenados localmente em `localStorage`, segregados por `ownerId`, e continuam disponíveis após recarregar a página no mesmo navegador.

RF01–RF02 estão disponíveis com perfis demonstrativos. RF03 e RF11–RF15 estão disponíveis somente como experiência local de demonstração, sem envio a prestadores. RF04 está disponível como troca de mensagens local e explicitamente demonstrativa; propostas (RF05) seguem planejadas. RF08–RF10 também existem somente na experiência demonstrativa; nenhuma delas representa autenticação ou autorização real.

- **RF16 — Conversas demonstrativas:** uma pessoa autenticada pode iniciar/reabrir uma conversa local para um pedido aberto de sua autoria e um prestador demonstrativo, consultar a caixa de entrada agrupada por pedido, enviar mensagens textuais e marcar respostas demonstrativas como lidas.
- **RF17 — Persistência e histórico de conversa:** conversas e mensagens locais persistem no navegador e são segregadas pelo identificador da conta. Mensagens de demonstração são identificadas e não representam comunicação real.

RF16–RF17 estão disponíveis apenas no frontend demonstrativo. A resposta do prestador exige uma ação explícita e é fictícia. Pedidos cancelados mantêm a conversa para consulta, mas não permitem novas mensagens. A autorização real e a troca de mensagens dependem da API futura.

## Delimitação desta sprint

Não fazem parte desta sprint: autenticação ou autorização real, armazenamento de senhas, banco de dados, backend, envio de e-mails, recuperação efetiva de senha, notificações reais a prestadores, mensagens reais, propostas, comparação de propostas, contratação ou pagamentos. Pedidos, conversas e mensagens são registros de demonstração em `localStorage`, não são enviados a prestadores e não representam ofertas ou comunicações reais. Conversas usam `fechou.demo.conversations.v1`, associam pedido e prestador por identificadores estáveis e verificam localmente o `ownerId`; uma combinação pedido/prestador não cria duplicatas. Pedidos cancelados ficam somente para leitura. Cadastro e perfil guardam somente dados de apresentação em `localStorage`; pedidos usam `fechou.demo.requests.v1`; o identificador da sessão fica em `sessionStorage` na aba atual. As proteções de rota e propriedade são verificações de interface e não substituem autorização no servidor. O diagnóstico mostra a ausência ou resposta da API sem simular um backend.
