import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-rh-disk-change-me';

// ============================================================================
// ESTRUTURA DE DADOS EM MEMÓRIA & PERSISTÊNCIA ÁGIL (PRISMA READY)
// FASE 4: GESTÃO COMPLETA DE PONTO E JORNADA
// ============================================================================

export interface LocalPonto {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  raioMetros: number;
  ativo: boolean;
}

export interface Colaborador {
  id: string;
  usuarioId?: string;
  nome: string;
  cpf: string;
  matricula: string;
  cargo: string;
  departamento: string;
  gestorId?: string;
  centroCusto?: string;
  cargaHorariaSemanal: number;
  ativo: boolean;
  telefone?: string;
  email?: string;
  chavePix?: string;
  salario?: number;
  criadoEm: string;
}

export interface Jornada {
  id: string;
  nome: string;
  entrada: string;
  inicioIntervalo?: string;
  fimIntervalo?: string;
  saida: string;
  toleranciaMinutos: number;
  cargaMinutos: number;
}

export interface Escala {
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
  observacao?: string;
}

export interface BatidaPonto {
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

export interface AjustePonto {
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

export interface BancoHoras {
  id: string;
  colaboradorId: string;
  colaboradorNome?: string;
  competencia: string; // YYYY-MM
  minutosSaldo: number;
  minutosExtras: number;
  minutosDebito: number;
  atualizadoEm: string;
}

export interface FechamentoPonto {
  id: string;
  competencia: string; // YYYY-MM
  status: 'ABERTO' | 'EM_ANALISE' | 'FECHADO' | 'REABERTO';
  fechadoEm?: string;
  fechadoPor?: string;
  observacao?: string;
  criadoEm: string;
}

export interface Dispositivo {
  id: string;
  colaboradorId: string;
  colaboradorNome?: string;
  identificador: string;
  nome?: string;
  plataforma?: string;
  status: 'PENDENTE' | 'AUTORIZADO' | 'BLOQUEADO';
  ultimoAcesso?: string;
  criadoEm: string;
}

export interface Auditoria {
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
const hojeStr = new Date().toISOString().substring(0, 10);
const competenciaAtual = hojeStr.substring(0, 7);

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
    centroCusto: 'CC-010-OPS',
    cargaHorariaSemanal: 44,
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
    centroCusto: 'CC-010-OPS',
    cargaHorariaSemanal: 44,
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
    centroCusto: 'CC-010-OPS',
    cargaHorariaSemanal: 44,
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
    centroCusto: 'CC-002-FIN',
    cargaHorariaSemanal: 40,
    ativo: true,
    telefone: '(41) 98444-5566',
    email: 'beatriz.ramos@diskingressos.com.br',
    chavePix: 'beatriz.ramos@diskingressos.com.br',
    salario: 4600.00,
    criadoEm: '2026-04-05T08:00:00.000Z'
  },
  {
    id: 'col-05',
    nome: 'Ana Martins',
    cpf: '123.456.789-01',
    matricula: 'DISK-00128',
    cargo: 'Analista de Operações Pleno',
    departamento: 'Operações e Eventos',
    centroCusto: 'CC-010-OPS',
    cargaHorariaSemanal: 44,
    ativo: true,
    telefone: '(41) 99888-7711',
    email: 'ana.martins@diskingressos.com.br',
    chavePix: '12345678901',
    salario: 4100.00,
    criadoEm: '2026-05-12T08:00:00.000Z'
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
    toleranciaMinutos: 10,
    cargaMinutos: 480
  },
  {
    id: 'jor-02',
    nome: 'Operação Show Turno Noturno',
    entrada: '14:00',
    inicioIntervalo: '18:00',
    fimIntervalo: '19:00',
    saida: '23:00',
    toleranciaMinutos: 15,
    cargaMinutos: 540
  },
  {
    id: 'jor-03',
    nome: 'Turno de Bilheteria Shopping 6h',
    entrada: '10:00',
    inicioIntervalo: '13:00',
    fimIntervalo: '13:15',
    saida: '16:15',
    toleranciaMinutos: 5,
    cargaMinutos: 360
  }
];

const escalas: Escala[] = [
  {
    id: 'esc-01',
    colaboradorId: 'col-01',
    colaboradorNome: 'Carlos Eduardo Mendes',
    jornadaId: 'jor-01',
    jornadaNome: 'Comercial Padrão 44h (Seg-Sex)',
    localId: 'loc-01',
    localNome: 'Sede DiskIngressos Curitiba',
    data: hojeStr,
    observacao: 'Turno regular administrativo'
  },
  {
    id: 'esc-02',
    colaboradorId: 'col-02',
    colaboradorNome: 'Camila Fernandes Silveira',
    jornadaId: 'jor-01',
    jornadaNome: 'Comercial Padrão 44h (Seg-Sex)',
    localId: 'loc-01',
    localNome: 'Sede DiskIngressos Curitiba',
    data: hojeStr,
    observacao: 'Turno regular administrativo'
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
    eventoNome: 'Show Nacional de Rock Curitiba',
    observacao: 'Escala para portões 1 a 4'
  },
  {
    id: 'esc-04',
    colaboradorId: 'col-05',
    colaboradorNome: 'Ana Martins',
    jornadaId: 'jor-01',
    jornadaNome: 'Comercial Padrão 44h (Seg-Sex)',
    localId: 'loc-01',
    localNome: 'Sede DiskIngressos Curitiba',
    data: hojeStr,
    observacao: 'Operação Sede Disk'
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
  },
  {
    id: 'bat-1003',
    nsr: 1003,
    colaboradorId: 'col-05',
    colaboradorNome: 'Ana Martins',
    colaboradorMatricula: 'DISK-00128',
    tipo: 'ENTRADA',
    status: 'VALIDADA',
    instanteServidor: `${hojeStr}T08:01:00.000Z`,
    latitude: -25.42841,
    longitude: -49.27332,
    precisaoMetros: 5.0,
    distanciaLocalMetros: 4,
    localId: 'loc-01',
    localNome: 'Sede DiskIngressos Curitiba',
    offline: false,
    mockLocationSuspeita: false,
    comprovanteNsr: 'MTE671-000001003-C9D2E4F6',
    hashIntegridade: 'c9d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2',
    criadoEm: `${hojeStr}T08:01:00.000Z`
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

const bancoHoras: BancoHoras[] = [
  {
    id: 'bh-01',
    colaboradorId: 'col-05',
    colaboradorNome: 'Ana Martins',
    competencia: competenciaAtual,
    minutosSaldo: 320, // +5h 20m
    minutosExtras: 320,
    minutosDebito: 0,
    atualizadoEm: new Date().toISOString()
  },
  {
    id: 'bh-02',
    colaboradorId: 'col-01',
    colaboradorNome: 'Carlos Eduardo Mendes',
    competencia: competenciaAtual,
    minutosSaldo: -75, // -1h 15m
    minutosExtras: 70,
    minutosDebito: 145,
    atualizadoEm: new Date().toISOString()
  },
  {
    id: 'bh-03',
    colaboradorId: 'col-02',
    colaboradorNome: 'Camila Fernandes Silveira',
    competencia: competenciaAtual,
    minutosSaldo: 185, // +3h 05m
    minutosExtras: 185,
    minutosDebito: 0,
    atualizadoEm: new Date().toISOString()
  }
];

const fechamentos: FechamentoPonto[] = [
  {
    id: 'fech-01',
    competencia: '2026-09',
    status: 'FECHADO',
    fechadoEm: '2026-10-01T10:00:00.000Z',
    fechadoPor: 'usr-rh-01',
    observacao: 'Competência Setembro/2026 homologada sem pendências',
    criadoEm: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'fech-02',
    competencia: competenciaAtual,
    status: 'EM_ANALISE',
    observacao: 'Competência Outubro/2026 aberta para apuração',
    criadoEm: `${competenciaAtual}-01T00:00:00.000Z`
  }
];

const dispositivos: Dispositivo[] = [
  {
    id: 'dev-01',
    colaboradorId: 'col-05',
    colaboradorNome: 'Ana Martins',
    identificador: 'dev-samsung-a55-ana',
    nome: 'Galaxy A55 (Corporativo)',
    plataforma: 'Android 14',
    status: 'AUTORIZADO',
    ultimoAcesso: `${hojeStr}T08:01:00.000Z`,
    criadoEm: '2026-05-12T08:00:00.000Z'
  },
  {
    id: 'dev-02',
    colaboradorId: 'col-01',
    colaboradorNome: 'Carlos Eduardo Mendes',
    identificador: 'dev-moto-g84-carlos',
    nome: 'Moto G84 (Pessoal)',
    plataforma: 'Android 13',
    status: 'AUTORIZADO',
    ultimoAcesso: `${hojeStr}T08:01:14.000Z`,
    criadoEm: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'dev-03',
    colaboradorId: 'col-02',
    colaboradorNome: 'Camila Fernandes Silveira',
    identificador: 'dev-xiaomi-13-camila',
    nome: 'Xiaomi Redmi Note 13',
    plataforma: 'Android 14',
    status: 'PENDENTE',
    ultimoAcesso: `${hojeStr}T08:05:30.000Z`,
    criadoEm: '2026-10-02T10:00:00.000Z'
  }
];

const auditoria: Auditoria[] = [
  {
    id: 'aud-01',
    usuarioNome: 'Sistema Core RH',
    acao: 'INICIALIZACAO_SISTEMA',
    entidade: 'Sistema',
    dados: { versao: 'V1.4 - Fase 4 Gestão Completa', status: 'Operacional' },
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

// 1. Saúde e Dashboard Integrado
app.get('/api/saude', (_, res) => {
  res.json({
    status: 'ok',
    sistema: 'RH Disk API V1.4 (Fase 4)',
    versao: '4.0',
    persistencia: 'PostgreSQL/Prisma Ready + Memória Resiliente',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/dashboard', (_, res) => {
  const batidasHoje = batidas.filter(b => b.instanteServidor.startsWith(hojeStr)).length;
  const pendencias = ajustes.filter(a => a.status === 'PENDENTE').length;

  res.json({
    colaboradoresAtivos: colaboradores.filter(c => c.ativo).length,
    trabalhandoAgora: batidasHoje,
    emIntervalo: 1,
    batidasHoje,
    pendencias,
    horasExtrasMes: 62,
    locaisAtivos: locais.filter(l => l.ativo).length,
    escalasHoje: escalas.filter(e => e.data === hojeStr).length,
    saldoBancoGeralMinutos: 184 * 60
  });
});

// 2. Autenticação e Perfis (RBAC / SoD)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { login, email, senha } = req.body || {};
  const termo = String(login || email || '').trim().toLowerCase();

  const colab = colaboradores.find(
    c => c.email?.toLowerCase() === termo ||
         c.matricula.toLowerCase() === termo ||
         c.cpf.replace(/\D/g, '') === termo.replace(/\D/g, '')
  );

  if (termo === 'admin' || termo === 'rh@diskingressos.com.br' || termo === 'rh@disk.local' || colab) {
    const perfil = colab ? 'COLABORADOR' : 'ADMINISTRADOR';
    const usuario = {
      id: colab ? colab.id : 'usr-admin-01',
      nome: colab ? colab.nome : 'Administrador RH Disk',
      email: colab ? colab.email : 'rh@diskingressos.com.br',
      perfil,
      colaboradorId: colab ? colab.id : undefined,
      colaborador: colab || undefined,
      token: jwt.sign(
        { sub: colab ? colab.id : 'usr-admin-01', perfil, colaboradorId: colab?.id },
        JWT_SECRET,
        { expiresIn: '12h' }
      )
    };

    registrarLogAuditoria('LOGIN_REALIZADO', 'Usuario', { usuario: usuario.nome, perfil: usuario.perfil }, req);
    return res.json({ token: usuario.token, usuario });
  }

  res.status(401).json({ erro: 'Credenciais inválidas. Use CPF, Matrícula ou E-mail corporativo.' });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  res.json({
    id: 'usr-admin-01',
    nome: 'Administrador RH Disk',
    email: 'rh@diskingressos.com.br',
    perfil: 'ADMINISTRADOR',
    permissoes: ['LER_PONTO', 'CRIAR_PONTO', 'APROVAR_AJUSTES', 'GERENCIAR_ESCALAS', 'FECHAMENTO_MENSAL', 'AUDITORIA']
  });
});

app.get('/api/me', (req: Request, res: Response) => {
  res.json({
    id: 'usr-admin-01',
    nome: 'Administrador RH Disk',
    email: 'rh@diskingressos.com.br',
    perfil: 'ADMINISTRADOR',
    colaborador: colaboradores[0]
  });
});

// 3. Monitor Operacional de Ponto (Tempo Real)
app.get('/api/monitor/hoje', (req: Request, res: Response) => {
  const batidasHoje = batidas.filter(b => b.instanteServidor.startsWith(hojeStr));

  const colaboradoresMonitorados = colaboradores.map(col => {
    const batidasColab = batidasHoje.filter(b => b.colaboradorId === col.id);
    const ultimaBatida = batidasColab[0];
    const escalaHoje = escalas.find(e => e.colaboradorId === col.id && e.data === hojeStr);

    let situacao = 'SEM_MARCACAO';
    if (ultimaBatida) {
      if (ultimaBatida.status === 'PENDENTE_ANALISE' || ultimaBatida.status === 'FORA_DA_AREA' || ultimaBatida.mockLocationSuspeita) {
        situacao = 'PARA_ANALISAR';
      } else if (ultimaBatida.tipo === 'ENTRADA' || ultimaBatida.tipo === 'FIM_INTERVALO') {
        situacao = 'TRABALHANDO';
      } else if (ultimaBatida.tipo === 'INICIO_INTERVALO') {
        situacao = 'INTERVALO';
      } else if (ultimaBatida.tipo === 'SAIDA') {
        situacao = 'JORNADA_ENCERRADA';
      }
    }

    return {
      colaboradorId: col.id,
      nome: col.nome,
      matricula: col.matricula,
      cargo: col.cargo,
      departamento: col.departamento,
      situacao,
      ultimaBatida,
      escala: escalaHoje,
      localNome: escalaHoje?.localNome || ultimaBatida?.localNome || 'Sede DiskIngressos Curitiba',
      alertaSuspeita: ultimaBatida?.mockLocationSuspeita || false,
      distanciaLocalMetros: ultimaBatida?.distanciaLocalMetros || 0,
      precisaoMetros: ultimaBatida?.precisaoMetros || 0,
      offline: ultimaBatida?.offline || false
    };
  });

  const kpis = {
    emTrabalho: colaboradoresMonitorados.filter(c => c.situacao === 'TRABALHANDO').length,
    emIntervalo: colaboradoresMonitorados.filter(c => c.situacao === 'INTERVALO').length,
    paraAnalisar: colaboradoresMonitorados.filter(c => c.situacao === 'PARA_ANALISAR').length,
    semMarcacao: colaboradoresMonitorados.filter(c => c.situacao === 'SEM_MARCACAO').length,
    jornadaEncerrada: colaboradoresMonitorados.filter(c => c.situacao === 'JORNADA_ENCERRADA').length,
    totalMonitorados: colaboradoresMonitorados.length
  };

  res.json({ kpis, colaboradores: colaboradoresMonitorados });
});

// 4. Cadastros Administrativos: Colaboradores
app.get(['/api/colaboradores', '/api/admin/colaboradores'], (req: Request, res: Response) => {
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
  const saldoColab = bancoHoras.find(b => b.colaboradorId === colab.id && b.competencia === competenciaAtual);

  res.json({ ...colab, escalas: escalasColab, batidas: batidasColab, saldo: saldoColab });
});

app.post(['/api/colaboradores', '/api/admin/colaboradores'], (req: Request, res: Response) => {
  const { nome, cpf, matricula, cargo, departamento, gestorId, centroCusto, cargaHorariaSemanal, telefone, email, chavePix, salario } = req.body;
  if (!nome || !cpf || !cargo) {
    return res.status(400).json({ erro: 'Preencha os dados obrigatórios: Nome, CPF e Cargo.' });
  }

  if (colaboradores.some(c => c.cpf.replace(/\D/g, '') === String(cpf).replace(/\D/g, ''))) {
    return res.status(400).json({ erro: 'Já existe um colaborador cadastrado com este CPF.' });
  }

  const mat = matricula || `DISK-${Math.floor(10000 + Math.random() * 90000)}`;
  const novoColaborador: Colaborador = {
    id: `col-${Date.now()}`,
    nome: nome.trim(),
    cpf: cpf.trim(),
    matricula: mat.trim(),
    cargo: cargo.trim(),
    departamento: departamento || 'Operações e Eventos',
    gestorId,
    centroCusto: centroCusto || 'CC-010-OPS',
    cargaHorariaSemanal: Number(cargaHorariaSemanal || 44),
    ativo: true,
    telefone: telefone || '',
    email: email || `${mat.toLowerCase()}@diskingressos.com.br`,
    chavePix: chavePix || '',
    salario: Number(salario) || 0,
    criadoEm: new Date().toISOString()
  };

  colaboradores.push(novoColaborador);
  registrarLogAuditoria('CADASTROU_COLABORADOR', 'Colaborador', novoColaborador, req);

  res.status(201).json(novoColaborador);
});

// 5. Cadastros Administrativos: Locais e Geofences
app.get(['/api/locais', '/api/admin/locais'], (_, res) => {
  res.json(locais);
});

app.post(['/api/locais', '/api/admin/locais'], (req: Request, res: Response) => {
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
  registrarLogAuditoria('CADASTROU_LOCAL', 'LocalPonto', novoLocal, req);

  res.status(201).json(novoLocal);
});

// 6. Cadastros Administrativos: Jornadas
app.get(['/api/jornadas', '/api/admin/jornadas'], (_, res) => {
  res.json(jornadas);
});

app.post(['/api/jornadas', '/api/admin/jornadas'], (req: Request, res: Response) => {
  const { nome, entrada, inicioIntervalo, fimIntervalo, saida, toleranciaMinutos, cargaMinutos } = req.body;
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
    toleranciaMinutos: Number(toleranciaMinutos) || 10,
    cargaMinutos: Number(cargaMinutos) || 480
  };

  jornadas.push(novaJornada);
  registrarLogAuditoria('CADASTROU_JORNADA', 'Jornada', novaJornada, req);

  res.status(201).json(novaJornada);
});

// 7. Cadastros Administrativos: Escalas Operacionais
app.get(['/api/escalas', '/api/admin/escalas'], (req: Request, res: Response) => {
  const { colaboradorId, data } = req.query;
  let filtradas = [...escalas];
  if (colaboradorId) filtradas = filtradas.filter(e => e.colaboradorId === colaboradorId);
  if (data) filtradas = filtradas.filter(e => e.data === String(data));
  res.json(filtradas);
});

app.post(['/api/escalas', '/api/admin/escalas'], (req: Request, res: Response) => {
  const { colaboradorId, jornadaId, localId, data, eventoId, eventoNome, observacao } = req.body;
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
    data: data ? (typeof data === 'string' ? data.substring(0, 10) : new Date(data).toISOString().substring(0, 10)) : hojeStr,
    eventoId,
    eventoNome,
    observacao
  };

  escalas.push(novaEscala);
  registrarLogAuditoria('CADASTROU_ESCALA', 'Escala', novaEscala, req);

  res.status(201).json(novaEscala);
});

app.get('/api/ponto/minha-escala', (req: Request, res: Response) => {
  const colaboradorId = (req as any).auth?.colaboradorId || req.query.colaboradorId || colaboradores[0].id;
  const escalaHoje = escalas.find(e => e.colaboradorId === colaboradorId && e.data === hojeStr);

  const local = locais.find(l => l.id === escalaHoje?.localId) || locais[0];
  const jornada = jornadas.find(j => j.id === escalaHoje?.jornadaId) || jornadas[0];

  res.json({
    id: escalaHoje?.id || `esc-auto-${colaboradorId}`,
    colaboradorId,
    jornadaId: jornada.id,
    localId: local.id,
    data: hojeStr,
    jornada,
    local
  });
});

// 8. Validação e Registro de Ponto (Portaria 671 MTE & Disk Ponto Android)
app.post('/api/ponto/validar', (req: Request, res: Response) => {
  const { latitude, longitude, local, localId } = req.body;
  const alvo = local || locais.find(l => l.id === localId) || locais[0];

  if (latitude === undefined || longitude === undefined || !alvo) {
    return res.status(400).json({ erro: 'Localização ou local incompleto.' });
  }

  const d = calcularDistanciaHaversine(latitude, longitude, alvo.latitude, alvo.longitude);
  const permitido = d <= alvo.raioMetros;

  res.json({
    permitido,
    distanciaMetros: Math.round(d),
    raioMetros: alvo.raioMetros,
    localNome: alvo.nome,
    status: permitido ? 'VALIDADA' : 'FORA_DA_AREA'
  });
});

app.post('/api/ponto/registrar', (req: Request, res: Response) => {
  const {
    colaboradorId: colabIdBody,
    tipo,
    latitude,
    longitude,
    precisaoMetros,
    instanteDispositivo,
    dispositivoId,
    localId,
    eventoId,
    offline,
    mockLocationSuspeita
  } = req.body;

  const colaboradorId = colabIdBody || (req as any).auth?.colaboradorId || colaboradores[0].id;

  if (!colaboradorId || !tipo) {
    return res.status(400).json({ erro: 'Dados obrigatórios incompletos: colaborador e tipo de batida.' });
  }

  const colab = colaboradores.find(c => c.id === colaboradorId);
  if (!colab) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

  const escalaHoje = escalas.find(e => e.colaboradorId === colaboradorId && e.data === hojeStr);
  const targetLocalId = localId || escalaHoje?.localId || locais[0].id;
  const localAlvo = locais.find(l => l.id === targetLocalId) || locais[0];

  let distanciaMetros = 0;
  let status: 'VALIDADA' | 'FORA_DA_AREA' | 'PENDENTE_ANALISE' | 'OFFLINE_SINCRONIZADA' = 'VALIDADA';

  if (latitude !== undefined && longitude !== undefined) {
    distanciaMetros = calcularDistanciaHaversine(latitude, longitude, localAlvo.latitude, localAlvo.longitude);
    status = distanciaMetros <= localAlvo.raioMetros ? 'VALIDADA' : 'FORA_DA_AREA';
  }

  if (mockLocationSuspeita || ((precisaoMetros ?? 0) > 200)) {
    status = 'PENDENTE_ANALISE';
  } else if (offline && status === 'VALIDADA') {
    status = 'OFFLINE_SINCRONIZADA';
  }

  const nsr = ++nsrSequence;
  const nowIso = new Date().toISOString();
  const hash = crypto.createHash('sha256').update(`${nsr}|${colab.cpf}|${nowIso}|${tipo}`).digest('hex');

  const novaBatida: BatidaPonto = {
    id: `bat-${Date.now()}-${nsr}`,
    nsr,
    colaboradorId: colab.id,
    colaboradorNome: colab.nome,
    colaboradorMatricula: colab.matricula,
    tipo,
    status,
    instanteServidor: nowIso,
    instanteDispositivo: instanteDispositivo || nowIso,
    latitude: latitude || localAlvo.latitude,
    longitude: longitude || localAlvo.longitude,
    precisaoMetros: precisaoMetros || 5.0,
    distanciaLocalMetros: Math.round(distanciaMetros),
    localId: localAlvo.id,
    localNome: localAlvo.nome,
    eventoId: eventoId || escalaHoje?.eventoId,
    eventoNome: escalaHoje?.eventoNome,
    offline: Boolean(offline),
    dispositivoId: dispositivoId || 'android',
    mockLocationSuspeita: Boolean(mockLocationSuspeita),
    comprovanteNsr: `MTE671-${String(nsr).padStart(9, '0')}-${hash.substring(0, 8).toUpperCase()}`,
    hashIntegridade: hash,
    criadoEm: nowIso
  };

  batidas.unshift(novaBatida);
  registrarLogAuditoria('REGISTRO_PONTO', 'BatidaPonto', { tipo, status, nsr, distancia: Math.round(distanciaMetros) }, req);

  res.status(201).json({
    ...novaBatida,
    distanciaLocalMetros: Math.round(distanciaMetros),
    localNome: localAlvo.nome
  });
});

app.get('/api/ponto/minhas-batidas', (req: Request, res: Response) => {
  const colaboradorId = (req as any).auth?.colaboradorId || req.query.colaboradorId || colaboradores[0].id;
  const minhas = batidas.filter(b => b.colaboradorId === colaboradorId);
  res.json(minhas);
});

app.get('/api/ponto/batidas', (req: Request, res: Response) => {
  const { colaboradorId, data, status } = req.query;
  let filtradas = [...batidas];

  if (colaboradorId) filtradas = filtradas.filter(b => b.colaboradorId === colaboradorId);
  if (data) filtradas = filtradas.filter(b => b.instanteServidor.startsWith(String(data)));
  if (status) filtradas = filtradas.filter(b => b.status === status);

  res.json(filtradas);
});

// 9. Sincronização em Lote Offline
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

// 10. Ajustes de Ponto
app.get('/api/ponto/ajustes', (_, res) => {
  res.json(ajustes);
});

app.post('/api/ponto/ajustes', (req: Request, res: Response) => {
  const { colaboradorId, batidaId, dataPonto, tipoBatida, horarioCorreto, motivo, justificativa } = req.body;
  if (!justificativa || justificativa.length < 3) {
    return res.status(400).json({ erro: 'Justificativa obrigatória.' });
  }

  const cid = colaboradorId || (req as any).auth?.colaboradorId || colaboradores[0].id;
  const colab = colaboradores.find(c => c.id === cid);

  const novoAjuste: AjustePonto = {
    id: `aj-${Date.now()}`,
    colaboradorId: cid,
    colaboradorNome: colab?.nome || 'Colaborador',
    batidaId,
    dataPonto: dataPonto || hojeStr,
    tipoBatida: tipoBatida || 'SAIDA',
    horarioCorreto: horarioCorreto || '18:00',
    motivo: motivo || 'ESQUECIMENTO',
    justificativa,
    status: 'PENDENTE',
    solicitadoEm: new Date().toISOString()
  };

  ajustes.unshift(novoAjuste);
  registrarLogAuditoria('SOLICITOU_AJUSTE', 'AjustePonto', novoAjuste, req);

  res.status(201).json(novoAjuste);
});

app.patch('/api/ponto/ajustes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, parecer, analisadoPor } = req.body;
  const ajuste = ajustes.find(a => a.id === id);
  if (!ajuste) return res.status(404).json({ erro: 'Ajuste não encontrado' });
  if (!['APROVADO', 'REPROVADO'].includes(status)) return res.status(400).json({ erro: 'Status inválido' });

  ajuste.status = status;
  ajuste.analisadoEm = new Date().toISOString();
  ajuste.analisadoPor = analisadoPor || (req as any).auth?.sub || 'Gestor RH';
  ajuste.parecer = parecer || `Ajuste ${status.toLowerCase()} pelo RH`;

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

  registrarLogAuditoria(`ANALISOU_AJUSTE`, 'AjustePonto', { ajusteId: id, status: ajuste.status }, req);
  res.json(ajuste);
});

app.post('/api/ponto/ajustes/:id/analisar', (req: Request, res: Response) => {
  const { id } = req.params;
  const { acao, parecer, usuarioNome } = req.body;
  const status = acao === 'APROVADO' ? 'APROVADO' : 'REPROVADO';
  const ajuste = ajustes.find(a => a.id === id);
  if (!ajuste) return res.status(404).json({ erro: 'Solicitação de ajuste não encontrada.' });
  if (ajuste.status !== 'PENDENTE') return res.status(400).json({ erro: `Ajuste já foi ${ajuste.status}.` });

  ajuste.status = status;
  ajuste.analisadoEm = new Date().toISOString();
  ajuste.analisadoPor = usuarioNome || 'Gestor RH';
  ajuste.parecer = parecer || `Ajuste ${status.toLowerCase()} pelo RH`;

  registrarLogAuditoria(`AJUSTE_PONTO_${status}`, 'AjustePonto', { ajusteId: id, status }, req);
  res.json(ajuste);
});

// 11. Espelho de Ponto Individual
app.get('/api/ponto/espelho/:colaboradorId', (req: Request, res: Response) => {
  const { colaboradorId } = req.params;
  const competencia = String(req.query.competencia || competenciaAtual);

  const colab = colaboradores.find(c => c.id === colaboradorId);
  if (!colab) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

  const batidasPeriodo = batidas.filter(
    b => b.colaboradorId === colaboradorId && b.instanteServidor.startsWith(competencia)
  );
  const escalasPeriodo = escalas.filter(
    e => e.colaboradorId === colaboradorId && e.data.startsWith(competencia)
  );
  const saldo = bancoHoras.find(
    b => b.colaboradorId === colaboradorId && b.competencia === competencia
  );

  res.json({
    competencia,
    colaborador: colab,
    batidas: batidasPeriodo,
    escalas: escalasPeriodo,
    saldo
  });
});

// 12. Banco de Horas e Horas Extras
app.get('/api/banco-horas', (_, res) => {
  const resultado = bancoHoras.map(bh => {
    const colab = colaboradores.find(c => c.id === bh.colaboradorId);
    return { ...bh, colaboradorNome: colab?.nome || 'Colaborador', colaborador: colab };
  });
  res.json(resultado);
});

app.post('/api/banco-horas/recalcular/:colaboradorId', (req: Request, res: Response) => {
  const { colaboradorId } = req.params;
  const competencia = String(req.body.competencia || competenciaAtual);

  const colab = colaboradores.find(c => c.id === colaboradorId);
  if (!colab) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

  // Busca batidas da competência ordenadas cronologicamente
  const batidasColab = batidas
    .filter(b => b.colaboradorId === colaboradorId && b.instanteServidor.startsWith(competencia))
    .sort((a, b) => new Date(a.instanteServidor).getTime() - new Date(b.instanteServidor).getTime());

  // Calcula minutos trabalhados nos pares Entrada -> Saída ou Entrada -> Intervalo
  let minutosTrabalhados = 0;
  for (let i = 0; i + 1 < batidasColab.length; i += 2) {
    const tInicio = new Date(batidasColab[i].instanteServidor).getTime();
    const tFim = new Date(batidasColab[i + 1].instanteServidor).getTime();
    minutosTrabalhados += Math.max(0, Math.round((tFim - tInicio) / 60000));
  }

  // Se não houver par fechado mas houver batidas hoje, usa minutos padrão aproximados para simulação
  if (minutosTrabalhados === 0 && batidasColab.length > 0) {
    minutosTrabalhados = 500; // 8h 20m
  }

  // Soma a carga horária prevista das escalas na competência
  const escalasColab = escalas.filter(e => e.colaboradorId === colaboradorId && e.data.startsWith(competencia));
  const minutosPrevistos = escalasColab.reduce((acc, esc) => {
    const jor = jornadas.find(j => j.id === esc.jornadaId);
    return acc + (jor?.cargaMinutos || 480);
  }, 0) || 480;

  const delta = minutosTrabalhados - minutosPrevistos;
  const minutosExtras = Math.max(0, delta);
  const minutosDebito = Math.max(0, -delta);

  let saldo = bancoHoras.find(b => b.colaboradorId === colaboradorId && b.competencia === competencia);
  if (!saldo) {
    saldo = {
      id: `bh-${Date.now()}`,
      colaboradorId,
      colaboradorNome: colab.nome,
      competencia,
      minutosSaldo: delta,
      minutosExtras,
      minutosDebito,
      atualizadoEm: new Date().toISOString()
    };
    bancoHoras.push(saldo);
  } else {
    saldo.minutosSaldo = delta;
    saldo.minutosExtras = minutosExtras;
    saldo.minutosDebito = minutosDebito;
    saldo.atualizadoEm = new Date().toISOString();
  }

  registrarLogAuditoria('RECALCULOU_BANCO_HORAS', 'BancoHoras', saldo, req);
  res.json(saldo);
});

// 13. Fechamento Mensal (Com bloqueio de segurança em caso de pendências)
app.get('/api/fechamentos', (_, res) => {
  res.json(fechamentos);
});

app.post('/api/fechamentos/:competencia/fechar', (req: Request, res: Response) => {
  const { competencia } = req.params;

  // REGRA DE OURO DA FASE 4: Não permite fechar a competência se houver ajustes pendentes
  const pendencias = ajustes.filter(a => a.status === 'PENDENTE');
  if (pendencias.length > 0) {
    return res.status(409).json({
      erro: `Existem ${pendencias.length} ajuste(s) de ponto pendente(s). Regularize todas as solicitações antes de homologar o fechamento da competência ${competencia}.`,
      pendencias
    });
  }

  let f = fechamentos.find(item => item.competencia === competencia);
  if (!f) {
    f = {
      id: `fech-${Date.now()}`,
      competencia,
      status: 'FECHADO',
      fechadoEm: new Date().toISOString(),
      fechadoPor: (req as any).auth?.sub || 'usr-rh-01',
      observacao: `Competência ${competencia} fechada e homologada`,
      criadoEm: new Date().toISOString()
    };
    fechamentos.unshift(f);
  } else {
    f.status = 'FECHADO';
    f.fechadoEm = new Date().toISOString();
    f.fechadoPor = (req as any).auth?.sub || 'usr-rh-01';
  }

  registrarLogAuditoria('FECHOU_COMPETENCIA', 'FechamentoPonto', f, req);
  res.json(f);
});

// 14. Gestão de Dispositivos (Disk Ponto Mobile)
app.get('/api/dispositivos', (_, res) => {
  const lista = dispositivos.map(d => {
    const colab = colaboradores.find(c => c.id === d.colaboradorId);
    return { ...d, colaboradorNome: colab?.nome || 'Colaborador', colaborador: colab };
  });
  res.json(lista);
});

app.patch('/api/dispositivos/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['PENDENTE', 'AUTORIZADO', 'BLOQUEADO'].includes(status)) {
    return res.status(400).json({ erro: 'Status de dispositivo inválido. Use PENDENTE, AUTORIZADO ou BLOQUEADO.' });
  }

  const disp = dispositivos.find(d => d.id === id || d.identificador === id);
  if (!disp) return res.status(404).json({ erro: 'Dispositivo não encontrado.' });

  disp.status = status;
  disp.ultimoAcesso = new Date().toISOString();
  registrarLogAuditoria('ALTEROU_DISPOSITIVO', 'Dispositivo', { id, status }, req);

  res.json(disp);
});

// 15. Trilha Imutável de Auditoria
app.get('/api/auditoria', (_, res) => {
  res.json(auditoria);
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3333;
  app.listen(PORT, () => {
    console.log(`✓ RH Disk API V1.4 (Fase 4 Operacional) escutando na porta ${PORT}`);
  });
}
