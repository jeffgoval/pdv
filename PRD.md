PRD — PDV (MVP)

1. Visão Geral
   O PDV é um sistema de venda simples, rápido e mobile-first, criado para pequenos comerciantes que desejam registrar vendas e receber pagamentos via PIX ou link, diretamente do celular, sem maquininha, sem impressora e sem burocracia fiscal. O objetivo é entregar agilidade e simplicidade, priorizando a experiência do comerciante e reduzindo ao máximo a complexidade técnica e operacional.

2. Objetivos do Produto
   • Permitir que qualquer comerciante venda rapidamente usando apenas o celular.
   • Eliminar dependências de hardware externo (maquininhas, impressoras, TEF).
   • Simplificar o processo de pagamento com PIX dinâmico e link de pagamento.
   • Registrar vendas de forma organizada e gerar recibos compartilháveis.
   • Construir backend leve, barato e escalável usando Next.js + Supabase + Drizzle.
   • Lançar um MVP funcional em menos de 30 dias.

3. Público-alvo
   • Pequenos comerciantes urbanos.
   • Autônomos e MEIs.
   • Comerciantes que vendem via WhatsApp/Instagram.
   • Profissionais de serviços simples (barbeiros, manicures, vendedores de porta a porta).
   • Negócios sem experiência técnica.

4. Proposta de Valor
   O PDV oferece:
   • Venda rápida: fluxo de 6 toques do início ao fim.
   • Recebimento imediato: PIX dinâmico e link prontos em segundos.
   • Zero burocracia: sem configuração fiscal, sem impressora, sem maquininha.
   • Comprovante simples: enviado direto pelo WhatsApp.
   • Custo baixo: infraestrutura paga apenas conforme uso.

5. Premissas e Restrições
   Premissas
   • O comerciante possui smartphone com acesso à internet.
   • O usuário aceita comprovante digital em vez de cupom impresso.
   • O pagamento ocorrerá via Asaas (MVP) e futuro Pagar.me.
   Restrições
   • Não haverá emissão fiscal obrigatória nesse MVP.
   • Sistema precisa funcionar em mobile-first.
   • Nenhuma dependência de hardware externo.

6. Escopo Funcional (MVP)
   6.1 Usuário / Autenticação
   • Login com WhatsApp, Google ou email/senha.
   • Cadastro simples: nome da loja, nome do usuário.
   • Gerenciamento de sessão via cookies.
   6.2 Produtos
   • Criar, editar, excluir e listar produtos.
   • Campos: nome, preço, foto (opcional), estoque simples.
   • Estoque decrementado após venda concluída.
   6.3 Vendas
   • Criar nova venda selecionando produtos.
   • Carrinho editable.
   • Fechamento com opções: PIX (QR), Link ou Dinheiro.
   • Registro da venda com status (PENDENTE, PAGO, CANCELADO).
   • Histórico de vendas com filtro simples.
   6.4 Pagamentos
   • Gerar PIX dinâmico via Asaas (API).
   • Gerar link de pagamento (cartão/pix).
   • Exibir QR Code e copia e cola.
   • Receber webhook de confirmação e atualizar venda.
   6.5 Recibo
   • Gerar recibo em PDF.
   • Link compartilhável.
   • Envio fácil pelo WhatsApp.
   6.6 Configurações da Loja
   • Nome da loja.
   • Dados de contato.
   • Futuro: plano de assinatura.

7. Telas do MVP (Descrição)
   7.1 Login / Cadastro
   • Tela simples com botões para login via WhatsApp ou email.
   7.2 Dashboard
   • Botão principal: "Nova Venda".
   • Cards: Vendas do dia, Total recebido, Acesso rápido a produtos.
   7.3 Produtos
   • Lista com foto, nome, preço.
   • Botão "+ Produto".
   • Formulário de produto minimalista.
   7.4 Nova Venda
   • Lista de produtos com botão "+".
   • Carrinho flutuante na base.
   • Botão "Finalizar".
   7.5 Escolher Forma de Pagamento
   • PIX (QR imediato)
   • Link Asaas
   • Dinheiro
   7.6 Aguarde Pagamento
   • Mostra QR + copia e cola.
   • Status da cobrança.
   7.7 Confirmação
   • "Pagamento recebido!"
   • Botão para enviar recibo.
   7.8 Histórico de Vendas
   • Lista com data, valor, status.
   • Tela de detalhes.

