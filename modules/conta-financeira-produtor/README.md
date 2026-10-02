# Conta Financeira do Produtor — V0.2 (Homologação PDT Novo)

Módulo contábil e financeiro unificado desenvolvido para a **Disk Ingressos**, estruturado em torno da **Conta Financeira Interna Vinculada ao CNPJ do Produtor** e preparado para homologação e posterior incorporação ao **PDT Novo** (`pdtnovo.diskingressos.com.br`).

---

## 1. Fundamentos Arquiteturais

### 1.1 Conta Financeira Vinculada ao CNPJ (Sem Apresentação como "Banco")
A Disk Ingressos opera controles estritos de **conta corrente financeira interna** dentro do seu ledger, enquanto as movimentações bancárias reais ocorrem nas contas e gateways correspondentes.
- Cada produtor possui uma conta mestra identificada por seu **CNPJ**.
- A conta mestra consolida os saldos e mantém a segregação contábil rigorosa de **cada evento individual**.
- O ledger identifica a origem de cada centavo:
  $$\text{Saldo Anterior} + \text{Créditos} - \text{Débitos} = \text{Saldo Atual}$$

### 1.2 Estrutura Canônica dos 5 Saldos
```text
CONTA FINANCEIRA DO PRODUTOR
CNPJ: 14.829.301/0001-92

Saldo Consolidado                         R$ 680.000
├─ Disponível para Repasse               R$ 310.000
├─ A Liberar (Vendas < 50%)              R$ 250.000
├─ Bloqueado Cautelar                     R$ 70.000
├─ Retido Administrativo                  R$ 50.000
└─ Créditos/Antecipações em Aberto        R$ 120.000

EVENTOS VINCULADOS
├─ Festival Curitiba 2026                 R$ 320.000
├─ Arena Verão 2026                       R$ 210.000
└─ Show Especial Teatro                   R$ 150.000
```

### 1.3 Imutabilidade do Ledger & Proibição de "Editar Saldo"
Nenhuma tela ou usuário pode "editar saldo" diretamente. Toda e qualquer alteração financeira decorre de lançamentos auditados:
- `CREDITO_CONCEDIDO`: Injeção de capital com taxa de juros e parcelamento.
- `AMORTIZACAO_CREDITO`: Abatimento de dívida (fixa ou percentual sobre a bilheteria).
- `BLOQUEIO` / `RETENCAO`: Travas cautelares com justificativa obrigatória ($\ge 5$ caracteres).
- `LIBERACAO`: Devolução de saldo bloqueado com motivo formal.
- `REPASSE`: Saída liquidada via PIX/TED na Tesouraria.

---

## 2. Créditos e Antecipações ao Produtor

O produtor pode contratar capital antes do evento gerar caixa suficiente.

### Parâmetros do Contrato:
- **Principal (R$)**: Valor liberado ao produtor.
- **Taxa de Juros (% a.m.)**: Juros acordados.
- **Quantidade de Parcelas**: Prazo do contrato.
- **Modelos de Amortização**:
  1. **Parcelas Fixas**: Abatimento programado em datas fixas.
  2. **Percentual sobre Recebíveis**: Enquanto houver dívida ativa, um percentual (ex: $15\%$) de cada receita líquida do evento é retido automaticamente para amortizar o crédito conforme as vendas entram.
  3. **Liquidação no Fechamento do Evento**: Quitado no acerto do borderô final.

---

## 3. Integração com a Regra de Repasse (50% → 20%)

O motor de repasse consulta primeiro a Conta Financeira:
$$\text{Disponível para Repasse} = (\text{Vendas Realizadas} \times \%_{\text{liberado}}) - \text{Bloqueios} - \text{Retenções} - \text{Amortizações de Crédito} - \text{Repasses Anteriores}$$

---

## 4. Esteira Operacional Ponta a Ponta
$$\text{Solicitação} \longrightarrow \text{Análise Financeiro Disk} \longrightarrow \text{Assinatura Produtor} \longrightarrow \text{Assinatura Disk} \longrightarrow \text{Liquidação Tesouraria PIX}$$

- **Segregação de Funções (SoD)**: Quem aprovou o repasse não pode liquidar o pagamento na tesouraria.
- **Ordem Estrita**: O Produtor deve assinar digitalmente antes da Disk Ingressos.

---

## 5. Como Executar

```bash
cd modules/conta-financeira-produtor
npm run install:all
npm run dev
```

- **Frontend (Vite / React)**: `http://localhost:5173`
- **Backend API (Node / Express)**: `http://localhost:3333`
