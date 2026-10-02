# Financeiro Disk — Conta Financeira Interna V0.4 (Operacional)

Módulo contábil e financeiro unificado desenvolvido para a **Disk Ingressos**, estruturado em torno da **Conta Financeira de Controle Interno Vinculada ao CNPJ do Produtor** e preparado para homologação e posterior incorporação ao **PDT Novo** (`pdtnovo.diskingressos.com.br`).

---

## 1. Acesso & Isolamento Arquitetural Estrito

Todo o núcleo desta aplicação é de **uso exclusivo do perfil FINANCEIRO_DISK**.
O Produtor não visualiza reservas internas, retenções, agenda de obrigações, concessão de crédito, critérios internos de risco, fila administrativa de estornos ou ledger interno — ele enxerga exclusivamente seus números operacionais líquidos auditados.

---

## 2. Domínios Consolidados na V0.4 Operacional

A V0.4 organiza as telas em 6 domínios totalmente operacionais, com formulários, modais e ações em tempo real:

1. **Conta Interna (Saldos & Elegibilidade por Evento)**:
   - Consolidação por CNPJ nos 5 pilares canônicos de saldo.
   - Detalhamento por evento com aplicação da regra canônica:
     $$\text{Disponível} = (\text{Vendas} \times 20\%) - \text{Repasses Anteriores} - \text{Retenções} - \text{Obrigações Reservadas} - \text{Estornos Pendentes/Efetivados} - \text{Amortizações}$$
   - **Visualizar Toda a Movimentação do Evento (Drilldown)**: Modal completo que reúne resumo da fórmula de repasse, obrigações específicas, estornos do pedido, contratos de crédito e extrato exclusivo do ledger daquele evento.
   - Solicitação de repasse com validação automática contra o limite elegível.

2. **Reservas e Retenções**:
   - Modal para criar nova retenção cautelar ou bloqueio operacional com favorecido e justificativa ($\ge 5$ caracteres).
   - Tabela de retenções ativas com ação de **Liberar Saldo**, exigindo motivo formal e gerando lançamento de `LIBERACAO` no Ledger.

3. **Agenda de Obrigações do Evento**:
   - Modal para programar obrigações por categoria: `ALUGUEL_ESPACO` (teatros/arenas), `ECAD` (direitos autorais), `FORNECEDOR` (palco, som, iluminação), `OPERACIONAL` (segurança, brigada) e `OUTROS`.
   - Transições de status: `PREVISTO` $\to$ `RESERVADO` $\to$ `RETIDO` $\to$ `LIQUIDADO`.
   - Ação de **Liquidar Pagamento**: Registra baixa contábil definitiva e liberação no Ledger.

4. **Créditos e Antecipações ao Produtor**:
   - Modal para concessão de crédito com valor principal, taxa de juros (% a.m.), quantidade de parcelas e modelo de amortização (`PARCELAS_FIXAS` ou `PERCENTUAL_RECEBIVEIS`).
   - Ações operacionais: **Abater Parcela** e **Simular Venda com Retenção (15%)** para demonstrar amortização automática retida na bilheteria.

5. **Fila de Estornos com Reserva Imediata e Dupla Autorização Estrita (SoD)**:
   - Ao iniciar um estorno, o valor é **imediatamente retido** (`RESERVA_ESTORNO`), deduzindo da base de repasse para evitar saques indevidos.
   - **Segregação de Funções Obrigatória (SoD)**: O mesmo usuário NÃO pode conceder a 1ª e a 2ª autorização (bloqueio rígido no backend e frontend).
   - Simulador de Operador Ativo no topo para alternar operadores durante testes (`Karine Mendes`, `Carlos Eduardo`, `Mariana Costa`).
   - Efetivação bloqueada até que existam duas autorizações distintas com registro de MFA.

6. **Extrato Imutável do Ledger**:
   - Livro-razão contábil com partidas dobradas.
   - Invariante rigorosa:
     $$\text{Saldo Anterior} + \text{Créditos} - \text{Débitos} = \text{Saldo Atual}$$
   - Filtros operacionais por Evento e por Tipo de Lançamento.

---

## 3. Como Executar

```bash
cd modules/conta-financeira-produtor
npm run install:all
npm run dev
```

- **Backend API**: `http://localhost:3333`
- **Frontend Vite**: `http://localhost:5173`

---

## 4. Integração com o PDT Novo

O arquivo `backend/src/adapters/pdtNovoAdapter.js` permanece como fronteira oficial para plugar os dados reais de produtores, eventos, bilheteria, gateways e autenticação JWT/MFA do PDT Novo durante a homologação.
