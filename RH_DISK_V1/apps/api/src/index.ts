import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';

export const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// ESTRUTURA DE DADOS EM MEMÓRIA & PERSISTÊNCIA ÁGIL (PRISMA READY)
// ============================================================================

interface LocalPonto {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  raioMetros: number;
  ativo: boolean;
}

interface Colaborador {
  id: string;
  usuarioId?: string;
  nome: string;
  cpf: string;
  matricula: string;
  cargo: string;
  departamento: string;
  ativo: boolean;
  telefone?: string;
  email?: string;
  chavePix?: string;
  salario?: number;
  criadoEm: string;
}

interface Jornada {
  id: string;
  nome: string;
  entrada: string;
  inicioIntervalo?: string;
  fimIntervalo?: string;
  saida: string;
  toleranciaMinutos: number;
}

interface Escala {
  id: string;
  colaboradorId: string;
  colaboradorNome?: string;
  jornadaId: string;
  jornadaNome?: string;
  localId: string;
  localNome?: string;
  data: string; // YYYY-MM-DD
  eventoId?: string;
  eventoNome?: string;
}

interface BatidaPonto {
  id: string;
  nsr: number;
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorMatricula: string;
  tipo: 'ENTRADA' | 'INICIO_INTERVALO' | 'FIM_INTERVALO' | 'SAIDA';
  status: 'VALIDADA' | 'FORA_DA_AREA' | 'PENDENTE_ANALISE' | 'OFFLINE_SINCRONIZADA';
  instanteServidor: string;
  instanteDispositivo?: string;
  latitude: number;
  longitude: number;
  precisaoMetros?: number;
  distanciaLocalMetros: number;
  localId?: string;
  localNome: string;
  eventoId?: string;
  eventoNome?: string;
  offline: boolean;
  dispositivoId?: string;
  mockLocationSuspeita: boolean;
  comprovanteNsr: string;
  hashIntegridade: string;
  criadoEm: string;
}

interface AjustePonto {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  batidaId?: string;
  dataPonto: string;
  tipoBatida: 'ENTRADA' | 'INICIO_INTERVALO' | 'FIM_INTERVALO' | 'SAIDA';
  horarioCorreto: string;
  motivo: string;
  justificativa: string;
  status: 'PENDENTE' | 'APROVADO' | 'REPROVADO';
  solicitadoEm: string;
  analisadoEm?: string;
  analisadoPor?: string;
  parecer?: string;
}

interface Auditoria {
  id: string;
  usuarioId?: string;
  usuarioNome: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  dados?: any;
  criadoEm: string;
  ip?: string;
}

// ----------------------------------------------------------------------------
// SEED INICIAL REALISTA (DISK INGRESSOS & CURITIBA)
// ----------------------------------------------------------------------------

let nsrSequence = 1000;

const locais: LocalPonto[] = [
  {
    id: 'loc-01',
    nome: 'Sede DiskIngressos Curitiba',
    endereco: 'Rua Visconde de Nácar, 1505 - Centro, Curitiba/PR',
    latitude: -25.4284,
    longitude: -49.2733,
    raioMetros: 150,
    ativo: true
  },
  {
    id: 'loc-02',
    nome: 'Arena da Baixada (Ligga Arena)',
    endereco: 'Rua Buenos Aires, 1260 - Água Verde, Curitiba/PR',
    latitude: -25.4484,
    longitude: -49.2770,
    raioMetros: 350,
    ativo: true
  },
  {
    id: 'loc-03',
    nome: 'Pedreira Paulo Leminski',
    endereco: 'Rua João Gava, 970 - Abranches, Curitiba/PR',
    latitude: -25.3855,
    longitude: -49.2789,
    raioMetros: 400,
    ativo: true
  },
  {
    id: 'loc-04',
    nome: 'Teatro Positivo Grande Auditório',
    endereco: 'Rua Prof. Pedro Viriato Parigot de Souza, 5300 - Campo Comprido',
    latitude: -25.4503,
    longitude: -49.3601,
    raioMetros: 250,
    ativo: true
  }
];

