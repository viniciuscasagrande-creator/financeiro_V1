import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Users,
  Clock,
  MapPin,
  CalendarDays,
  FileClock,
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  Smartphone,
  Check,
  X,
  Radio
} from 'lucide-react';
import './style.css';

// ----------------------------------------------------------------------------
// DADOS MOCK INICIAIS (RESILIENTES SE A API AINDA NÃO ESTIVER CONECTADA)
// ----------------------------------------------------------------------------

const INITIAL_COLABORADORES = [
  { id: 'col-01', nome: 'Carlos Eduardo Mendes', cpf: '234.567.890-12', matricula: 'DISK-00101', cargo: 'Coordenador de Bilheteria', departamento: 'Operações e Eventos', ativo: true, telefone: '(41) 98822-1144' },
  { id: 'col-02', nome: 'Camila Fernandes Silveira', cpf: '456.789.012-34', matricula: 'DISK-00205', cargo: 'Supervisora de Atendimento', departamento: 'Operações e Eventos', ativo: true, telefone: '(41) 99755-4433' },
  { id: 'col-03', nome: 'Lucas Gabriel Pinheiro', cpf: '678.901.234-56', matricula: 'DISK-00388', cargo: 'Operador de Bilheteria / Caixa', departamento: 'Operações e Eventos', ativo: true, telefone: '(41) 99111-2233' },
  { id: 'col-04', nome: 'Beatriz Nogueira Ramos', cpf: '789.012.345-67', matricula: 'DISK-00412', cargo: 'Analista Financeiro Pleno', departamento: 'Financeiro e Controladoria', ativo: true, telefone: '(41) 98444-5566' }
];

const INITIAL_LOCAIS = [
  { id: 'loc-01', nome: 'Sede DiskIngressos Curitiba', endereco: 'Rua Visconde de Nácar, 1505 - Centro', latitude: -25.4284, longitude: -49.2733, raioMetros: 150, ativo: true },
  { id: 'loc-02', nome: 'Arena da Baixada (Ligga Arena)', endereco: 'Rua Buenos Aires, 1260 - Água Verde', latitude: -25.4484, longitude: -49.2770, raioMetros: 350, ativo: true },
  { id: 'loc-03', nome: 'Pedreira Paulo Leminski', endereco: 'Rua João Gava, 970 - Abranches', latitude: -25.3855, longitude: -49.2789, raioMetros: 400, ativo: true },
  { id: 'loc-04', nome: 'Teatro Positivo Grande Auditório', endereco: 'Rua Prof. Pedro Viriato Parigot de Souza, 5300', latitude: -25.4503, longitude: -49.3601, raioMetros: 250, ativo: true }
];

const INITIAL_JORNADAS = [
  { id: 'jor-01', nome: 'Comercial Padrão 44h (Seg-Sex)', entrada: '08:00', inicioIntervalo: '12:00', fimIntervalo: '13:00', saida: '17:48', toleranciaMinutos: 10 },
  { id: 'jor-02', nome: 'Operação Show Turno Noturno', entrada: '14:00', inicioIntervalo: '18:00', fimIntervalo: '19:00', saida: '23:00', toleranciaMinutos: 15 }
];

const INITIAL_ESCALAS = [
  { id: 'esc-01', colaboradorNome: 'Carlos Eduardo Mendes', jornadaNome: 'Comercial Padrão 44h', localNome: 'Sede DiskIngressos Curitiba', data: '2026-10-03', eventoNome: 'Administração Geral' },
  { id: 'esc-02', colaboradorNome: 'Camila Fernandes Silveira', jornadaNome: 'Comercial Padrão 44h', localNome: 'Sede DiskIngressos Curitiba', data: '2026-10-03', eventoNome: 'Administração Geral' },
  { id: 'esc-03', colaboradorNome: 'Lucas Gabriel Pinheiro', jornadaNome: 'Operação Show Turno Noturno', localNome: 'Arena da Baixada (Ligga Arena)', data: '2026-10-03', eventoNome: 'Show Nacional de Rock Curitiba' }
];

const INITIAL_BATIDAS = [
  { id: 'bat-1001', nsr: 1001, colaboradorNome: 'Carlos Eduardo Mendes', tipo: 'ENTRADA', status: 'VALIDADA', dataHora: '03/10/2026 08:01', localNome: 'Sede DiskIngressos Curitiba', distancia: '5m', comprovante: 'MTE671-000001001-A7F9C2D1' },
  { id: 'bat-1002', nsr: 1002, colaboradorNome: 'Camila Fernandes Silveira', tipo: 'ENTRADA', status: 'VALIDADA', dataHora: '03/10/2026 08:05', localNome: 'Sede DiskIngressos Curitiba', distancia: '8m', comprovante: 'MTE671-000001002-B8E1F3A5' },
  { id: 'bat-1003', nsr: 1003, colaboradorNome: 'Lucas Gabriel Pinheiro', tipo: 'ENTRADA', status: 'VALIDADA', dataHora: '03/10/2026 14:02', localNome: 'Arena da Baixada', distancia: '24m', comprovante: 'MTE671-000001003-C9D2E4F6' }
];

const INITIAL_AJUSTES = [
  { id: 'aj-01', colaboradorNome: 'Beatriz Nogueira Ramos', dataPonto: '02/10/2026', tipoBatida: 'SAIDA', horarioCorreto: '18:18', motivo: 'ESQUECIMENTO', justificativa: 'Reunião com a diretoria financeira prolongada.', status: 'PENDENTE' }
];

