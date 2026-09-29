# Disk Ingressos — Core Financeiro Unificado (ERP / CRM)
## Implementação Completa da Demonstração (Pacote Único Integrado)

Este projeto implementa de uma única vez o ambiente demonstrativo completo do **Financeiro Disk Ingressos**, com base na arquitetura **Limitless** da referência [https://financeiropdtnovo.web.app/](https://financeiropdtnovo.web.app/), utilizando um único **Core Financeiro** e separando a experiência por perfil de acesso.

---

### 1. Acesso Imediato à Demonstração

- **URL no Navegador:** [http://localhost:3000](http://localhost:3000) (Servidor Node.js nativo ativo)
- **Diretório no VS Code:** `C:\Users\vinad\OneDrive\Desktop\Modulo_Financeiro_v1`
- **Comando para abrir no VS Code:**
  ```powershell
  code C:\Users\vinad\OneDrive\Desktop\Modulo_Financeiro_v1
  ```

---

### 2. Credenciais dos Usuários de Demonstração

| Perfil | E-mail de Demonstração | Senha | Direcionamento | Visão e Regras de Segurança |
| :--- | :--- | :--- | :--- | :--- |
| **PRODUTOR** | `produtor@demo.disk` | `demo123` | `/produtor` | Produtora ABC Ltda. Visualiza apenas seus próprios eventos e saldos. Proibido ver outros produtores. |
| **FINANCEIRO** | `karine@diskingressos.com.br` | `demo123` | `/financeiro` | Karine (Adm do Financeiro). Visão transversal de todos os produtores, adquirentes e Central de Aprovações. |
| **ADMINISTRADOR** | `karine@diskingressos.com.br` | `demo123` | `/financeiro` | Karine (Adm do Financeiro). Acesso total irrestrito a governança, conciliação e reversões no Ledger. |

---

### 3. Estrutura Completa de Pastas (VS Code)

```text
disk-financeiro/
│
├── frontend/                     # REACT 18 + TYPESCRIPT (Vite + React Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx           # Shell principal conectando Router e Providers
│   │   │   ├── router.tsx        # Rotas com guards RBAC e redirecionamento automático
│   │   │   └── providers.tsx     # Contextos Auth, Financeiro e Notificações
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx     # Tela de login com cards rápidos de demonstração
│   │   │   ├── AuthContext.tsx   # Gerenciamento de sessão, perfil e tenant
│   │   │   ├── ProtectedRoute.tsx# Guard de autenticação
│   │   │   ├── RoleRoute.tsx     # Guard estrito de perfil (403 Forbidden)
│   │   │   └── permissions.ts    # Matriz RBAC
│   │   │
│   │   ├── layouts/
│   │   │   ├── ProdutorLayout.tsx   # Menu canônico de 8 itens do Produtor
│   │   │   ├── FinanceiroLayout.tsx # Menu completo de 21 itens do Financeiro Disk
│   │   │   └── AdminLayout.tsx      # Layout Master Admin
│   │   │
│   │   ├── components/
│   │   │   ├── Header/              # Header com busca global e seletores contextuais
│   │   │   ├── BuscaProdutor/       # Seletor global Produtor → Evento
│   │   │   ├── SeletorEvento/       # Seletor cascateado por evento
│   │   │   ├── AssinaturaDigital/   # Modal com trava de assinatura sequencial
│   │   │   ├── StatusBadge/         # Badges com os 14 status 100% em pt-BR
│   │   │   ├── Timeline/            # Trilha de auditoria cronológica e imutável
│   │   │   ├── Notificacoes/        # Dropdown de alertas operacionais em tempo real
│   │   │   └── Cards/               # Cards de KPIs financeiros
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── FinanceiroContext.tsx # Contexto transversal (ProdutorId / EventoId)
│   │   │   └── NotificacaoContext.tsx# Fila de notificações push
│   │   │
│   │   ├── produtor/                # Módulos especializados do Produtor
│   │   │   ├── saldos/SaldosProdutor.tsx
│   │   │   ├── extrato/ExtratoProdutor.tsx
│   │   │   ├── borderos/BorderosProdutor.tsx
│   │   │   ├── dados-bancarios/DadosBancariosProdutor.tsx
│   │   │   └── menuProdutor.ts
│   │   │
│   │   ├── financeiro/              # Módulos especializados do Financeiro Disk
│   │   │   ├── aprovacoes/CentralAprovacoes.tsx
│   │   │   ├── produtores/ProdutoresFinanceiro.tsx
│   │   │   ├── gateways/GatewaysFinanceiro.tsx
│   │   │   ├── ledger/LedgerFinanceiro.tsx
│   │   │   ├── tesouraria/TesourariaFinanceiro.tsx
│   │   │   └── menuFinanceiro.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts               # Cliente HTTP com interceptors e segurança 403
│   │   │   ├── auth.service.ts
│   │   │   ├── repasse.service.ts
│   │   │   ├── antecipacao.service.ts
│   │   │   ├── bordero.service.ts
│   │   │   ├── assinatura.service.ts
│   │   │   ├── produtor.service.ts
│   │   │   └── financeiro.service.ts
│   │   │
│   │   ├── types/index.ts           # Definições de tipos TypeScript compartilhadas
│   │   ├── utils/formatters.ts      # Formatadores BRL, datas e status pt-BR
│   │   └── main.tsx
│   │
│   └── package.json
│
├── backend/                      # NODE.JS + TYPESCRIPT + EXPRESS + PRISMA
│   ├── src/
│   │   ├── auth/                    # auth.middleware.ts, auth.service.ts
│   │   ├── usuarios/                # usuarios.controller.ts
│   │   ├── produtores/              # produtores.controller.ts
│   │   ├── eventos/                 # eventos.controller.ts
│   │   ├── vendas/                  # vendas.controller.ts
│   │   ├── pagamentos/              # pagamentos.controller.ts
│   │   ├── saldos/                  # saldos.controller.ts
│   │   ├── recebiveis/              # recebiveis.controller.ts
│   │   ├── ledger/                  # ledger.controller.ts
│   │   ├── solicitacoes/            # solicitacoes.controller.ts
│   │   ├── repasses/                # repasses.controller.ts
│   │   ├── antecipacoes/            # antecipacoes.controller.ts
│   │   ├── borderos/                # borderos.controller.ts
│   │   ├── aprovacoes/              # aprovacoes.controller.ts
│   │   ├── assinaturas/             # assinaturas.controller.ts
│   │   ├── taxas/                   # taxas.controller.ts
│   │   ├── gateways/                # gateways.controller.ts
│   │   ├── conciliacao/             # conciliacao.controller.ts
│   │   ├── notificacoes/            # notificacoes.controller.ts
│   │   ├── auditoria/               # auditoria.controller.ts
│   │   ├── relatorios/              # relatorios.controller.ts
│   │   ├── workflow/workflow.engine.ts # Máquina de estados do Core Financeiro
│   │   ├── app.ts                   # Rotas Express e endpoints REST
│   │   ├── server.ts                # Inicializador do servidor Node
│   │   └── types.ts
│   │
│   └── package.json
│
├── prisma/
│   ├── schema.prisma                # Modelos relacionais completos
│   └── seed.ts                      # 3 produtores, 8 eventos, adquirentes e usuários
│
├── index.html                       # Aplicação Web ao vivo estilo Limitless
├── server.js                        # Servidor HTTP estático nativo Node.js
├── tsconfig.json                    # Configuração TypeScript ES2022 + JSX
├── package.json
└── README.md
```

---

### 4. Cenário Principal da Demonstração (Passo a Passo)

O fluxo principal está 100% calibrado e interconectado de ponta a ponta:

1. **Login como Produtor:**
   - Acesse [http://localhost:3000](http://localhost:3000).
   - No alternador superior ou modal de login, selecione **Produtora ABC Ltda. (João Silva)**.
   - Navegue em **Saldos por Evento**: confira o evento **Festival Curitiba 2026** com saldo disponível inicial de **R$ 200.000,00**.
   - Clique em **Solicitar Repasse**, informe o valor de **R$ 80.000,00**, escolha a conta bancária homologada (Itaú) e clique em Enviar.
   - O saldo disponível é imediatamente reservado (passa para **R$ 120.000,00**) e a solicitação `#REP-000129` é criada com status `Aguardando análise`.

2. **Login no Financeiro Disk & Notificação:**
   - Alterne o perfil para **Financeiro Disk (Karine)**.
   - O sino de notificações no topo exibe alerta de nova solicitação de repasse da Produtora ABC.
   - Abra a **Central de Aprovações (17)** e localize a solicitação `#REP-000129`.
   - Clique em **Analisar Ficha →**:
     - Visualização completa: vendas apuradas (R$ 500k), líquido acumulado (R$ 450k), saldo disponível antes (R$ 200k), solicitado (R$ 80k) e saldo após (R$ 120k).
     - Checklist de conformidade e risco (BACEN/CIP e limite operacional).

3. **Decisão Operacional:**
   - Clique em **Aprovar & Gerar Termo**. O termo `#DOC-REP-XXXX` é gerado.
   - O status avança para `Aguardando assinatura do Produtor`.

4. **Regra de Assinatura Sequencial Rigorosa:**
   - Observe o botão da Disk: **`🔒 Assinatura Disk Bloqueada (Aguardando Produtor)`**.
   - Se o operador da Disk tentar assinar agora, o sistema bloqueia:
     > *"O Financeiro Disk é sempre o último signatário. O documento deve ser assinado primeiro pelo Produtor no login dele."*
   - Clique em **⚡ Simular Assinatura do Produtor** (ou assine no login do produtor).
   - O status avança para `Aguardando assinatura Financeiro Disk` e o botão da Disk se desbloqueia: **`Assinar Documento Agora (Financeiro Disk)`**.
   - A Disk assina por último: status avança para `Documento assinado`.

5. **Liquidação Financeira & Ledger:**
   - O botão **`Executar Pagamento / Transferência (PIX)`** fica liberado.
   - Clique no botão: a transferência PIX é disparada gerando autenticação bancária.
   - O status avança para **`Pago`**.
   - O **Ledger** registra imediatamente o lançamento contábil em partidas dobradas:
     - **Débito:** *Passivo: Obrigações com Produtores (Produtora ABC)* — R$ 80.000,00
     - **Crédito:** *Ativo: Conta Movimento Banco Itaú (Disk Ingressos)* — R$ 80.000,00
   - No login do Produtor, o status exibe **`PAGO`** e o saldo disponível permanece confirmado em **R$ 120.000,00**.

6. **Cenário de Rejeição Formal:**
   - Em qualquer solicitação pendente, clique em **Rejeitar Solicitação**.
   - Selecione a categoria obrigatória (ex: *Inconsistência nos Dados Bancários*) e insira a justificativa.
   - Ao confirmar, o status passa para **`Rejeitado`**, o Produtor é notificado do motivo e os fundos reservados são automaticamente devolvidos ao saldo disponível do evento.

---

### 5. Cenário de Antecipação de Recebíveis

Separado de Repasse, com cálculo automático:
- **Recebíveis Futuros (D+30):** R$ 100.000,00
- **Valor Solicitado:** R$ 50.000,00
- **Taxa de Antecipação Contratual:** 2,0% (R$ 1.000,00)
- **Valor Líquido Creditado:** R$ 49.000,00
- Mesma esteira jurídica: Análise → Aprovação → Produtor assina 1º → Disk assina por último → Liquidação → Ledger.

---

### 6. Ferramentas da Barra de Demonstração Flutuante

No rodapé da tela, a barra interativa permite a qualquer momento:
- `+ Venda Cartão`: injeta transação com MDR de 2,15% e gera recebível futuro.
- `+ Venda PIX`: injeta transação direta D+0 com saldo imediato.
- `+ Chargeback`: simula contestação de operadora debitando garantia.
- `Restaurar Dados da Demo`: retorna todo o banco de dados fictício ao estado inicial.