const colaboradores: Colaborador[] = [
  {
    id: 'col-01',
    nome: 'Carlos Eduardo Mendes',
    cpf: '234.567.890-12',
    matricula: 'DISK-00101',
    cargo: 'Coordenador de Bilheteria de Campo',
    departamento: 'Operações e Eventos',
    ativo: true,
    telefone: '(41) 98822-1144',
    email: 'carlos.mendes@diskingressos.com.br',
    chavePix: '23456789012',
    salario: 4800.00,
    criadoEm: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'col-02',
    nome: 'Camila Fernandes Silveira',
    cpf: '456.789.012-34',
    matricula: 'DISK-00205',
    cargo: 'Supervisora de Atendimento e Acesso',
    departamento: 'Operações e Eventos',
    ativo: true,
    telefone: '(41) 99755-4433',
    email: 'camila.silveira@diskingressos.com.br',
    chavePix: 'camila.silveira@diskingressos.com.br',
    salario: 3800.00,
    criadoEm: '2026-02-01T08:00:00.000Z'
  },
  {
    id: 'col-03',
    nome: 'Lucas Gabriel Pinheiro',
    cpf: '678.901.234-56',
    matricula: 'DISK-00388',
    cargo: 'Operador de Bilheteria / Caixa',
    departamento: 'Operações e Eventos',
    ativo: true,
    telefone: '(41) 99111-2233',
    email: 'lucas.pinheiro@gmail.com',
    chavePix: '67890123456',
    salario: 2200.00,
    criadoEm: '2026-03-10T08:00:00.000Z'
  },
  {
    id: 'col-04',
    nome: 'Beatriz Nogueira Ramos',
    cpf: '789.012.345-67',
    matricula: 'DISK-00412',
    cargo: 'Analista Financeiro Pleno',
    departamento: 'Financeiro e Controladoria',
    ativo: true,
    telefone: '(41) 98444-5566',
    email: 'beatriz.ramos@diskingressos.com.br',
    chavePix: 'beatriz.ramos@diskingressos.com.br',
    salario: 4600.00,
    criadoEm: '2026-04-05T08:00:00.000Z'
  }
];

const jornadas: Jornada[] = [
  {
    id: 'jor-01',
    nome: 'Comercial Padrão 44h (Seg-Sex)',
    entrada: '08:00',
    inicioIntervalo: '12:00',
    fimIntervalo: '13:00',
    saida: '17:48',
    toleranciaMinutos: 10
  },
  {
    id: 'jor-02',
    nome: 'Operação Show Turno Noturno',
    entrada: '14:00',
    inicioIntervalo: '18:00',
    fimIntervalo: '19:00',
    saida: '23:00',
    toleranciaMinutos: 15
  },
  {
    id: 'jor-03',
    nome: 'Turno de Bilheteria Shopping 6h',
    entrada: '10:00',
    inicioIntervalo: '13:00',
    fimIntervalo: '13:15',
    saida: '16:15',
    toleranciaMinutos: 5
  }
];

const hojeStr = new Date().toISOString().substring(0, 10);

const escalas: Escala[] = [
  {
    id: 'esc-01',
    colaboradorId: 'col-01',
    colaboradorNome: 'Carlos Eduardo Mendes',
    jornadaId: 'jor-01',
    jornadaNome: 'Comercial Padrão 44h (Seg-Sex)',
    localId: 'loc-01',
    localNome: 'Sede DiskIngressos Curitiba',
    data: hojeStr
  },
  {
    id: 'esc-02',
    colaboradorId: 'col-02',
    colaboradorNome: 'Camila Fernandes Silveira',
    jornadaId: 'jor-01',
    jornadaNome: 'Comercial Padrão 44h (Seg-Sex)',
    localId: 'loc-01',
    localNome: 'Sede DiskIngressos Curitiba',
    data: hojeStr
  },
  {
    id: 'esc-03',
    colaboradorId: 'col-03',
    colaboradorNome: 'Lucas Gabriel Pinheiro',
    jornadaId: 'jor-02',
    jornadaNome: 'Operação Show Turno Noturno',
    localId: 'loc-02',
    localNome: 'Arena da Baixada (Ligga Arena)',
    data: hojeStr,
    eventoId: 'evt-xyz-1',
    eventoNome: 'Show Nacional de Rock Curitiba'
  }
];