8. Integração de Pagamento (Asaas)
   Fluxo 1. Criar cobrança via API. 2. Receber payload com QR Code e PIX copia e cola. 3. Exibir na tela imediatamente. 4. Asaas envia webhook no pagamento. 5. Servidor valida assinatura. 6. Venda é marcada como PAGA. 7. Recibo é liberado.
   Endpoints usados
   • POST /v3/payments
   • GET /v3/payments/:id

9. Endpoints Internos da Aplicação
   Autenticação
   • POST /auth/login
   • POST /auth/register
   • POST /auth/refresh
   Produtos
   • GET /products
   • POST /products
   • GET /products/:id
   • PUT /products/:id
   • DELETE /products/:id
   Vendas
   • POST /sales
   • GET /sales
   • GET /sales/:id
   • PUT /sales/:id/cancel
   Pagamentos
   • POST /payments/pix
   • POST /payments/link
   • POST /payments/webhook
   Recibo
   • GET /sales/:id/receipt

10. Banco de Dados (Modelo Lógico)
    Tabelas
    users(id, name, email)
    stores(id, user_id, name)
    products(id, store_id, name, price, stock, image_url)
    sales(id, store_id, total, status, created_at)
    sale_items(id, sale_id, product_id, quantity, price)
    payments(id, sale_id, provider, external_id, status, method)

11. Arquitetura Técnica
    Frontend (Next.js 14)
    • App Router
    • Server Actions
    • React Server Components
    • Tailwind
    • PWA para mobile-first
    Backend
    • API Routes (Next.js route handlers)
    • Edge Functions opcionais
    Banco
    • Supabase Postgres
    • RLS habilitado
    ORM
    • Drizzle ORM
    • Migrações versionadas
    Integrações
    • Asaas API (PIX e links)
    • Storage Supabase para imagens

12. Segurança
    • JWT + cookies httpOnly
    • RLS para proteger dados multi-loja
    • Webhooks com verificação de assinatura Asaas
    • Rate limit básico em endpoints sensíveis

13. Roadmap MVP (30 dias)
    Semana 1
    • Setup do projeto (Next + Supabase + Drizzle)
    • Modelagem inicial do banco
    • CRUD de produtos
    Semana 2
    • Fluxo de vendas
    • Carrinho
    • Integração Asaas (PIX)
    Semana 3
    • Webhooks
    • Recibos
    • Tela de histórico
    Semana 4
    • Polimento UI
    • Testes
    • Deploy

14. Critérios de Sucesso (MVP)
    • Criar uma venda em menos de 20 segundos.
    • Receber pagamento PIX em até 5 segundos após confirmação.
    • 0 erros críticos em integração Asaas.
    • Usuário conseguir operar sem tutorial.

15. Futuras Expansões
    • Emissão fiscal opcional.
    • Integração com WhatsApp Business API.
    • Programa de fidelidade.
    • Analytics simples.
    • Assinatura premium.

