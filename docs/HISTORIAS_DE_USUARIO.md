# Histórias de usuário — Fechou!

As histórias abaixo registram fluxos do produto e indicam o que já pode ser percorrido no frontend. Os perfis e a conta desta etapa usam conteúdo e armazenamento locais demonstrativos; isso não equivale a uma operação de servidor.

## 1. Descoberta de prestadores — diretório demonstrativo disponível

**Como consumidor, quero descobrir prestadores por tipo de serviço, para encontrar opções que possam atender à minha necessidade.**

Critérios de aceitação:

- A pessoa consegue pesquisar serviço ou prestador e combinar termo, categoria e bairro.
- O diretório apresenta registros locais fictícios associados aos filtros aplicados.
- Quando não houver resultados, a tela explica o estado vazio e oferece limpar a busca e os filtros.

## 2. Visualização de perfil — dados demonstrativos disponíveis

**Como consumidor, quero visualizar o perfil de um prestador, para entender os serviços que ele apresenta antes de entrar em contato.**

Critérios de aceitação:

- Ao selecionar um registro local na Home ou no diretório, o sistema abre o perfil pelo identificador.
- O perfil apresenta descrição, serviços e regiões do mesmo registro demonstrativo usado no diretório.
- Valores e indicadores locais são identificados como ilustrativos; não há verificações profissionais ou avaliações reais.

## 3. Criar e revisar solicitação — demonstração local disponível

**Como consumidor, quero criar uma solicitação de serviço, para explicar o que preciso e receber respostas relacionadas.**

Critérios de aceitação:

- Uma pessoa autenticada pode informar título, categoria, descrição, cidade e região; bairro, data, horário e orçamento são opcionais.
- Cidade e região são inicializadas com os dados do perfil quando disponíveis, sem alterar o perfil.
- Campos obrigatórios, limites de texto e coerência do orçamento são validados, com mensagens junto aos campos.
- Antes de salvar, a pessoa revisa todos os dados; somente a confirmação registra o pedido no armazenamento demonstrativo local.
- A confirmação informa que nenhum prestador foi notificado e abre os detalhes do pedido recém-criado.

## 4. Conversa vinculada ao pedido — demonstração local disponível

**Como consumidor ou prestador, quero conversar sobre uma solicitação, para esclarecer detalhes antes de decidir como prosseguir.**

Critérios de aceitação:

- A pessoa autenticada inicia uma conversa a partir do perfil demonstrativo, selecionando somente um pedido aberto de sua autoria.
- A combinação de pedido e prestador recupera a conversa existente, sem gerar duplicatas.
- A caixa de entrada agrupa conversas pelo pedido relacionado, em ordem de atividade recente.
- Uma mensagem não vazia enviada aparece em ordem cronológica e permanece no navegador após recarregar.
- Respostas do outro lado só são adicionadas por ação explícita, são identificadas como demonstração e não representam contato real.
- Mensagens recebidas não lidas recebem um indicador local que desaparece ao abrir a conversa.
- Um pedido cancelado mantém o histórico para consulta, mas bloqueia novas mensagens.
- Um erro de armazenamento não é apresentado como envio concluído; o texto digitado permanece disponível para nova tentativa.

## 5. Recebimento de propostas — planejada

**Como consumidor, quero receber propostas de prestadores para minha solicitação, para considerar alternativas de atendimento.**

Critérios de aceitação:

- Uma proposta recebida está vinculada à solicitação que a originou e identifica o prestador.
- O consumidor consegue consultar os detalhes apresentados na proposta.
- O sistema distingue uma solicitação sem propostas de outra que já recebeu propostas.

## 6. Comparação de propostas — planejada

**Como consumidor, quero comparar as propostas recebidas, para avaliar as alternativas antes de escolher como seguir.**

Critérios de aceitação:

- O sistema permite consultar lado a lado os detalhes disponíveis de duas ou mais propostas.
- Os critérios apresentados são os mesmos para cada proposta e correspondem a dados informados pelos prestadores.
- A comparação não escolhe nem contrata automaticamente um prestador.

## 7. Navegação entre páginas-base — disponível nesta sprint

