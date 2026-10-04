// ============================================================================
// RH DISK V1 + DISK PONTO - PACOTE DE TIPOS COMPARTILHADOS (SHARED TYPES)
// ============================================================================

export type Perfil = 'ADMINISTRADOR' | 'RH' | 'GESTOR' | 'COLABORADOR';

export type TipoBatida = 'ENTRADA' | 'INICIO_INTERVALO' | 'FIM_INTERVALO' | 'SAIDA';

export type StatusBatida = 
  | 'VALIDADA' 
  | 'FORA_DA_AREA' 
  | 'PENDENTE_ANALISE' 
  | 'OFFLINE_SINCRONIZADA';

export type StatusAjuste = 'PENDENTE' | 'APROVADO' | 'REPROVADO';

export interface UsuarioDTO {
  id: string;
  email: string;
  perfil: Perfil;
  nome?: string;
  colaboradorId?: string;
  criadoEm?: string;
}

export interface ColaboradorDTO {
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
  tipoChavePix?: string;
  banco?: string;
  salario?: number;
  criadoEm?: string;
}

export interface LocalPontoDTO {
  id: string;
  nome: string;
  endereco?: string;
  latitude: number;
  longitude: number;
  raioMetros: number;
  ativo: boolean;
}

export interface JornadaDTO {
  id: string;
  nome: string;
  entrada: string;           // "08:00"
  inicioIntervalo?: string;  // "12:00"
  fimIntervalo?: string;     // "13:00"
  saida: string;             // "17:48"
  toleranciaMinutos?: number;
}

export interface EscalaDTO {
  id: string;
  colaboradorId: string;
  colaboradorNome?: string;
  jornadaId: string;
  jornadaNome?: string;
  localId: string;
  localNome?: string;
  data: string;              // "YYYY-MM-DD"
  eventoId?: string;
  eventoNome?: string;
}

export interface BatidaPontoDTO {
  id: string;
  nsr?: number;
  colaboradorId: string;
  colaboradorNome?: string;
  colaboradorMatricula?: string;
  tipo: TipoBatida;
  status: StatusBatida;
  instanteServidor: string;
  instanteDispositivo?: string;
  latitude: number;
  longitude: number;
  precisaoMetros?: number;
  distanciaLocalMetros?: number;
  localId?: string;
  localNome?: string;
  eventoId?: string;
  eventoNome?: string;
  offline: boolean;
  dispositivoId?: string;
  mockLocationSuspeita: boolean;
  comprovanteNsr?: string;
  hashIntegridade?: string;
  criadoEm: string;
}

export interface AjustePontoDTO {
  id: string;
  colaboradorId: string;
  colaboradorNome?: string;
  batidaId?: string;
  dataPonto: string;
  tipoBatida: TipoBatida;
  horarioCorreto: string;
  motivo: string;
  justificativa: string;
  status: StatusAjuste;
  solicitadoEm: string;
  analisadoEm?: string;
  analisadoPor?: string;
  parecer?: string;
}

export interface AuditoriaDTO {
  id: string;
  usuarioId?: string;
  usuarioNome?: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  dados?: any;
  criadoEm: string;
  ip?: string;
}

export interface DashboardMetricsDTO {
  colaboradoresAtivos: number;
  emFerias: number;
  batidasHoje: number;
  pendencias: number;
  horasExtrasMes: number;
  locaisAtivos: number;
  escalasHoje: number;
}

export interface RegistrarPontoInput {
  colaboradorId: string;
  tipo: TipoBatida;
  latitude: number;
  longitude: number;
  precisaoMetros?: number;
  instanteDispositivo?: string;
  dispositivoId?: string;
  localId?: string;
  eventoId?: string;
  offline?: boolean;
}

export interface ValidarGeofenceResponse {
  permitido: boolean;
  distanciaMetros: number;
  raioMetros: number;
  localNome: string;
  status: StatusBatida;
}