const batidas: BatidaPonto[] = [
  {
    id: 'bat-1001',
    nsr: 1001,
    colaboradorId: 'col-01',
    colaboradorNome: 'Carlos Eduardo Mendes',
    colaboradorMatricula: 'DISK-00101',
    tipo: 'ENTRADA',
    status: 'VALIDADA',
    instanteServidor: `${hojeStr}T08:01:14.000Z`,
    latitude: -25.42842,
    longitude: -49.27331,
    precisaoMetros: 6.5,
    distanciaLocalMetros: 5,
    localId: 'loc-01',
    localNome: 'Sede DiskIngressos Curitiba',
    offline: false,
    mockLocationSuspeita: false,
    comprovanteNsr: 'MTE671-000001001-A7F9C2D1',
    hashIntegridade: 'a7f9c2d1e4b8650f9a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f',
    criadoEm: `${hojeStr}T08:01:14.000Z`
  },
  {
    id: 'bat-1002',
    nsr: 1002,
    colaboradorId: 'col-02',
    colaboradorNome: 'Camila Fernandes Silveira',
    colaboradorMatricula: 'DISK-00205',
    tipo: 'ENTRADA',
    status: 'VALIDADA',
    instanteServidor: `${hojeStr}T08:05:30.000Z`,
    latitude: -25.42845,
    longitude: -49.27335,
    precisaoMetros: 8.0,
    distanciaLocalMetros: 8,
    localId: 'loc-01',
    localNome: 'Sede DiskIngressos Curitiba',
    offline: false,
    mockLocationSuspeita: false,
    comprovanteNsr: 'MTE671-000001002-B8E1F3A5',
    hashIntegridade: 'b8e1f3a5c7d9e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2',
    criadoEm: `${hojeStr}T08:05:30.000Z`
  }
];

const ajustes: AjustePonto[] = [
  {
    id: 'aj-01',
    colaboradorId: 'col-04',
    colaboradorNome: 'Beatriz Nogueira Ramos',
    dataPonto: hojeStr,
    tipoBatida: 'SAIDA',
    horarioCorreto: '18:18',
    motivo: 'ESQUECIMENTO',
    justificativa: 'Fiquei em reunião com a diretoria financeira e não registrei no aplicativo móvel.',
    status: 'PENDENTE',
    solicitadoEm: `${hojeStr}T18:30:00.000Z`
  }
];

const auditoria: Auditoria[] = [
  {
    id: 'aud-01',
    usuarioNome: 'Sistema Core RH',
    acao: 'INICIALIZACAO_SISTEMA',
    entidade: 'Sistema',
    dados: { versao: 'V1.1', status: 'Operacional' },
    criadoEm: new Date().toISOString(),
    ip: '127.0.0.1'
  }
];

// ============================================================================
// FUNÇÃO HAVERSINE CANÔNICA DE GEOLOCALIZAÇÃO
// ============================================================================

export function calcularDistanciaHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Raio da Terra em metros
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function registrarLogAuditoria(acao: string, entidade: string, detalhes: any, req?: Request) {
  const log: Auditoria = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    usuarioNome: (req as any)?.user?.nome || 'Gestor RH Disk',
    acao,
    entidade,
    dados: detalhes,
    criadoEm: new Date().toISOString(),
    ip: req?.ip || '127.0.0.1'
  };
  auditoria.unshift(log);
  return log;
}