**Como pessoa visitante, quero navegar entre as páginas do Fechou!, para conhecer a estrutura inicial do projeto.**

Critérios de aceitação:

- A navegação principal leva às páginas Início, Serviços e Sobre sem recarregar o documento.
- O destino atual é indicado visualmente e com `aria-current`.
- Uma URL desconhecida apresenta uma página NotFound com um link para voltar ao início.

## 8. Criar perfil e entrar — demonstração local disponível

**Como pessoa usuária, quero criar um perfil demonstrativo ou entrar no modo de demonstração, para conhecer a experiência de conta do Fechou!.**

Critérios de aceitação:

- O cadastro valida nome, formato básico de e-mail, senha mínima indicada na tela e confirmação coincidente.
- O perfil guarda nome e e-mail localmente e não persiste a senha informada.
- A tela de entrada oferece uma ação explícita para criar ou reabrir a identidade de demonstração sem uma conta preexistente escondida.
- A interface informa que a sessão e o cadastro não são verificados por um servidor.

## 9. Consultar e editar perfil pessoal — demonstração local disponível

**Como pessoa usuária com uma sessão demonstrativa, quero visualizar e editar meus dados de apresentação, para conferir como o espaço pessoal será organizado.**

Critérios de aceitação:

- Uma pessoa visitante que abre `/minha-conta` é encaminhada à tela de entrada.
- O perfil exibe nome, e-mail, cidade, região e apresentação, com possibilidade de editar e cancelar.
- Ao salvar, as alterações permanecem neste navegador após recarregar a página e a interface identifica esse armazenamento local.
- O botão para sair limpa a sessão demonstrativa e permite retornar às páginas públicas.

## 10. Solicitar recuperação de senha — demonstração sem envio

**Como pessoa usuária, quero informar meu e-mail na tela de recuperação, para conhecer o fluxo previsto para uma etapa futura.**

Critérios de aceitação:

- O formulário valida se o e-mail tem um formato básico válido.
- A confirmação informa explicitamente que nenhum e-mail foi enviado e que a recuperação real depende da API.
- A tela não cria token nem pede uma nova senha.

## 11. Consultar meus pedidos — demonstração local disponível

**Como pessoa usuária autenticada, quero consultar meus pedidos, para acompanhar os detalhes que registrei neste navegador.**

Critérios de aceitação:

- `/meus-pedidos` lista somente registros associados ao ID estável da conta atual, do mais recente ao mais antigo.
- A pessoa pode filtrar pedidos abertos e cancelados e abrir os detalhes de um pedido.
- Uma lista vazia e um filtro sem resultados apresentam explicação e uma ação apropriada.
- Uma conta diferente não consegue consultar os detalhes de um pedido alheio pela URL.

## 12. Editar ou cancelar pedido — demonstração local disponível

**Como pessoa usuária autenticada, quero editar ou cancelar um pedido ainda aberto, para manter minhas informações atualizadas ou encerrar uma solicitação que não preciso mais.**

Critérios de aceitação:

- A edição carrega os dados atuais e exige revisão e confirmação antes de salvar.
- A edição mantém identificador, proprietário e data de criação, atualiza a data de modificação e registra um evento no histórico.
- O cancelamento requer confirmação explícita, altera o status para cancelado e preserva os dados e o histórico.
- Um pedido cancelado não pode ser editado e continua disponível para consulta.
- O estado, os dados e o histórico permanecem após recarregar a página; essa persistência é apenas local e demonstrativa.

## 13. Acessar conversas próprias — demonstração local disponível

**Como pessoa usuária autenticada, quero consultar conversas ligadas aos meus pedidos, para retomar o contexto das mensagens.**

Critérios de aceitação:

- `/conversas` e `/conversas/:conversationId` exigem a sessão demonstrativa; o login preserva o destino solicitado.
- A interface lista somente conversas cujo identificador está associado à conta atual e não revela dados de outra conta para IDs inválidos.
- Cada item identifica o prestador demonstrativo e o pedido relacionado, com acesso aos detalhes do pedido da própria conta.
- Conversas e mensagens permanecem no navegador após recarregar, segregadas pelo ID estável da conta.
- A interface informa que não há comunicação real nem notificação de profissionais; a autorização futura pertence à API.