16. Arquitetura Componentizada e Modular
    16.1 Visão em Camadas
    A arquitetura será organizada em camadas lógicas, mantendo o monolito técnico (Next.js) porém com domínios bem separados, facilitando expansões futuras.
    • Camada de Apresentação (Frontend)
    ○ Next.js (App Router), React + Tailwind.
    ○ Páginas e componentes organizados por domínio: products/, sales/, checkout/, settings/, billing/.
    ○ Uso de Server Components e Server Actions para reduzir boilerplate de API quando fizer sentido.
    • Camada de Aplicação (Backend dentro do Next)
    ○ Handlers em /app/api/\*\* organizados por domínio.
    ○ Cada domínio expõe casos de uso claros (ex.: createSale, generatePix, getStoreFeatures).
    • Camada de Domínio
    ○ Serviços + modelos de domínio independentes de framework (lógica de negócio pura).
    ○ Pode ser extraída para libs internas no futuro.
    • Camada de Infraestrutura
    ○ Drizzle ORM + Supabase Postgres.
    ○ Clients para Asaas, storage, e futuras integrações (Pagar.me, emissão fiscal, WhatsApp API).
    16.2 Diagrama de Alto Nível
    flowchart LR
    User[Comerciante no celular] --> UI[Next.js App (PWA)]
    UI --> API[/API Routes / Server Actions/]
    API --> Domain[(Serviços de Domínio)]
    Domain --> DB[(Supabase Postgres)]
    Domain --> Asaas[(Asaas API)]
    Domain --> Features[(Feature Flags)]
    16.3 Domínios / Módulos Internos
    Cada módulo é um "pacote" lógico (pasta + serviços + modelos) com responsabilidade clara:
    • Core
    ○ Usuário, Loja, Plano, Assinatura.
    ○ Feature flags da loja.
    ○ Autenticação e autorização.
    • Catalog (Produtos)
    ○ CRUD de produtos.
    ○ Estoque básico.
    • Sales (Vendas)
    ○ Criação de vendas, itens, status.
    ○ Conexão com pagamentos e recibos.
    • Payments (Pagamentos)
    ○ Orquestração de cobranças.
    ○ Interface de provider genérica, ex.: PaymentProvider.
    ○ Implementação inicial AsaasProvider.
    ○ Futuras: PagarmeProvider, PixManualProvider.
    • Receipts (Recibos)
    ○ Geração de PDF.
    ○ Link público compartilhável.
    • Notifications (Futuro)
    ○ Envio de link/recibo via WhatsApp, SMS, email.
    • Fiscal (Futuro Add-on)
    ○ Integração com emissor fiscal para NF/NFC-e.
    ○ Totalmente isolado e ativado apenas via feature flag.
    16.4 Diagrama de Módulos
    flowchart TB
    Core --> Catalog
    Core --> Sales
    Core --> Payments
    Core --> Features
    Catalog --> Sales
    Sales --> Payments
    Sales --> Receipts
    Payments --> Asaas
    Payments --> Pagarme
    Features --> UI
    Features --> API

17. Sistema de Feature Flags e Add-ons por Cliente
    17.1 Objetivo
    Permitir habilitar/desabilitar funcionalidades e add-ons por loja, sem precisar criar forks de código ou múltiplos deploys. Isso viabiliza planos diferentes (Free, Pro, Premium) e recursos exclusivos por cliente.
    17.2 Modelo de Dados
    Tabelas adicionais:
    • features
    ○ id
    ○ key (string única, ex.: advanced_reports, fiscal_module, multi_cashier)
    ○ description
    ○ default_enabled (bool)
    • store_features
    ○ id
    ○ store_id
    ○ feature_id
    ○ enabled (bool)
    ○ config (JSON opcional para parâmetros extras, ex.: limites, opções).
    17.3 Avaliação de Feature Flags
    • Na autenticação, o backend carrega as features ativas da loja.
    • As flags são injetadas em um contexto de requisição (ex.: via middleware / Server Action).
    • O frontend consome um endpoint /api/features ou recebe flags embutidas em Server Components.
    • Os componentes de UI verificam flags antes de exibir botões, telas e ações.
    Exemplos de uso no frontend:
    • Esconder botão "Relatórios avançados" se advanced_reports estiver desativada.
    • Exibir aba "Fiscal" apenas se fiscal_module estiver ativa.
    Exemplos de uso no backend:
    • Bloquear endpoint de emissão fiscal quando fiscal_module = false.
    • Limitar número de produtos, vendas ou caixas por flag/plano.
    17.4 Fluxo de Decisão
    flowchart LR
    Request[Request do usuário] --> Middleware
    Middleware --> LoadFlags[Carrega flags da loja]
    LoadFlags --> Context[Injeta flags no contexto]
    Context --> Handler[Handler da rota / caso de uso]
    Handler --> CheckFlag{Feature habilitada?}
    CheckFlag -->|Não| Deny[Retorna erro ou oculta funcionalidade]
    CheckFlag -->|Sim| Proceed[Executa lógica normalmente]
    17.5 Exemplos de Add-ons Futuro (via Flags)
    • fiscal_module → habilita módulo de emissão de NF/NFC-e.
    • advanced_reports → relatórios por período, por produto, por operador.
    • multi_cashier → múltiplos caixas por loja.
    • loyalty_program → pontos, cashback, fidelidade.
    • whatsapp_notifications → envio de recibo/links automáticos.
    Cada add-on:
    • terá seu próprio módulo de domínio;
    • poderá ter tabelas específicas;
    • só será considerado pelo código quando a flag estiver ativa.