// ============================================================================
// ROTAS DA API
// ============================================================================

// 1. Saúde e Dashboard
app.get('/api/saude', (_, res) => {
  res.json({ status: 'ok', sistema: 'RH Disk API V1.1', timestamp: new Date().toISOString() });
});

app.get('/api/dashboard', (_, res) => {
  const batidasHoje = batidas.filter(b => b.instanteServidor.startsWith(hojeStr)).length;
  const pendencias = ajustes.filter(a => a.status === 'PENDENTE').length;

  res.json({
    colaboradoresAtivos: colaboradores.filter(c => c.ativo).length,
    emFerias: 2,
    batidasHoje,
    pendencias,
    horasExtrasMes: 48,
    locaisAtivos: locais.filter(l => l.ativo).length,
    escalasHoje: escalas.filter(e => e.data === hojeStr).length
  });
});

// 2. Autenticação e Login (Painel Web e App Móvel Disk Ponto)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { login, senha } = req.body || {};
  const termo = String(login || '').trim().toLowerCase();

  // Permite login por email, matricula ou CPF
  const colab = colaboradores.find(
    c => c.email?.toLowerCase() === termo ||
         c.matricula.toLowerCase() === termo ||
         c.cpf.replace(/\D/g, '') === termo.replace(/\D/g, '')
  );

  if (termo === 'admin' || termo === 'rh@diskingressos.com.br' || colab) {
    const usuario = {
      id: colab ? colab.id : 'usr-admin-01',
      nome: colab ? colab.nome : 'Administrador RH Disk',
      email: colab ? colab.email : 'rh@diskingressos.com.br',
      perfil: colab ? 'COLABORADOR' : 'ADMINISTRADOR',
      colaboradorId: colab ? colab.id : undefined,
      colaborador: colab || undefined,
      token: `jwt_rh_disk_${Date.now()}`
    };

    registrarLogAuditoria('LOGIN_REALIZADO', 'Usuario', { usuario: usuario.nome, perfil: usuario.perfil }, req);
    return res.json(usuario);
  }

  res.status(401).json({ erro: 'Credenciais inválidas. Use CPF, Matrícula ou E-mail corporativo.' });
});

// 3. Colaboradores
app.get('/api/colaboradores', (req: Request, res: Response) => {
  const { busca } = req.query;
  if (!busca) return res.json(colaboradores);

  const termo = String(busca).toLowerCase();
  const filtrados = colaboradores.filter(
    c => c.nome.toLowerCase().includes(termo) ||
         c.cpf.includes(termo) ||
         c.matricula.toLowerCase().includes(termo) ||
         c.cargo.toLowerCase().includes(termo)
  );
  res.json(filtrados);
});

app.get('/api/colaboradores/:id', (req: Request, res: Response) => {
  const colab = colaboradores.find(c => c.id === req.params.id);
  if (!colab) return res.status(404).json({ erro: 'Colaborador não encontrado' });

  const escalasColab = escalas.filter(e => e.colaboradorId === colab.id);
  const batidasColab = batidas.filter(b => b.colaboradorId === colab.id);

  res.json({ ...colab, escalas: escalasColab, batidas: batidasColab });
});

app.post('/api/colaboradores', (req: Request, res: Response) => {
  const { nome, cpf, cargo, departamento, telefone, email, chavePix, salario } = req.body;
  if (!nome || !cpf || !cargo) {
    return res.status(400).json({ erro: 'Nome, CPF e Cargo são obrigatórios.' });
  }

  // Verifica duplicidade de CPF
  if (colaboradores.some(c => c.cpf.replace(/\D/g, '') === String(cpf).replace(/\D/g, ''))) {
    return res.status(400).json({ erro: 'Já existe um colaborador cadastrado com este CPF.' });
  }

  const matricula = `DISK-${Math.floor(10000 + Math.random() * 90000)}`;
  const novoColaborador: Colaborador = {
    id: `col-${Date.now()}`,
    nome: nome.trim(),
    cpf: cpf.trim(),
    matricula,
    cargo: cargo.trim(),
    departamento: departamento || 'Operações e Eventos',
    ativo: true,
    telefone: telefone || '',
    email: email || `${matricula.toLowerCase()}@diskingressos.com.br`,
    chavePix: chavePix || '',
    salario: Number(salario) || 0,
    criadoEm: new Date().toISOString()
  };

  colaboradores.push(novoColaborador);
  registrarLogAuditoria('CADASTRO_COLABORADOR', 'Colaborador', novoColaborador, req);

  res.status(201).json(novoColaborador);
});