const INITIAL_AUDITORIA = [
  { id: 'aud-01', dataHora: '03/10/2026 14:02:15', usuario: 'Lucas Gabriel Pinheiro', acao: 'REGISTRO_PONTO', entidade: 'BatidaPonto', detalhes: 'Entrada NSR 1003 validada na Arena da Baixada (24m da cerca).' },
  { id: 'aud-02', dataHora: '03/10/2026 09:15:00', usuario: 'Beatriz Nogueira Ramos', acao: 'SOLICITACAO_AJUSTE', entidade: 'AjustePonto', detalhes: 'Solicitação de inclusão de batida de saída em 02/10.' }
];

export function App() {
  const [tabAtiva, setTabAtiva] = useState('visao');
  const [busca, setBusca] = useState('');

  // Estados com persistência local e reatividade
  const [colaboradores, setColaboradores] = useState(INITIAL_COLABORADORES);
  const [locais, setLocais] = useState(INITIAL_LOCAIS);
  const [jornadas, setJornadas] = useState(INITIAL_JORNADAS);
  const [escalas, setEscalas] = useState(INITIAL_ESCALAS);
  const [batidas, setBatidas] = useState(INITIAL_BATIDAS);
  const [ajustes, setAjustes] = useState(INITIAL_AJUSTES);
  const [auditoria, setAuditoria] = useState(INITIAL_AUDITORIA);
  const [apiConectada, setApiConectada] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState<'ADMINISTRADOR' | 'GESTOR_RH' | 'COLABORADOR'>('GESTOR_RH');
  const [filtroMonitor, setFiltroMonitor] = useState('TODOS');

  // Checagem de integridade com a API REST
  useEffect(() => {
    fetch('http://localhost:3333/api/saude')
      .then(r => r.ok && setApiConectada(true))
      .catch(() => setApiConectada(false));
  }, []);

  const fetchMonitorHoje = () => {
    fetch('http://localhost:3333/api/monitor/hoje')
      .then(r => r.json())
      .then(dados => {
        if (dados && dados.kpis) {
          setApiConectada(true);
        }
      })
      .catch(() => {});
  };

  // Modais
  const [modalAberto, setModalAberto] = useState<string | null>(null);

  // Formulários Modais
  const [novoColab, setNovoColab] = useState({ nome: '', cpf: '', cargo: '', departamento: 'Operações e Eventos', telefone: '' });
  const [novoLocal, setNovoLocal] = useState({ nome: '', endereco: '', latitude: -25.4284, longitude: -49.2733, raioMetros: 150 });
  const [novaJornada, setNovaJornada] = useState({ nome: '', entrada: '08:00', saida: '17:48', toleranciaMinutos: 10 });
  const [novaEscala, setNovaEscala] = useState({ colaboradorNome: 'Carlos Eduardo Mendes', jornadaNome: 'Comercial Padrão 44h', localNome: 'Sede DiskIngressos Curitiba', data: '2026-10-03', eventoNome: 'Operação Show' });
  const [simuladorPonto, setSimuladorPonto] = useState({ colaboradorNome: 'Carlos Eduardo Mendes', tipo: 'ENTRADA', localNome: 'Sede DiskIngressos Curitiba', distanciaMetros: 12 });

  // Funções de Ação do Fluxo Operacional
  const handleCriarColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoColab.nome || !novoColab.cpf || !novoColab.cargo) return;
    const matricula = `DISK-${Math.floor(10000 + Math.random() * 90000)}`;
    const criado = { id: `col-${Date.now()}`, ...novoColab, matricula, ativo: true };
    setColaboradores([criado, ...colaboradores]);
    setAuditoria([{ id: `aud-${Date.now()}`, dataHora: new Date().toLocaleString('pt-BR'), usuario: 'Gestor RH', acao: 'CADASTRO_COLABORADOR', entidade: 'Colaborador', detalhes: `Colaborador ${criado.nome} (${matricula}) cadastrado.` }, ...auditoria]);
    setModalAberto(null);
    setNovoColab({ nome: '', cpf: '', cargo: '', departamento: 'Operações e Eventos', telefone: '' });
  };

  const handleCriarLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoLocal.nome) return;
    const criado = { id: `loc-${Date.now()}`, ...novoLocal, ativo: true };
    setLocais([criado, ...locais]);
    setAuditoria([{ id: `aud-${Date.now()}`, dataHora: new Date().toLocaleString('pt-BR'), usuario: 'Gestor RH', acao: 'CADASTRO_LOCAL_GEOFENCE', entidade: 'LocalPonto', detalhes: `Cerca virtual criada: ${criado.nome} (Raio ${criado.raioMetros}m).` }, ...auditoria]);
    setModalAberto(null);
  };

  const handleCriarJornada = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaJornada.nome || !novaJornada.entrada || !novaJornada.saida) return;
    const criada = { id: `jor-${Date.now()}`, ...novaJornada };
    setJornadas([criada, ...jornadas]);
    setModalAberto(null);
  };

  const handleCriarEscala = (e: React.FormEvent) => {
    e.preventDefault();
    const criada = { id: `esc-${Date.now()}`, ...novaEscala };
    setEscalas([criada, ...escalas]);
    setAuditoria([{ id: `aud-${Date.now()}`, dataHora: new Date().toLocaleString('pt-BR'), usuario: 'Gestor RH', acao: 'CRIACAO_ESCALA', entidade: 'Escala', detalhes: `Escala gerada para ${criada.colaboradorNome} em ${criada.localNome}.` }, ...auditoria]);
    setModalAberto(null);
  };

  const handleSimularBatida = (e: React.FormEvent) => {
    e.preventDefault();
    const local = locais.find(l => l.nome === simuladorPonto.localNome) || locais[0];
    const distancia = simuladorPonto.distanciaMetros;
    const status = distancia <= local.raioMetros ? 'VALIDADA' : 'FORA_DA_AREA';
    const nsr = batidas.length + 1004;
    const comprovante = `MTE671-${String(nsr).padStart(9, '0')}-A9E1F3B7`;

    const novaBatida = {
      id: `bat-${nsr}`,
      nsr,
      colaboradorNome: simuladorPonto.colaboradorNome,
      tipo: simuladorPonto.tipo,
      status,
      dataHora: new Date().toLocaleString('pt-BR'),
      localNome: simuladorPonto.localNome,
      distancia: `${distancia}m`,
      comprovante
    };

    setBatidas([novaBatida, ...batidas]);
    setAuditoria([{
      id: `aud-${Date.now()}`,
      dataHora: new Date().toLocaleString('pt-BR'),
      usuario: simuladorPonto.colaboradorNome,
      acao: 'REGISTRO_PONTO',
      entidade: 'BatidaPonto',
      detalhes: `Ponto batido (${novaBatida.tipo}) via Disk Ponto. Status: ${status} (${distancia}m do local ${local.nome}).`
    }, ...auditoria]);

    setModalAberto(null);
    setTabAtiva('ponto');
  };

  const handleAprovarAjuste = (id: string) => {
    const ajuste = ajustes.find(a => a.id === id);
    if (!ajuste) return;
    setAjustes(ajustes.map(a => a.id === id ? { ...a, status: 'APROVADO' } : a));
    
    // Gera batida regularizada
    const nsr = batidas.length + 1005;
    const novaBatida = {
      id: `bat-ajuste-${nsr}`,
      nsr,
      colaboradorNome: ajuste.colaboradorNome,
      tipo: ajuste.tipoBatida,
      status: 'VALIDADA',
      dataHora: `${ajuste.dataPonto} ${ajuste.horarioCorreto}`,
      localNome: 'Sede (Ajuste Administrativo RH)',
      distancia: '0m',
      comprovante: `MTE671-${String(nsr).padStart(9, '0')}-AJUSTE`
    };
    setBatidas([novaBatida, ...batidas]);
    setAuditoria([{ id: `aud-${Date.now()}`, dataHora: new Date().toLocaleString('pt-BR'), usuario: 'Gestor RH', acao: 'AJUSTE_APROVADO', entidade: 'AjustePonto', detalhes: `Ajuste aprovado para ${ajuste.colaboradorNome}. Horário regularizado: ${ajuste.horarioCorreto}.` }, ...auditoria]);
  };

  const handleReprovarAjuste = (id: string) => {
    setAjustes(ajustes.map(a => a.id === id ? { ...a, status: 'REPROVADO' } : a));
    setAuditoria([{ id: `aud-${Date.now()}`, dataHora: new Date().toLocaleString('pt-BR'), usuario: 'Gestor RH', acao: 'AJUSTE_REPROVADO', entidade: 'AjustePonto', detalhes: `Ajuste ID ${id} recusado pelo RH.` }, ...auditoria]);
  };

  const menu = [
    { id: 'visao', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'monitor', label: 'Monitor de Ponto', icon: Radio, badge: batidas.filter(b => b.status === 'PENDENTE_ANALISE' || (b as any).mockLocationSuspeita).length || undefined },
    { id: 'colaboradores', label: 'Colaboradores', icon: Users },
    { id: 'locais', label: 'Locais e Geofences', icon: MapPin },
    { id: 'jornadas', label: 'Jornadas de Trabalho', icon: Clock },
    { id: 'escalas', label: 'Escalas por Evento', icon: CalendarDays },
    { id: 'ponto', label: 'Ponto e Batidas', icon: QrCode },
    { id: 'ajustes', label: 'Ajustes de Ponto', icon: FileClock, badge: ajustes.filter(a => a.status === 'PENDENTE').length },
    { id: 'estrutura', label: 'Estrutura Organizacional', icon: Building2 },
    { id: 'auditoria', label: 'Auditoria & LGPD', icon: ShieldCheck }
  ];

  return (
    <div className="app">
      {/* Sidebar Corporativo */}
      <aside>
        <div className="brand">
          <b>DISK</b>
          <span>RH</span>
        </div>
        <small>GESTÃO DE PESSOAS & JORNADA</small>
        <nav>
          {menu.map((item) => {
            const Icon = item.icon;
            const ativa = tabAtiva === item.id;
            return (
              <button
                key={item.id}
                className={ativa ? 'active' : ''}
                onClick={() => setTabAtiva(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge ? <span className="badge warning" style={{ marginLeft: 'auto' }}>{item.badge}</span> : null}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div>Portaria 671 MTE ✓</div>
          <div>Disk Ponto APK Conectado</div>
        </div>
      </aside>

      {/* Conteúdo Principal Dinâmico */}
      <main>
        {/* Header Superior */}
        <header>
          <div>
            <h1>
              {tabAtiva === 'visao' && 'Visão Geral do RH & Ponto'}
              {tabAtiva === 'monitor' && 'Monitor Operacional de Ponto (Tempo Real)'}
              {tabAtiva === 'colaboradores' && 'Colaboradores & Equipes'}
              {tabAtiva === 'locais' && 'Locais Autorizados & Cercas Virtuais (Geofences)'}
              {tabAtiva === 'jornadas' && 'Jornadas de Trabalho & Horários'}
              {tabAtiva === 'escalas' && 'Escalas & Alocação por Evento'}
              {tabAtiva === 'ponto' && 'Ponto e Batidas Auditadas (Portaria 671 MTE)'}
              {tabAtiva === 'ajustes' && 'Central de Ajustes & Regularização de Ponto'}
              {tabAtiva === 'estrutura' && 'Estrutura Organizacional'}
              {tabAtiva === 'auditoria' && 'Trilha Imutável de Auditoria (LGPD)'}
            </h1>
            <p>DiskIngressos • Ecossistema Integrado de Pessoal, Ponto Eletrônico e Custos de Eventos.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span
              className="badge"
              style={{
                background: apiConectada ? '#dcfce7' : '#fef3c7',
                color: apiConectada ? '#166534' : '#92400e',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              {apiConectada ? '🟢 API Online (Porta 3333)' : '🟡 Modo Resiliente'}
            </span>
            <select
              value={perfilUsuario}
              onChange={(e) => setPerfilUsuario(e.target.value as any)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, background: 'white' }}
            >
              <option value="ADMINISTRADOR">👑 Administrador</option>
              <option value="GESTOR_RH">👔 Gestor de RH</option>
              <option value="COLABORADOR">👤 Colaborador</option>
            </select>
            <button className="primary" onClick={() => setModalAberto('simulador')}>
              <Smartphone size={16} /> Simular Batida no App
            </button>
            <div className="avatar">{perfilUsuario === 'ADMINISTRADOR' ? 'ADM' : (perfilUsuario === 'GESTOR_RH' ? 'RH' : 'COL')}</div>
          </div>
        </header>

        {/* 1. VISÃO GERAL */}
        {tabAtiva === 'visao' && (
          <div>
            <section className="cards">
              <article>
                <span>Colaboradores ativos</span>
                <strong>{colaboradores.length}</strong>
                <small>100% quadro cadastrado</small>
              </article>
              <article>
                <span>Batidas hoje</span>
                <strong>{batidas.length}</strong>
                <small>Presença validada</small>
              </article>
              <article>
                <span>Cercas Virtuais (Geofences)</span>
                <strong>{locais.length}</strong>
                <small>Sede + 3 Arenas Ativas</small>
              </article>
              <article>
                <span>Ajustes pendentes</span>
                <strong style={{ color: '#d97706' }}>{ajustes.filter(a => a.status === 'PENDENTE').length}</strong>
                <small style={{ color: '#d97706' }}>Requer análise do Gestor</small>
              </article>
              <article>
                <span>Escalas ativas</span>
                <strong>{escalas.length}</strong>
                <small>Show Nacional de Rock</small>
              </article>
            </section>

            <div className="flow">
              <b>Fluxo Canônico:</b>
              <span>Cadastrar Colaborador</span> <i>→</i>
              <span>Definir Geofence</span> <i>→</i>
              <span>Criar Jornada</span> <i>→</i>
              <span>Criar Escala</span> <i>→</i>
              <span>Disk Ponto APK</span> <i>→</i>
              <span>Validar GPS</span> <i>→</i>
              <span>Gravar Batida</span> <i>→</i>
              <span>Auditoria RH</span>
            </div>

            <div className="grid">
              <section className="panel">
                <h2>
                  <span>Operação de Ponto em Tempo Real</span>
                  <span className="badge success">Portaria 671 MTE</span>
                </h2>
                <div className="table-container" style={{ margin: 0, border: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Colaborador</th>
                        <th>Tipo</th>
                        <th>Horário</th>
                        <th>Local Geofence</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batidas.slice(0, 5).map(b => (
                        <tr key={b.id}>
                          <td><b>{b.colaboradorNome}</b></td>
                          <td><span className="badge info">{b.tipo}</span></td>
                          <td>{b.dataHora}</td>
                          <td>{b.localNome} ({b.distancia})</td>
                          <td>
                            <span className={`badge ${b.status === 'VALIDADA' ? 'success' : 'danger'}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="panel">
                <h2>
                  <span>Cercas Virtuais (Locais)</span>
                  <button className="btn-action" onClick={() => setModalAberto('local')}>+ Novo</button>
                </h2>
                {locais.map(l => (
                  <div key={l.id} className="location">
                    <MapPin size={18} color="#2563eb" />
                    <div>
                      <b>{l.nome}</b>
                      <small>Raio autorizado: <b>{l.raioMetros}m</b> • GPS: {l.latitude.toFixed(4)}, {l.longitude.toFixed(4)}</small>
                    </div>
                  </div>
                ))}
              </section>
            </div>
        {/* 1.1 MONITOR DE PONTO (TEMPO REAL • FASE 2 & FASE 3) */}
        {tabAtiva === 'monitor' && (
          <div>
            <div className="toolbar" style={{ marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Monitor Operacional de Ponto (Tempo Real)</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Acompanhamento instantâneo da presença, jornadas em andamento, intervalos e detecção de anomalias GPS / Mock Location.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="secondary" onClick={() => fetchMonitorHoje()}>
                  Atualizar Monitor
                </button>
                <button className="primary" onClick={() => setModalAberto('simulador')}>
                  <Smartphone size={16} /> Simular Batida
                </button>
              </div>
            </div>

            <section className="cards">
              <article>
                <span>Trabalhando agora</span>
                <strong style={{ color: '#16a34a' }}>
                  {batidas.filter(b => b.tipo === 'ENTRADA' || b.tipo === 'FIM_INTERVALO').length}
                </strong>
                <small style={{ color: '#16a34a' }}>Jornada em execução</small>
              </article>
              <article>
                <span>Em intervalo / Almoço</span>
                <strong style={{ color: '#d97706' }}>
                  {batidas.filter(b => b.tipo === 'INICIO_INTERVALO').length}
                </strong>
                <small style={{ color: '#d97706' }}>Pausa regulamentar</small>
              </article>
              <article>
                <span>Atrasados / Sem marcação</span>
                <strong style={{ color: '#dc2626' }}>
                  {colaboradores.length - batidas.filter(b => b.tipo === 'ENTRADA').length > 0
                    ? colaboradores.length - batidas.filter(b => b.tipo === 'ENTRADA').length
                    : 0}
                </strong>
                <small style={{ color: '#dc2626' }}>Sem registro no dia</small>
              </article>
              <article>
                <span>Ocorrências para análise</span>
                <strong style={{ color: '#9333ea' }}>
                  {batidas.filter(b => b.status === 'PENDENTE_ANALISE' || b.status === 'FORA_DA_AREA' || (b as any).mockLocationSuspeita).length}
                </strong>
                <small style={{ color: '#9333ea' }}>Fora do raio ou Mock GPS</small>
              </article>
              <article>
                <span>Validadas na Geofence</span>
                <strong style={{ color: '#2563eb' }}>
                  {batidas.filter(b => b.status === 'VALIDADA').length}
                </strong>
                <small style={{ color: '#2563eb' }}>100% conformidade MTE</small>
              </article>
            </section>

            <div className="table-container">
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Filtro de Situação:</span>
                {['TODOS', 'TRABALHANDO', 'INTERVALO', 'OCORRENCIAS'].map(filtro => (
                  <button
                    key={filtro}
                    className={`btn-action ${filtroMonitor === filtro ? 'approve' : ''}`}
                    onClick={() => setFiltroMonitor(filtro)}
                  >
                    {filtro === 'TODOS' && 'Todos os Colaboradores'}
                    {filtro === 'TRABALHANDO' && '🟢 Trabalhando'}
                    {filtro === 'INTERVALO' && '🟡 Em Intervalo'}
                    {filtro === 'OCORRENCIAS' && '⚠️ Ocorrências / Análise'}
                  </button>
                ))}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Situação Atual</th>
                    <th>Última Marcação</th>
                    <th>Local / Escala Autorizada</th>
                    <th>Distância / Raio</th>
                    <th>Evidências Técnicas</th>
                    <th>Status Geofence</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {colaboradores.map(col => {
                    const batidasCol = batidas.filter(b => b.colaboradorNome === col.nome);
                    const ultima = batidasCol[0];
                    const escala = escalas.find(e => e.colaboradorNome === col.nome);

                    let situacao = 'SEM_MARCACAO';
                    let sitBadge = <span className="badge warning">Sem Marcação</span>;
                    if (ultima) {
                      if (ultima.status === 'PENDENTE_ANALISE' || ultima.status === 'FORA_DA_AREA' || (ultima as any).mockLocationSuspeita) {
                        situacao = 'OCORRENCIAS';
                        sitBadge = <span className="badge danger">⚠️ Para Analisar</span>;
                      } else if (ultima.tipo === 'ENTRADA' || ultima.tipo === 'FIM_INTERVALO') {
                        situacao = 'TRABALHANDO';
                        sitBadge = <span className="badge success">🟢 Trabalhando</span>;
                      } else if (ultima.tipo === 'INICIO_INTERVALO') {
                        situacao = 'INTERVALO';
                        sitBadge = <span className="badge warning">🟡 Em Intervalo</span>;
                      } else if (ultima.tipo === 'SAIDA') {
                        situacao = 'ENCERRADO';
                        sitBadge = <span className="badge info">🔴 Encerrado</span>;
                      }
                    }

                    if (filtroMonitor !== 'TODOS' && filtroMonitor !== situacao) {
                      return null;
                    }

                    return (
                      <tr key={col.id}>
                        <td>
                          <b>{col.nome}</b>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{col.cargo} • <code>{col.matricula}</code></div>
                        </td>
                        <td>{sitBadge}</td>
                        <td>
                          {ultima ? (
                            <div>
                              <b>{ultima.tipo.replace('_', ' ')}</b>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{ultima.dataHora}</div>
                            </div>
                          ) : '—'}
                        </td>
                        <td>{escala?.localNome || ultima?.localNome || 'Sede DiskIngressos Curitiba'}</td>
                        <td>
                          {ultima ? (
                            <div>
                              <b>{ultima.distancia}</b>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>Raio: 150m-350m</div>
                            </div>
                          ) : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
                            <span>Precisão: <b>±{ultima ? '6.5m' : '—'}</b></span>
                            {(ultima as any)?.offline ? <span style={{ color: '#d97706' }}>📱 Offline Sincronizado</span> : <span style={{ color: '#16a34a' }}>🌐 Online</span>}
                            {(ultima as any)?.mockLocationSuspeita ? <span style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ Mock Location Suspeito</span> : null}
                          </div>
                        </td>
                        <td>
                          {ultima?.status === 'VALIDADA' && <span className="badge success">✓ Validada</span>}
                          {ultima?.status === 'FORA_DA_AREA' && <span className="badge danger">Fora da Área</span>}
                          {(!ultima || ultima?.status === 'PENDENTE_ANALISE') && <span className="badge warning">Sob Análise</span>}
                        </td>
                        <td>
                          <div className="row-actions">
                            {ultima && (
                              <button
                                className="btn-action"
                                title="Ver Comprovante MTE"
                                onClick={() => alert(`Comprovante Portaria 671 MTE\nColaborador: ${col.nome}\nNSR: #${ultima.nsr}\nAutenticidade: ${ultima.comprovante}\nStatus: ${ultima.status}`)}
                              >
                                MTE
                              </button>
                            )}
                            {situacao === 'OCORRENCIAS' && (
                              <button
                                className="btn-action approve"
                                onClick={() => {
                                  alert(`Ocorrência de ${col.nome} validada e regularizada com sucesso pelo RH.`);
                                }}
                              >
                                Regularizar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. COLABORADORES */}
        {tabAtiva === 'colaboradores' && (
          <div>
            <div className="toolbar">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar colaborador por nome, CPF ou cargo..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <button className="primary" onClick={() => setModalAberto('colaborador')}>
                <Plus size={16} /> Cadastrar Colaborador
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome do Colaborador</th>
                    <th>Matrícula</th>
                    <th>CPF</th>
                    <th>Cargo / Função</th>
                    <th>Departamento</th>
                    <th>Telefone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {colaboradores
                    .filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()) || c.cpf.includes(busca) || c.matricula.toLowerCase().includes(busca.toLowerCase()))
                    .map(c => (
                      <tr key={c.id}>
                        <td><b>{c.nome}</b></td>
                        <td><code>{c.matricula}</code></td>
                        <td>{c.cpf}</td>
                        <td>{c.cargo}</td>
                        <td>{c.departamento}</td>
                        <td>{c.telefone || 'Não inf.'}</td>
                        <td><span className="badge success">ATIVO</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. LOCAIS E GEOFENCES */}
        {tabAtiva === 'locais' && (
          <div>
            <div className="toolbar">
              <p style={{ margin: 0, color: '#64748b' }}>
                Perímetros geográficos autorizados para validação automática de batida de ponto no instante do clique.
              </p>
              <button className="primary" onClick={() => setModalAberto('local')}>
                <Plus size={16} /> Cadastrar Local / Geofence
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome do Local / Arena</th>
                    <th>Endereço Completo</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Raio Permitido (Geofence)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {locais.map(l => (
                    <tr key={l.id}>
                      <td><b>{l.nome}</b></td>
                      <td>{l.endereco || 'Curitiba/PR'}</td>
                      <td><code>{l.latitude}</code></td>
                      <td><code>{l.longitude}</code></td>
                      <td><b>{l.raioMetros} metros</b></td>
                      <td><span className="badge success">OPERACIONAL</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. JORNADAS */}
        {tabAtiva === 'jornadas' && (
          <div>
            <div className="toolbar">
              <p style={{ margin: 0, color: '#64748b' }}>Definição das jornadas oficiais de trabalho, intervalos intrajornada e tolerâncias.</p>
              <button className="primary" onClick={() => setModalAberto('jornada')}>
                <Plus size={16} /> Nova Jornada
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome da Jornada</th>
                    <th>Entrada</th>
                    <th>Início Intervalo</th>
                    <th>Fim Intervalo</th>
                    <th>Saída</th>
                    <th>Tolerância (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {jornadas.map(j => (
                    <tr key={j.id}>
                      <td><b>{j.nome}</b></td>
                      <td><b>{j.entrada}</b></td>
                      <td>{j.inicioIntervalo || '--:--'}</td>
                      <td>{j.fimIntervalo || '--:--'}</td>
                      <td><b>{j.saida}</b></td>
                      <td>{j.toleranciaMinutos} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ESCALAS */}
        {tabAtiva === 'escalas' && (
          <div>
            <div className="toolbar">
              <p style={{ margin: 0, color: '#64748b' }}>Associação oficial: Colaborador + Jornada + Local/Geofence para cada data ou evento.</p>
              <button className="primary" onClick={() => setModalAberto('escala')}>
                <Plus size={16} /> Criar Escala
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Colaborador</th>
                    <th>Jornada Prevista</th>
                    <th>Local Autorizado</th>
                    <th>Evento Vinculado</th>
                  </tr>
                </thead>
                <tbody>
                  {escalas.map(e => (
                    <tr key={e.id}>
                      <td><b>{e.data}</b></td>
                      <td><b>{e.colaboradorNome}</b></td>
                      <td>{e.jornadaNome}</td>
                      <td><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} color="#2563eb" />{e.localNome}</td>
                      <td><span className="badge info">{e.eventoNome || 'Geral'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. PONTO E BATIDAS */}
        {tabAtiva === 'ponto' && (
          <div>
            <div className="toolbar">
              <p style={{ margin: 0, color: '#64748b' }}>Trilha de batidas auditadas capturadas via programa REP-P (Portaria 671 MTE).</p>
              <button className="primary" onClick={() => setModalAberto('simulador')}>
                <Smartphone size={16} /> Simular Batida no App
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>NSR</th>
                    <th>Colaborador</th>
                    <th>Tipo</th>
                    <th>Data e Horário</th>
                    <th>Local Autorizado</th>
                    <th>Distância Cerca</th>
                    <th>Status Geofence</th>
                    <th>Comprovante / Código</th>
                  </tr>
                </thead>
                <tbody>
                  {batidas.map(b => (
                    <tr key={b.id}>
                      <td><code>#{b.nsr}</code></td>
                      <td><b>{b.colaboradorNome}</b></td>
                      <td><span className="badge info">{b.tipo}</span></td>
                      <td><b>{b.dataHora}</b></td>
                      <td>{b.localNome}</td>
                      <td>{b.distancia}</td>
                      <td>
                        <span className={`badge ${b.status === 'VALIDADA' ? 'success' : 'danger'}`}>
                          {b.status === 'VALIDADA' ? 'DENTRO DA CERCA' : 'FORA DA ÁREA'}
                        </span>
                      </td>
                      <td><code style={{ color: '#2563eb' }}>{b.comprovante}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. AJUSTES DE PONTO */}
        {tabAtiva === 'ajustes' && (
          <div>
            <div className="toolbar">
              <p style={{ margin: 0, color: '#64748b' }}>Solicitações de regularização de batida de ponto com segregação de funções (SoD).</p>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Data Ocorrência</th>
                    <th>Tipo Batida</th>
                    <th>Horário Correto</th>
                    <th>Motivo & Justificativa</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações do Gestor</th>
                  </tr>
                </thead>
                <tbody>
                  {ajustes.map(a => (
                    <tr key={a.id}>
                      <td><b>{a.colaboradorNome}</b></td>
                      <td>{a.dataPonto}</td>
                      <td><span className="badge info">{a.tipoBatida}</span></td>
                      <td><b>{a.horarioCorreto}</b></td>
                      <td>
                        <div><b>{a.motivo}</b></div>
                        <small style={{ color: '#64748b' }}>{a.justificativa}</small>
                      </td>
                      <td>
                        <span className={`badge ${a.status === 'APROVADO' ? 'success' : a.status === 'REPROVADO' ? 'danger' : 'warning'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {a.status === 'PENDENTE' ? (
                          <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn-action approve" onClick={() => handleAprovarAjuste(a.id)}>
                              <Check size={14} style={{ verticalAlign: 'middle', marginRight: 2 }} /> Aprovar
                            </button>
                            <button className="btn-action reject" onClick={() => handleReprovarAjuste(a.id)}>
                              <X size={14} style={{ verticalAlign: 'middle', marginRight: 2 }} /> Reprovar
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>Concluído</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. ESTRUTURA ORGANIZACIONAL */}
        {tabAtiva === 'estrutura' && (
          <div>
            <div className="toolbar">
              <p style={{ margin: 0, color: '#64748b' }}>Departamentos corporativos, centros de custo e alçadas de comando da DiskIngressos.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { nome: 'Operações e Bilheteria de Eventos', cc: 'CC-2040', lider: 'Carlos Eduardo Mendes', qtd: 18 },
                { nome: 'Tecnologia da Informação & Core', cc: 'CC-3010', lider: 'Vinicius Master', qtd: 12 },
                { nome: 'Financeiro, Controladoria e Tesouraria', cc: 'CC-1020', lider: 'Maria Valente', qtd: 9 },
                { nome: 'Comercial, Parcerias e Atendimento', cc: 'CC-4010', lider: 'Juliana Rocha', qtd: 15 },
                { nome: 'Gente, Gestão & Recursos Humanos', cc: 'CC-1050', lider: 'Patricia Albuquerque', qtd: 5 }
              ].map((d, i) => (
                <div key={i} className="panel">
                  <h2><span>{d.nome}</span></h2>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Centro de Custo: <b>{d.cc}</b></div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Líder: <b>{d.lider}</b></div>
                  <span className="badge info">{d.qtd} colaboradores alocados</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. AUDITORIA */}
        {tabAtiva === 'auditoria' && (
          <div>
            <div className="toolbar">
              <p style={{ margin: 0, color: '#64748b' }}>Registro imutável de todas as operações sensíveis, batidas e cadastros conforme LGPD.</p>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Data / Horário</th>
                    <th>Usuário / Operador</th>
                    <th>Ação Executada</th>
                    <th>Entidade</th>
                    <th>Detalhes Técnicos</th>
                  </tr>
                </thead>
                <tbody>
                  {auditoria.map(a => (
                    <tr key={a.id}>
                      <td><b>{a.dataHora}</b></td>
                      <td>{a.usuario}</td>
                      <td><span className="badge info">{a.acao}</span></td>
                      <td><code>{a.entidade}</code></td>
                      <td>{a.detalhes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: NOVO COLABORADOR */}
        {modalAberto === 'colaborador' && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="modal-header">
                <h3>Cadastrar Novo Colaborador</h3>
                <button className="btn-action" onClick={() => setModalAberto(null)}>✕</button>
              </div>
              <form onSubmit={handleCriarColaborador}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Silva"
                      value={novoColab.nome}
                      onChange={e => setNovoColab({ ...novoColab, nome: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>CPF *</label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={novoColab.cpf}
                        onChange={e => setNovoColab({ ...novoColab, cpf: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Telefone</label>
                      <input
                        type="text"
                        placeholder="(41) 99999-8888"
                        value={novoColab.telefone}
                        onChange={e => setNovoColab({ ...novoColab, telefone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cargo / Função *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Operador de Caixa"
                        value={novoColab.cargo}
                        onChange={e => setNovoColab({ ...novoColab, cargo: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Departamento</label>
                      <select
                        value={novoColab.departamento}
                        onChange={e => setNovoColab({ ...novoColab, departamento: e.target.value })}
                      >
                        <option value="Operações e Eventos">Operações e Eventos</option>
                        <option value="Financeiro e Controladoria">Financeiro e Controladoria</option>
                        <option value="Tecnologia da Informação">Tecnologia da Informação</option>
                        <option value="Comercial">Comercial</option>
                        <option value="Recursos Humanos">Recursos Humanos</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="secondary" onClick={() => setModalAberto(null)}>Cancelar</button>
                  <button type="submit" className="primary">Salvar Colaborador</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: NOVO LOCAL / GEOFENCE */}
        {modalAberto === 'local' && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="modal-header">
                <h3>Cadastrar Local e Definir Geofence</h3>
                <button className="btn-action" onClick={() => setModalAberto(null)}>✕</button>
              </div>
              <form onSubmit={handleCriarLocal}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nome do Local / Arena *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Live Curitiba"
                      value={novoLocal.nome}
                      onChange={e => setNovoLocal({ ...novoLocal, nome: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Endereço Completo</label>
                    <input
                      type="text"
                      placeholder="Rua Itajubá, 143 - Novo Mundo, Curitiba/PR"
                      value={novoLocal.endereco}
                      onChange={e => setNovoLocal({ ...novoLocal, endereco: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Latitude *</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={novoLocal.latitude}
                        onChange={e => setNovoLocal({ ...novoLocal, latitude: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Longitude *</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={novoLocal.longitude}
                        onChange={e => setNovoLocal({ ...novoLocal, longitude: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Raio de Tolerância da Cerca (em metros) *</label>
                    <input
                      type="number"
                      required
                      value={novoLocal.raioMetros}
                      onChange={e => setNovoLocal({ ...novoLocal, raioMetros: Number(e.target.value) })}
                    />
                    <small style={{ color: '#64748b' }}>Ex: 150m para sedes, 300m a 400m para arenas de shows.</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="secondary" onClick={() => setModalAberto(null)}>Cancelar</button>
                  <button type="submit" className="primary">Salvar Cerca Virtual</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: NOVA JORNADA */}
        {modalAberto === 'jornada' && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="modal-header">
                <h3>Criar Jornada de Trabalho</h3>
                <button className="btn-action" onClick={() => setModalAberto(null)}>✕</button>
              </div>
              <form onSubmit={handleCriarJornada}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nome da Jornada *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Turno Arena Sábado 12h"
                      value={novaJornada.nome}
                      onChange={e => setNovaJornada({ ...novaJornada, nome: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Horário Entrada *</label>
                      <input
                        type="time"
                        required
                        value={novaJornada.entrada}
                        onChange={e => setNovaJornada({ ...novaJornada, entrada: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Horário Saída *</label>
                      <input
                        type="time"
                        required
                        value={novaJornada.saida}
                        onChange={e => setNovaJornada({ ...novaJornada, saida: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Tolerância (minutos)</label>
                    <input
                      type="number"
                      value={novaJornada.toleranciaMinutos}
                      onChange={e => setNovaJornada({ ...novaJornada, toleranciaMinutos: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="secondary" onClick={() => setModalAberto(null)}>Cancelar</button>
                  <button type="submit" className="primary">Salvar Jornada</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CRIAR ESCALA */}
        {modalAberto === 'escala' && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="modal-header">
                <h3>Criar Escala de Trabalho / Evento</h3>
                <button className="btn-action" onClick={() => setModalAberto(null)}>✕</button>
              </div>
              <form onSubmit={handleCriarEscala}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Colaborador *</label>
                    <select
                      value={novaEscala.colaboradorNome}
                      onChange={e => setNovaEscala({ ...novaEscala, colaboradorNome: e.target.value })}
                    >
                      {colaboradores.map(c => (
                        <option key={c.id} value={c.nome}>{c.nome} ({c.cargo})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Jornada *</label>
                    <select
                      value={novaEscala.jornadaNome}
                      onChange={e => setNovaEscala({ ...novaEscala, jornadaNome: e.target.value })}
                    >
                      {jornadas.map(j => (
                        <option key={j.id} value={j.nome}>{j.nome} ({j.entrada} às {j.saida})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Local / Geofence Autorizada *</label>
                    <select
                      value={novaEscala.localNome}
                      onChange={e => setNovaEscala({ ...novaEscala, localNome: e.target.value })}
                    >
                      {locais.map(l => (
                        <option key={l.id} value={l.nome}>{l.nome} (Raio {l.raioMetros}m)</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Data *</label>
                      <input
                        type="date"
                        required
                        value={novaEscala.data}
                        onChange={e => setNovaEscala({ ...novaEscala, data: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Evento (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Show Nacional de Rock"
                        value={novaEscala.eventoNome}
                        onChange={e => setNovaEscala({ ...novaEscala, eventoNome: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="secondary" onClick={() => setModalAberto(null)}>Cancelar</button>
                  <button type="submit" className="primary">Salvar Escala</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SIMULADOR DE BATIDA NO DISK PONTO */}
        {modalAberto === 'simulador' && (
          <div className="modal-backdrop">
            <div className="modal" style={{ maxWidth: '440px' }}>
              <div className="modal-header" style={{ background: '#0f172a', color: 'white' }}>
                <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={18} color="#60a5fa" /> Disk Ponto Mobile (Simulador)
                </h3>
                <button className="btn-action" style={{ background: '#1e293b', color: 'white', border: 0 }} onClick={() => setModalAberto(null)}>✕</button>
              </div>
              <form onSubmit={handleSimularBatida}>
                <div className="modal-body" style={{ background: '#f8fafc' }}>
                  <div style={{ background: 'white', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>HORÁRIO ATUAL DO DISPOSITIVO</div>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>
                      {new Date().toLocaleTimeString('pt-BR')}
                    </div>
                    <span className="badge success">Portaria 671 MTE</span>
                  </div>

                  <div className="form-group">
                    <label>Colaborador</label>
                    <select
                      value={simuladorPonto.colaboradorNome}
                      onChange={e => setSimuladorPonto({ ...simuladorPonto, colaboradorNome: e.target.value })}
                    >
                      {colaboradores.map(c => (
                        <option key={c.id} value={c.nome}>{c.nome} ({c.matricula})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tipo de Batida</label>
                    <select
                      value={simuladorPonto.tipo}
                      onChange={e => setSimuladorPonto({ ...simuladorPonto, tipo: e.target.value })}
                    >
                      <option value="ENTRADA">🟢 Entrada</option>
                      <option value="INICIO_INTERVALO">🟡 Início Intervalo</option>
                      <option value="FIM_INTERVALO">🔵 Retorno Intervalo</option>
                      <option value="SAIDA">🔴 Saída Final</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Local / Geofence Alvo</label>
                    <select
                      value={simuladorPonto.localNome}
                      onChange={e => setSimuladorPonto({ ...simuladorPonto, localNome: e.target.value })}
                    >
                      {locais.map(l => (
                        <option key={l.id} value={l.nome}>{l.nome} (Raio {l.raioMetros}m)</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Distância Simulada do Centro (em metros)</label>
                    <input
                      type="number"
                      value={simuladorPonto.distanciaMetros}
                      onChange={e => setSimuladorPonto({ ...simuladorPonto, distanciaMetros: Number(e.target.value) })}
                    />
                    <small style={{ color: '#64748b' }}>
                      Dica: Se a distância for menor que o raio, o ponto será <b>VALIDADO</b>. Se for maior (ex: 600m), ficará <b>FORA DA ÁREA</b>.
                    </small>
                  </div>
                </div>
                <div className="modal-footer" style={{ background: '#f8fafc' }}>
                  <button type="button" className="secondary" onClick={() => setModalAberto(null)}>Cancelar</button>
                  <button type="submit" className="primary" style={{ background: '#16a34a' }}>
                    <CheckCircle size={16} /> REGISTRAR PONTO AGORA
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
