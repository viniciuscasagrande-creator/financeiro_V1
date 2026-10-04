# RH Disk V1 + Disk Ponto (Ecossistema Operacional Completo)
## Fase 4 — Gestão Completa de Ponto e Jornada

Módulo corporativo de Recursos Humanos da **DiskIngressos** integrado ao aplicativo móvel **Disk Ponto** (Android APK) para registro de jornada com geofencing (cerca virtual), banco de horas, espelho de ponto, fechamento mensal com bloqueio de segurança e conformidade integral com a **Portaria 671/2021 do MTE** e **LGPD**.

---

## 🏛️ Arquitetura do Monorepo

```
RH_DISK_V1/
├── apps/
│   ├── web/          # Painel Web RH Operacional (React 18 + TypeScript + Vite)
│   ├── api/          # Backend Core RH REST API (Node.js + Express + Prisma)
│   └── mobile/       # Aplicativo Android Disk Ponto (React Native + Expo SDK 51)
├── packages/
│   └── shared/       # DTOs, Enums e Tipos TypeScript compartilhados
├── prisma/
│   ├── schema.prisma # Modelagem relacional PostgreSQL (Banco de Horas, Fechamento, Dispositivos)
│   └── seed.ts       # Semeador completo com jornadas, escalas, bancos de horas e fechamentos
├── tests/
│   └── fluxo-operacional-rh.test.mjs # Suíte de 19 testes automatizados ponta a ponta (100% aprovada)
├── docker-compose.yml# Banco PostgreSQL 16 Alpine pronto para execução
└── .env.example      # Variáveis de ambiente configuradas
```

---

## 🚀 Novidades e Entregas da Fase 4

1. **Cadastros Administrativos Completos:**
   - **Colaboradores:** Gestão de centros de custo (`centroCusto`), carga horária semanal (`cargaHorariaSemanal`), gestor responsável (`gestorId`) e dados bancários/PIX.
   - **Jornadas de Trabalho:** Carga prevista em minutos (`cargaMinutos`, ex: 480m) e tolerância regulamentar (`toleranciaMinutos`).
   - **Locais & Geofences:** Gestão de coordenadas e raio em metros para Sede Disk e Arenas de Shows (*Ligga Arena*, *Pedreira Paulo Leminski*, *Teatro Positivo*).
   - **Escalas Operacionais:** Vínculo de integridade fechado: **Colaborador → Escala → Local/Evento → Ponto → Banco de Horas → Fechamento**.

2. **Monitor Diário de Ponto (Tempo Real):**
   - Acompanhamento dos colaboradores em tempo real: *Trabalhando*, *Em Intervalo*, *Para Analisar (fora do raio ou Mock GPS)* e *Sem Marcação*.
   - Exibição de precisão de satélite (ex: $\pm 5m$) e distância métrica do centro da cerca.

3. **Banco de Horas e Horas Extras:**
   - Endpoint `POST /api/banco-horas/recalcular/:colaboradorId` apura as batidas da competência vs carga prevista das escalas.
   - Cálculo automático de saldo positivo/negativo, minutos de horas extras e débitos.

4. **Espelho de Ponto Individual:**
   - Consulta consolidada por colaborador e competência (`GET /api/ponto/espelho/:colaboradorId?competencia=YYYY-MM`).
   - Apresentação diária: Entrada, Início de Intervalo, Fim de Intervalo, Saída, Horas Trabalhadas e Ocorrências.

5. **Fechamento Mensal com Bloqueio de Segurança:**
   - **Regra Fundamental de Proteção:** Não permite fechar ou homologar a competência mensal enquanto existirem ajustes de ponto pendentes de análise (`Status: PENDENTE`).
   - Retorna erro HTTP `409 Conflict` bloqueando a operação e orientando o gestor.
   - Após regularização, transiciona com sucesso para o status `FECHADO` gravando auditoria.

6. **Gestão de Dispositivos Móveis (Disk Ponto):**
   - Registro de aparelhos utilizados pelos colaboradores com plataforma e identificador único.
   - Ciclo de vida: `PENDENTE` $\rightarrow$ `AUTORIZADO` $\rightarrow$ `BLOQUEADO`.

7. **Trilha Imutável de Auditoria (Portaria 671 MTE & LGPD):**
   - Registro cronológico imutável de todas as batidas, cadastros, alterações de escala, homologações de ajustes e fechamentos mensais.

---

## 📱 Geração do APK Android (Disk Ponto)

O app está configurado com `package: com.diskingressos.ponto` no `apps/mobile/app.json`.

### Pré-requisitos:
- Node.js 18+ instalado
- EAS CLI instalado globalmente: `npm install -g eas-cli`

### Passo a Passo para Gerar o APK:
1. Acesse o diretório do app móvel:
   ```bash
   cd apps/mobile
   npm install
   ```
2. Inicie o build para gerar o arquivo `.apk` diretamente para Android:
   ```bash
   npm run build:apk
   # ou: eas build -p android --profile preview
   ```
3. Para gerar o pacote `.aab` da Google Play Store:
   ```bash
   npm run build:aab
   ```

---

## 🖥️ Execução Local dos Módulos

### 1. Iniciar Banco PostgreSQL (Opcional - a API conta com modo resiliente em memória):
```bash
docker compose up -d
npm run prisma:migrate
npm run seed
```

### 2. Backend REST API:
```bash
npm run dev:api
# Servidor rodando na porta 3333
```

### 3. Painel Web RH:
```bash
npm run dev:web
# Painel acessível em: http://localhost:5173
```

---

## 🧪 Testes Automatizados

### Testes do RH Disk V1 (Fase 4):
```bash
node tests/fluxo-operacional-rh.test.mjs
```
Resultado: **19/19 testes aprovados (100%)**.

### Suíte Geral Integrada (Módulo Financeiro + RH Disk):
```bash
npm test
```
Resultado: **106/106 testes aprovados (100%)**.

---

## 🔮 Próxima Etapa: Fase 5 (Recursos Humanos Estratégico)
- **Férias e Ausências:** Gestão de períodos aquisitivos, concessivos e abono pecuniário.
- **Atestados e Afastamentos:** Submissão com upload de comprovante e validação médica.
- **Admissão e Onboarding Digital:** Fluxo guiado de coleta documental de novos colaboradores.
- **Gestão de Documentos:** Armazenamento seguro e assinatura digital de termos e contratos.
- **Benefícios:** Gestão de Vale Transporte, Vale Refeição/Alimentação e Planos de Saúde.
- **Portal do Colaborador:** Autoatendimento integrado a Ponto, Férias e Holerites.