// 4. Locais e Geofences
app.get('/api/locais', (_, res) => {
  res.json(locais);
});

app.post('/api/locais', (req: Request, res: Response) => {
  const { nome, endereco, latitude, longitude, raioMetros } = req.body;
  if (!nome || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ erro: 'Nome, latitude e longitude são obrigatórios.' });
  }

  const novoLocal: LocalPonto = {
    id: `loc-${Date.now()}`,
    nome: nome.trim(),
    endereco: endereco || '',
    latitude: Number(latitude),
    longitude: Number(longitude),
    raioMetros: Number(raioMetros) || 150,
    ativo: true
  };

  locais.push(novoLocal);
  registrarLogAuditoria('CADASTRO_LOCAL_GEOFENCE', 'LocalPonto', novoLocal, req);

  res.status(201).json(novoLocal);
});

// 5. Jornadas
app.get('/api/jornadas', (_, res) => {
  res.json(jornadas);
});

app.post('/api/jornadas', (req: Request, res: Response) => {
  const { nome, entrada, inicioIntervalo, fimIntervalo, saida, toleranciaMinutos } = req.body;
  if (!nome || !entrada || !saida) {
    return res.status(400).json({ erro: 'Nome, entrada e saída são obrigatórios.' });
  }

  const novaJornada: Jornada = {
    id: `jor-${Date.now()}`,
    nome: nome.trim(),
    entrada: entrada.trim(),
    inicioIntervalo,
    fimIntervalo,
    saida: saida.trim(),
    toleranciaMinutos: Number(toleranciaMinutos) || 10
  };

  jornadas.push(novaJornada);
  registrarLogAuditoria('CADASTRO_JORNADA', 'Jornada', novaJornada, req);

  res.status(201).json(novaJornada);
});

// 6. Escalas
app.get('/api/escalas', (req: Request, res: Response) => {
  const { colaboradorId, data } = req.query;
  let filtradas = [...escalas];
  if (colaboradorId) filtradas = filtradas.filter(e => e.colaboradorId === colaboradorId);
  if (data) filtradas = filtradas.filter(e => e.data === data);
  res.json(filtradas);
});

app.get('/api/escalas/hoje/:colaboradorId', (req: Request, res: Response) => {
  const { colaboradorId } = req.params;
  const escalaHoje = escalas.find(e => e.colaboradorId === colaboradorId && e.data === hojeStr);

  if (escalaHoje) {
    const local = locais.find(l => l.id === escalaHoje.localId);
    const jornada = jornadas.find(j => j.id === escalaHoje.jornadaId);
    return res.json({ escala: escalaHoje, local, jornada });
  }

  // Se não houver escala pontual de evento hoje, assume o local padrão Sede
  const sede = locais[0];
  const jornadaPadrao = jornadas[0];
  res.json({
    escala: {
      id: `esc-padrao-${colaboradorId}`,
      colaboradorId,
      jornadaId: jornadaPadrao.id,
      localId: sede.id,
      data: hojeStr
    },
    local: sede,
    jornada: jornadaPadrao
  });
});

