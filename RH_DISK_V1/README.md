# RH Disk V1 + Disk Ponto (Ecossistema Operacional Completo)

Módulo corporativo de Recursos Humanos da **DiskIngressos** integrado ao aplicativo móvel **Disk Ponto** (Android APK) para registro de jornada com geofencing (cerca virtual) e conformidade integral com a **Portaria 671/2021 do MTE** e **LGPD**.

---

## 🏛️ Arquitetura do Monorepo

```
RH_DISK_V1/
├── apps/
│   ├── web/        # Painel Web RH Operacional (React 18 + TypeScript + Vite)
│   ├── api/        # Backend Core RH REST API (Node.js + Express + Prisma)
│   └── mobile/     # Aplicativo Android Disk Ponto (React Native + Expo SDK 51)
├── packages/
│   └── shared/     # DTOs, Enums e Tipos TypeScript compartilhados
├── prisma/
│   └── schema.prisma # Modelagem relacional PostgreSQL com auditoria e NSR
└── tests/
    └── fluxo-operacional-rh.test.mjs # Suíte de testes automatizados E2E (11 etapas)
```

---

## 🔄 Fluxo Operacional Fechado (End-to-End)

1. **Cadastrar Colaborador**: RH cadastra colaborador com CPF, e-mail, cargo, departamento e perfil de acesso. Matrícula sequencial (`DISK-XXXXX`) é gerada automaticamente.
2. **Cadastrar Local e Geofence**: Cadastro da sede ou arenas/locais de eventos (ex: *Ligga Arena*, *Pedreira Paulo Leminski*) com latitude, longitude e raio de tolerância em metros.
3. **Definir Jornada de Trabalho**: Criação de modelos de carga horária (ex: 44h semanais, 12x36 ou turno de evento).
4. **Planejar Escala Operacional**: Vinculação entre o colaborador, a jornada definida, o local autorizado com cerca virtual e a data de vigência.
5. **Autenticação no Disk Ponto**: Colaborador efetua login seguro no aplicativo móvel usando Matrícula ou E-mail.
6. **Captura Pontual de GPS**: A localização é consultada **estritamente no milissegundo em que o botão 'Registrar Ponto' é acionado** (sem rastreamento permanente em segundo plano, respeitando a privacidade e LGPD).
7. **Validação de Geofence (Haversine)**: O backend calcula a distância exata em metros entre as coordenadas do GPS e o centro da cerca virtual da escala:
   - Se distância $\le$ raio cadastrado $\rightarrow$ Status: `VALIDADA`.
   - Se distância $>$ raio cadastrado $\rightarrow$ Status: `FORA_DA_AREA` (com alerta de divergência gravado).
8. **Comprovante Digital (Portaria 671 MTE)**: Registro imutável gerando Número Sequencial de Registro (**NSR**) e hash criptográfico SHA-256 para cada batida.
9. **Monitoramento em Tempo Real no RH**: O Painel Web do RH reflete imediatamente as marcações, status, mapa de precisão e inconsistências.
10. **Solicitação e Aprovação de Ajustes**: O colaborador pode solicitar ajuste/justificativa pelo app. O gestor analisa e aprova/rejeita no painel RH respeitando Segregação de Funções (**SoD**).
11. **Trilha Imutável de Auditoria**: Qualquer alteração, inclusão ou homologação é gravada na tabela `Auditoria` com autor, IP, timestamp e payload antes/depois.

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
2. Faça login na conta Expo:
   ```bash
   eas login
   ```
3. Inicie o build na nuvem para gerar o arquivo `.apk` diretamente para instalação em dispositivos Android:
   ```bash
   eas build -p android --profile preview
   ```
4. Ao finalizar o processo, o EAS fornecerá o link direto para download do `.apk` pronto para distribuição interna aos colaboradores.

### Execução em Modo de Desenvolvimento / Emulador Android:
```bash
npx expo run:android
# ou
npx expo start
```

---

## 🖥️ Execução Local dos Módulos

### 1. Backend API:
```bash
cd apps/api
npm install
npm run dev
# Servidor rodando na porta 3001
```

### 2. Painel Web RH:
```bash
cd apps/web
npm install
npm run dev
# Acesso via browser: http://localhost:5173
```

---

## 🧪 Testes Automatizados

Para executar o teste ponta a ponta que valida os 11 passos do fluxo:
```bash
node tests/fluxo-operacional-rh.test.mjs
```
Resultado esperado:
```
✓ 1. Colaborador cadastrado com sucesso
✓ 2. Local cadastrado com cerca virtual
✓ 3. Jornada de trabalho criada
✓ 4. Escala criada vinculando Colaborador + Jornada + Cerca da Arena
✓ 5. Login no Disk Ponto autenticado com sucesso via Matrícula
✓ 6. Batida com GPS dentro da geofence gravada como VALIDADA
✓ 7. Batida fora do raio gravada e interceptada como FORA_DA_AREA
✓ 8. Painel RH lista e reflete todas as batidas em tempo real com status e geofence
✓ 9. Colaborador submete solicitação de ajuste de ponto
✓ 10. Gestor de RH aprova o ajuste de ponto com SoD respeitada
✓ 11. Trilha imutável de auditoria registra todas as mutações e operações de dados
--- TODOS OS 11 TESTES DO FLUXO OPERACIONAL DO RH DISK FORAM APROVADOS! (100%) ---
```
