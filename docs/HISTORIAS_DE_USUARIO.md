# Histórias de usuário — Fechou!

As histórias abaixo registram fluxos previstos para o produto. Exceto pela navegação e pelo diagnóstico técnico do frontend, as funcionalidades estão planejadas para etapas futuras.

## 1. Descoberta de prestadores — planejada

**Como consumidor, quero descobrir prestadores por tipo de serviço, para encontrar opções que possam atender à minha necessidade.**

Critérios de aceitação:

- O consumidor consegue selecionar ou pesquisar uma categoria de serviço.
- O sistema apresenta uma lista de perfis associados ao serviço escolhido.
- Quando não houver resultados, o sistema explica que nenhum prestador foi encontrado e permite alterar a busca.

## 2. Visualização de perfil — planejada

**Como consumidor, quero visualizar o perfil de um prestador, para entender os serviços que ele apresenta antes de entrar em contato.**

Critérios de aceitação:

- Ao selecionar um prestador no diretório, o sistema abre o perfil correspondente.
- O perfil apresenta a descrição e os serviços informados pelo prestador.
- O sistema não exibe avaliações, verificações ou estatísticas sem dados correspondentes.

## 3. Criação de solicitação — planejada

**Como consumidor, quero criar uma solicitação de serviço, para explicar o que preciso e receber respostas relacionadas.**

Critérios de aceitação:

- O consumidor pode informar o serviço desejado e uma descrição da necessidade.
- Campos obrigatórios são identificados e validados antes do envio.
- Após o envio bem-sucedido, o sistema confirma a criação e apresenta a solicitação registrada.

## 4. Comunicação entre usuários — planejada

**Como consumidor ou prestador, quero conversar sobre uma solicitação, para esclarecer detalhes antes de decidir como prosseguir.**

Critérios de aceitação:

- A conversa está associada a uma solicitação identificável.
- Cada mensagem enviada aparece na conversa com sua autoria e ordem.
- A interface informa quando uma mensagem não pôde ser enviada e oferece uma forma de tentar novamente.

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