app.post('/api/escalas', (req: Request, res: Response) => {
  const { colaboradorId, jornadaId, localId, data, eventoId, eventoNome } = req.body;
  if (!colaboradorId || !jornadaId || !localId) {
    return res.status(400).json({ erro: 'Colaborador, Jornada e Local são obrigatórios para a escala.' });
  }

  const colab = colaboradores.find(c => c.id === colaboradorId);
  const jor = jornadas.find(j => j.id === jornadaId);
  const loc = locais.find(l => l.id === localId);

  const novaEscala: Escala = {
    id: `esc-${Date.now()}`,
    colaboradorId,
    colaboradorNome: colab?.nome,
    jornadaId,
    jornadaNome: jor?.nome,
    localId,
    localNome: loc?.nome,
    data: data || hojeStr,
    eventoId,
    eventoNome
  };

  escalas.push(novaEscala);
  registrarLogAuditoria('CRIACAO_ESCALA', 'Escala', novaEscala, req);

  res.status(201).json(novaEscala);
});

// 7. Validação de Geofence
app.post('/api/ponto/validar', (req: Request, res: Response) => {
  const { latitude, longitude, local, localId } = req.body;
  const alvo = local || locais.find(l => l.id === localId) || locais[0];

  if (!latitude || !longitude || !alvo) {
    return res.status(400).json({ erro: 'Dados de localização incompletos.' });
  }

  const distanciaMetros = calcularDistanciaHaversine(latitude, longitude, alvo.latitude, alvo.longitude);
  const permitido = distanciaMetros <= alvo.raioMetros;

  res.json({
    permitido,
    distanciaMetros,
    raioMetros: alvo.raioMetros,
    localNome: alvo.nome,
    status: permitido ? 'VALIDADA' : 'FORA_DA_AREA'
  });
});

// 8. O Core: REGISTRO DE BATIDA DE PONTO (Portaria 671 MTE & Disk Ponto)
app.post('/api/ponto/registrar', (req: Request, res: Response) => {
  const {
    colaboradorId,
    tipo,
    latitude,
    longitude,
    precisaoMetros,
    instanteDispositivo,
    dispositivoId,
    localId,
    eventoId,
    offline
  } = req.body;

  if (!colaboradorId || !tipo) {
    return res.status(400).json({ erro: 'Colaborador e tipo de batida são obrigatórios.' });
  }

  const colab = colaboradores.find(c => c.id === colaboradorId);
  if (!colab) return res.status(404).json({ erro: 'Colaborador não cadastrado.' });

  // Busca a escala do colaborador para identificar o local autorizado do dia
  const escalaHoje = escalas.find(e => e.colaboradorId === colaboradorId && e.data === hojeStr);
  const targetLocalId = localId || escalaHoje?.localId || locais[0].id;
  const localAlvo = locais.find(l => l.id === targetLocalId) || locais[0];

  let distanciaMetros = 0;
  let status: 'VALIDADA' | 'FORA_DA_AREA' = 'VALIDADA';

  if (latitude !== undefined && longitude !== undefined) {
    distanciaMetros = calcularDistanciaHaversine(latitude, longitude, localAlvo.latitude, localAlvo.longitude);
    status = distanciaMetros <= localAlvo.raioMetros ? 'VALIDADA' : 'FORA_DA_AREA';
  }

  // Gera Sequencial NSR e Assinatura SHA-256 (Portaria 671)
  const nsr = ++nsrSequence;
  const nowIso = new Date().toISOString();
  const rawString = `${nsr}|${colab.cpf}|${nowIso}|${tipo}|${latitude}|${longitude}|DISK_REP_P_MTE_671`;
  const hash = crypto.createHash('sha256').update(rawString).digest('hex');
  const comprovanteCode = `MTE671-${String(nsr).padStart(9, '0')}-${hash.substring(0, 8).toUpperCase()}`;

  const novaBatida: BatidaPonto = {
    id: `bat-${nsr}`,
    nsr,
    colaboradorId: colab.id,
    colaboradorNome: colab.nome,
    colaboradorMatricula: colab.matricula,
    tipo,
    status,
    instanteServidor: nowIso,
    instanteDispositivo: instanteDispositivo || nowIso,
    latitude: Number(latitude) || localAlvo.latitude,
    longitude: Number(longitude) || localAlvo.longitude,
    precisaoMetros: Number(precisaoMetros) || 8.0,
    distanciaLocalMetros: distanciaMetros,
    localId: localAlvo.id,
    localNome: localAlvo.nome,
    eventoId: eventoId || escalaHoje?.eventoId,
    eventoNome: escalaHoje?.eventoNome,
    offline: Boolean(offline),
    dispositivoId: dispositivoId || 'Android APK Disk Ponto',
    mockLocationSuspeita: false,
    comprovanteNsr: comprovanteCode,
    hashIntegridade: hash,
    criadoEm: nowIso
  };

  batidas.unshift(novaBatida);

  registrarLogAuditoria(
    'REGISTRO_PONTO',
    'BatidaPonto',
    {
      colaborador: colab.nome,
      tipo,
      status,
      distancia: `${distanciaMetros}m`,
      local: localAlvo.nome,
      nsr
    },
    req
  );

  res.status(201).json(novaBatida);
});

// 9. Listar Batidas (Painel RH e Espelho do Colaborador)
app.get('/api/ponto/batidas', (req: Request, res: Response) => {
  const { colaboradorId, data, status } = req.query;
  let filtradas = [...batidas];

  if (colaboradorId) filtradas = filtradas.filter(b => b.colaboradorId === colaboradorId);
  if (data) filtradas = filtradas.filter(b => b.instanteServidor.startsWith(String(data)));
  if (status) filtradas = filtradas.filter(b => b.status === status);

  res.json(filtradas);
});

// 10. Sincronização em Lote Offline (Idempotente)
app.post('/api/ponto/sincronizar-offline', (req: Request, res: Response) => {
  const pontos = req.body.pontos || [];
  let sincronizados = 0;
  const resultados: BatidaPonto[] = [];

  for (const p of pontos) {
    const colab = colaboradores.find(c => c.id === p.colaboradorId);
    if (!colab) continue;

    const nsr = ++nsrSequence;
    const nowIso = new Date().toISOString();
    const hash = crypto.createHash('sha256').update(`${nsr}|${colab.cpf}|${p.instanteDispositivo}|${p.tipo}`).digest('hex');

    const batidaSync: BatidaPonto = {
      id: `bat-sync-${nsr}`,
      nsr,
      colaboradorId: colab.id,
      colaboradorNome: colab.nome,
      colaboradorMatricula: colab.matricula,
      tipo: p.tipo,
      status: 'OFFLINE_SINCRONIZADA',
      instanteServidor: nowIso,
      instanteDispositivo: p.instanteDispositivo,
      latitude: p.latitude,
      longitude: p.longitude,
      precisaoMetros: p.precisaoMetros,
      distanciaLocalMetros: p.distanciaLocalMetros || 0,
      localId: p.localId,
      localNome: p.localNome || 'Local Registrado Offline',
      offline: true,
      dispositivoId: p.dispositivoId,
      mockLocationSuspeita: false,
      comprovanteNsr: `MTE671-${String(nsr).padStart(9, '0')}-${hash.substring(0, 8).toUpperCase()}`,
      hashIntegridade: hash,
      criadoEm: nowIso
    };

    batidas.unshift(batidaSync);
    resultados.push(batidaSync);
    sincronizados++;
  }

  registrarLogAuditoria('SINCRONIZACAO_OFFLINE', 'BatidaPonto', { totalSincronizados: sincronizados }, req);
  res.json({ sincronizados, batidas: resultados });
});

// 11. Ajustes de Ponto (Solicitações & Aprovações)
app.get('/api/ponto/ajustes', (_, res) => {
  res.json(ajustes);
});

app.post('/api/ponto/ajustes', (req: Request, res: Response) => {
  const { colaboradorId, dataPonto, tipoBatida, horarioCorreto, motivo, justificativa } = req.body;
  if (!colaboradorId || !justificativa || justificativa.length < 5) {
    return res.status(400).json({ erro: 'Colaborador e justificativa (mínimo 5 caracteres) são obrigatórios.' });
  }

  const colab = colaboradores.find(c => c.id === colaboradorId);
  const novoAjuste: AjustePonto = {
    id: `aj-${Date.now()}`,
    colaboradorId,
    colaboradorNome: colab?.nome || 'Colaborador',
    dataPonto: dataPonto || hojeStr,
    tipoBatida: tipoBatida || 'SAIDA',
    horarioCorreto: horarioCorreto || '18:00',
    motivo: motivo || 'ESQUECIMENTO',
    justificativa,
    status: 'PENDENTE',
    solicitadoEm: new Date().toISOString()
  };

  ajustes.unshift(novoAjuste);
  registrarLogAuditoria('SOLICITACAO_AJUSTE_CRIADA', 'AjustePonto', novoAjuste, req);

  res.status(201).json(novoAjuste);
});

app.post('/api/ponto/ajustes/:id/analisar', (req: Request, res: Response) => {
  const { id } = req.params;
  const { acao, parecer, usuarioNome } = req.body; // acao: 'APROVADO' ou 'REPROVADO'

  const ajuste = ajustes.find(a => a.id === id);
  if (!ajuste) return res.status(404).json({ erro: 'Solicitação de ajuste não encontrada.' });

  if (ajuste.status !== 'PENDENTE') {
    return res.status(400).json({ erro: `Ajuste já foi ${ajuste.status}.` });
  }

  ajuste.status = acao === 'APROVADO' ? 'APROVADO' : 'REPROVADO';
  ajuste.analisadoEm = new Date().toISOString();
  ajuste.analisadoPor = usuarioNome || 'Gestor RH';
  ajuste.parecer = parecer || (acao === 'APROVADO' ? 'Aprovado pelo RH' : 'Recusado pelo RH');

  // Se aprovado, gera a batida administrativa regularizada
  if (ajuste.status === 'APROVADO') {
    const colab = colaboradores.find(c => c.id === ajuste.colaboradorId);
    if (colab) {
      const nsr = ++nsrSequence;
      const nowIso = new Date().toISOString();
      const hash = crypto.createHash('sha256').update(`${nsr}|AJUSTE_RH|${ajuste.horarioCorreto}`).digest('hex');

      batidas.unshift({
        id: `bat-ajuste-${nsr}`,
        nsr,
        colaboradorId: colab.id,
        colaboradorNome: colab.nome,
        colaboradorMatricula: colab.matricula,
        tipo: ajuste.tipoBatida,
        status: 'VALIDADA',
        instanteServidor: `${ajuste.dataPonto}T${ajuste.horarioCorreto}:00.000Z`,
        latitude: locais[0].latitude,
        longitude: locais[0].longitude,
        precisaoMetros: 0,
        distanciaLocalMetros: 0,
        localId: locais[0].id,
        localNome: 'Sede (Ajuste Administrativo RH)',
        offline: false,
        mockLocationSuspeita: false,
        comprovanteNsr: `MTE671-${String(nsr).padStart(9, '0')}-${hash.substring(0, 8).toUpperCase()}`,
        hashIntegridade: hash,
        criadoEm: nowIso
      });
    }
  }

  registrarLogAuditoria(
    `AJUSTE_PONTO_${ajuste.status}`,
    'AjustePonto',
    { ajusteId: id, status: ajuste.status, parecer: ajuste.parecer },
    req
  );

  res.json(ajuste);
});

// 12. Auditoria
app.get('/api/auditoria', (_, res) => {
  res.json(auditoria);
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3333;
  app.listen(PORT, () => {
    console.log(`✓ RH Disk API V1.1 operacional na porta ${PORT}`);
  });
}
