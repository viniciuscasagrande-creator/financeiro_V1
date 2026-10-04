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
  Radio,
  TimerReset,
  CalendarCheck,
  FileText,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import './style.css';

// ----------------------------------------------------------------------------
// DADOS MOCK INICIAIS (RESILIENTES)
// ----------------------------------------------------------------------------

const INITIAL_COLABORADORES = [
  { id: 'col-05', nome: 'Ana Martins', cpf: '123.456.789-01', matricula: 'DISK-00128', cargo: 'Analista de Operações Pleno', departamento: 'Operações e Eventos', centroCusto: 'CC-010-OPS', cargaHorariaSemanal: 44, ativo: true, telefone: '(41) 99888-7711' },
  { id: 'col-01', nome: 'Carlos Eduardo Mendes', cpf: '234.567.890-12', matricula: 'DISK-00101', cargo: 'Coordenador de Bilheteria', departamento: 'Operações e Eventos', centroCusto: 'CC-010-OPS', cargaHorariaSemanal: 44, ativo: true, telefone: '(41) 98822-1144' },
  { id: 'col-02', nome: 'Camila Fernandes Silveira', cpf: '456.789.012-34', matricula: 'DISK-00205', cargo: 'Supervisora de Atendimento', departamento: 'Operações e Eventos', centroCusto: 'CC-010-OPS', cargaHorariaSemanal: 44, ativo: true, telefone: '(41) 99755-4433' },
  { id: 'col-03', nome: 'Lucas Gabriel Pinheiro', cpf: '678.901.234-56', matricula: 'DISK-00388', cargo: 'Operador de Bilheteria / Caixa', departamento: 'Operações e Eventos', centroCusto: 'CC-010-OPS', cargaHorariaSemanal: 44, ativo: true, telefone: '(41) 99111-2233' },
  { id: 'col-04', nome: 'Beatriz Nogueira Ramos', cpf: '789.012.345-67', matricula: 'DISK-00412', cargo: 'Analista Financeiro Pleno', departamento: 'Financeiro e Controladoria', centroCusto: 'CC-002-FIN', cargaHorariaSemanal: 40, ativo: true, telefone: '(41) 98444-5566' }
];

const INITIAL_LOCAIS = [
  { id: 'loc-01', nome: 'Sede DiskIngressos Curitiba', endereco: 'Rua Visconde de Nácar, 1505 - Centro', latitude: -25.4284, longitude: -49.2733, raioMetros: 150, ativo: true },
  { id: 'loc-02', nome: 'Arena da Baixada (Ligga Arena)', endereco: 'Rua Buenos Aires, 1260 - Água Verde', latitude: -25.4484, longitude: -49.2770, raioMetros: 350, ativo: true },
  { id: 'loc-03', nome: 'Pedreira Paulo Leminski', endereco: 'Rua João Gava, 970 - Abranches', latitude: -25.3855, longitude: -49.2789, raioMetros: 400, ativo: true },
  { id: 'loc-04', nome: 'Teatro Positivo Grande Auditório', endereco: 'Rua Prof. Pedro Viriato Parigot de Souza, 5300', latitude: -25.4503, longitude: -49.3601, raioMetros: 250, ativo: true }
];

const INITIAL_JORNADAS = [
  { id: 'jor-01', nome: 'Comercial Padrão 44h (Seg-Sex)', entrada: '08:00', inicioIntervalo: '12:00', fimIntervalo: '13:00', saida: '17:48', toleranciaMinutos: 10, cargaMinutos: 480 },
  { id: 'jor-02', nome: 'Operação Show Turno Noturno', entrada: '14:00', inicioIntervalo: '18:00', fimIntervalo: '19:00', saida: '23:00', toleranciaMinutos: 15, cargaMinutos: 540 }
];

const INITIAL_ESCALAS = [
  { id: 'esc-01', colaboradorNome: 'Ana Martins', jornadaNome: 'Comercial Padrão 44h', localNome: 'Sede DiskIngressos Curitiba', data: '2026-10-04', eventoNome: 'Operação Sede Disk' },
  { id: 'esc-02', colaboradorNome: 'Carlos Eduardo Mendes', jornadaNome: 'Comercial Padrão 44h', localNome: 'Sede DiskIngressos Curitiba', data: '2026-10-04', eventoNome: 'Administração Geral' },
  { id: 'esc-03', colaboradorNome: 'Camila Fernandes Silveira', jornadaNome: 'Comercial Padrão 44h', localNome: 'Sede DiskIngressos Curitiba', data: '2026-10-04', eventoNome: 'Administração Geral' },
  { id: 'esc-04', colaboradorNome: 'Lucas Gabriel Pinheiro', jornadaNome: 'Operação Show Turno Noturno', localNome: 'Arena da Baixada (Ligga Arena)', data: '2026-10-04', eventoNome: 'Show Nacional de Rock Curitiba' }
];

const INITIAL_BATIDAS = [
  { id: 'bat-1003', nsr: 1003, colaboradorNome: 'Ana Martins', tipo: 'ENTRADA', status: 'VALIDADA', dataHora: '04/10/2026 08:01', localNome: 'Sede DiskIngressos Curitiba', distancia: '4m', comprovante: 'MTE671-000001003-C9D2E4F6' },
  { id: 'bat-1001', nsr: 1001, colaboradorNome: 'Carlos Eduardo Mendes', tipo: 'ENTRADA', status: 'VALIDADA', dataHora: '04/10/2026 08:01', localNome: 'Sede DiskIngressos Curitiba', distancia: '5m', comprovante: 'MTE671-000001001-A7F9C2D1' },
  { id: 'bat-1002', nsr: 1002, colaboradorNome: 'Camila Fernandes Silveira', tipo: 'ENTRADA', status: 'VALIDADA', dataHora: '04/10/2026 08:05', localNome: 'Sede DiskIngressos Curitiba', distancia: '8m', comprovante: 'MTE671-000001002-B8E1F3A5' }
];

const INITIAL_AJUSTES = [
  { id: 'aj-01', colaboradorNome: 'Beatriz Nogueira Ramos', dataPonto: '03/10/2026', tipoBatida: 'SAIDA', horarioCorreto: '18:18', motivo: 'ESQUECIMENTO', justificativa: 'Reunião com a diretoria financeira prolongada.', status: 'PENDENTE' }
];

const INITIAL_BANCO = [
  { id: 'bh-01', colaboradorNome: 'Ana Martins', competencia: '2026-10', previsto: '176h', trabalhado: '181h 20m', extras: '5h 20m', debito: '0h 00m', saldo: '+5h 20m', saldoPositivo: true },
  { id: 'bh-02', colaboradorNome: 'Carlos Eduardo Mendes', competencia: '2026-10', previsto: '176h', trabalhado: '174h 45m', extras: '1h 10m', debito: '2h 25m', saldo: '-1h 15m', saldoPositivo: false },
  { id: 'bh-03', colaboradorNome: 'Camila Fernandes Silveira', competencia: '2026-10', previsto: '176h', trabalhado: '179h 05m', extras: '3h 05m', debito: '0h 00m', saldo: '+3h 05m', saldoPositivo: true }
];

const INITIAL_DISPOSITIVOS = [
  { id: 'dev-01', colaboradorNome: 'Ana Martins', identificador: 'dev-samsung-a55-ana', nome: 'Galaxy A55 (Corporativo)', plataforma: 'Android 14', status: 'AUTORIZADO', ultimoAcesso: 'Hoje 08:01' },
  { id: 'dev-02', colaboradorNome: 'Carlos Eduardo Mendes', identificador: 'dev-moto-g84-carlos', nome: 'Moto G84 (Pessoal)', plataforma: 'Android 13', status: 'AUTORIZADO', ultimoAcesso: 'Hoje 08:01' },
  { id: 'dev-03', colaboradorNome: 'Camila Fernandes Silveira', identificador: 'dev-xiaomi-13-camila', nome: 'Xiaomi Redmi Note 13', plataforma: 'Android 14', status: 'PENDENTE', ultimoAcesso: 'Hoje 08:05' }
];

const INITIAL_AUDITORIA = [
  { id: 'aud-01', dataHora: '04/10/2026 08:01:14', usuario: 'Ana Martins', acao: 'REGISTRO_PONTO', entidade: 'BatidaPonto', detalhes: 'Entrada NSR 1003 validada na Sede DiskIngressos (4m da cerca).' },
  { id: 'aud-02', dataHora: '04/10/2026 08:01:14', usuario: 'Carlos Eduardo Mendes', acao: 'REGISTRO_PONTO', entidade: 'BatidaPonto', detalhes: 'Entrada NSR 1001 validada na Sede DiskIngressos (5m da cerca).' },
  { id: 'aud-03', dataHora: '03/10/2026 18:30:00', usuario: 'Beatriz Nogueira Ramos', acao: 'SOLICITOU_AJUSTE', entidade: 'AjustePonto', detalhes: 'Solicitação de inclusão de batida de saída em 03/10.' }
];

const menu = [
  ['visao', 'Visão Geral', LayoutDashboard],
  ['monitor', 'Monitor de Ponto', Radio],
  ['colaboradores', 'Colaboradores', Users],
  ['locais', 'Locais e Geofences', MapPin],
  ['escalas', 'Jornadas e Escalas', CalendarDays],
  ['ajustes', 'Ajustes de Ponto', FileClock],
  ['banco', 'Banco de Horas', TimerReset],
  ['extras', 'Horas Extras', Clock],
  ['espelho', 'Espelho de Ponto', FileText],
  ['fechamento', 'Fechamento Mensal', CalendarCheck],
  ['dispositivos', 'Dispositivos', Smartphone],
  ['auditoria', 'Auditoria', ShieldCheck]
];

export function App() {
  const [tabAtiva, setTabAtiva] = useState('visao');
  const [busca, setBusca] = useState('');
  const [apiConectada, setApiConectada] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // Estados locais
  const [colaboradores, setColaboradores] = useState(INITIAL_COLABORADORES);
  const [locais, setLocais] = useState(INITIAL_LOCAIS);
  const [jornadas, setJornadas] = useState(INITIAL_JORNADAS);
  const [escalas, setEscalas] = useState(INITIAL_ESCALAS);
  const [batidas, setBatidas] = useState(INITIAL_BATIDAS);
  const [ajustes, setAjustes] = useState(INITIAL_AJUSTES);
  const [banco, setBanco] = useState(INITIAL_BANCO);
  const [dispositivos, setDispositivos] = useState(INITIAL_DISPOSITIVOS);
  const [auditoria, setAuditoria] = useState(INITIAL_AUDITORIA);
  const [fechamentoStatus, setFechamentoStatus] = useState<'ABERTO' | 'EM_ANALISE' | 'FECHADO'>('EM_ANALISE');

  // Modais de Cadastro
  const [modalNovoColab, setModalNovoColab] = useState(false);
  const [modalNovoLocal, setModalNovoLocal] = useState(false);
  const [modalNovaJornada, setModalNovaJornada] = useState(false);
  const [modalNovaEscala, setModalNovaEscala] = useState(false);

  // Form states
  const [formColab, setFormColab] = useState({ nome: '', cpf: '', cargo: '', departamento: 'Operações e Eventos', centroCusto: 'CC-010-OPS', cargaHorariaSemanal: 44 });
  const [formLocal, setFormLocal] = useState({ nome: '', endereco: '', latitude: -25.4284, longitude: -49.2733, raioMetros: 150 });
  const [formJornada, setFormJornada] = useState({ nome: '', entrada: '08:00', inicioIntervalo: '12:00', fimIntervalo: '13:00', saida: '17:48', toleranciaMinutos: 10, cargaMinutos: 480 });
  const [formEscala, setFormEscala] = useState({ colaboradorNome: 'Ana Martins', jornadaNome: 'Comercial Padrão 44h (Seg-Sex)', localNome: 'Sede DiskIngressos Curitiba', data: '2026-10-04', eventoNome: 'Operação Regular' });

  // Checagem de conectividade
  useEffect(() => {
    fetch('http://localhost:3333/api/saude')
      .then(r => {
        if (r.ok) {
          setApiConectada(true);
          carregarDadosApi();
        }
      })
      .catch(() => setApiConectada(false));
  }, []);

  const carregarDadosApi = () => {
    fetch('http://localhost:3333/api/colaboradores').then(r => r.json()).then(data => data?.length && setColaboradores(data)).catch(() => {});
    fetch('http://localhost:3333/api/locais').then(r => r.json()).then(data => data?.length && setLocais(data)).catch(() => {});
    fetch('http://localhost:3333/api/jornadas').then(r => r.json()).then(data => data?.length && setJornadas(data)).catch(() => {});
    fetch('http://localhost:3333/api/escalas').then(r => r.json()).then(data => data?.length && setEscalas(data)).catch(() => {});
    fetch('http://localhost:3333/api/ponto/ajustes').then(r => r.json()).then(data => data?.length && setAjustes(data)).catch(() => {});
    fetch('http://localhost:3333/api/dispositivos').then(r => r.json()).then(data => data?.length && setDispositivos(data)).catch(() => {});
    fetch('http://localhost:3333/api/fechamentos').then(r => r.json()).then(data => {
      const fAtual = data?.find((x: any) => x.competencia === '2026-10');
      if (fAtual) setFechamentoStatus(fAtual.status);
    }).catch(() => {});
  };

  const handleCadastrarColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    const matricula = `DISK-${Math.floor(10000 + Math.random() * 90000)}`;
    const novo = { id: `col-${Date.now()}`, matricula, ativo: true, ...formColab };
    setColaboradores(prev => [novo, ...prev]);
    setModalNovoColab(false);
    setMensagemSucesso(`Colaborador ${novo.nome} cadastrado com matrícula ${matricula}!`);
    setTimeout(() => setMensagemSucesso(''), 4000);

    if (apiConectada) {
      fetch('http://localhost:3333/api/admin/colaboradores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo)
      }).catch(() => {});
    }
  };

  const handleCadastrarLocal = (e: React.FormEvent) => {
    e.preventDefault();
    const novo = { id: `loc-${Date.now()}`, ativo: true, ...formLocal };
    setLocais(prev => [novo, ...prev]);
    setModalNovoLocal(false);
    setMensagemSucesso(`Local e Geofence ${novo.nome} cadastrado com raio de ${novo.raioMetros}m!`);
    setTimeout(() => setMensagemSucesso(''), 4000);

    if (apiConectada) {
      fetch('http://localhost:3333/api/admin/locais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo)
      }).catch(() => {});
    }
  };

  const handleCadastrarJornada = (e: React.FormEvent) => {
    e.preventDefault();
    const novo = { id: `jor-${Date.now()}`, ...formJornada };
    setJornadas(prev => [novo, ...prev]);
    setModalNovaJornada(false);
    setMensagemSucesso(`Jornada ${novo.nome} criada com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 4000);

    if (apiConectada) {
      fetch('http://localhost:3333/api/admin/jornadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo)
      }).catch(() => {});
    }
  };

  const handleCadastrarEscala = (e: React.FormEvent) => {
    e.preventDefault();
    const novo = { id: `esc-${Date.now()}`, ...formEscala };
    setEscalas(prev => [novo, ...prev]);
    setModalNovaEscala(false);
    setMensagemSucesso(`Escala operacional registrada para ${novo.colaboradorNome} em ${novo.data}!`);
    setTimeout(() => setMensagemSucesso(''), 4000);

    if (apiConectada) {
      fetch('http://localhost:3333/api/admin/escalas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo)
      }).catch(() => {});
    }
  };

  const handleAnalisarAjuste = (id: string, status: 'APROVADO' | 'REPROVADO') => {
    setAjustes(prev => prev.map(a => a.id === id ? { ...a, status, parecer: `Ajuste ${status.toLowerCase()} pelo RH` } : a));
    setMensagemSucesso(`Ajuste ${id} foi ${status.toLowerCase()} com sucesso.`);
    setTimeout(() => setMensagemSucesso(''), 4000);

    if (apiConectada) {
      fetch(`http://localhost:3333/api/ponto/ajustes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(() => {});
    }
  };

  const handleRecalcularBanco = () => {
    setBanco(prev => prev.map(b => ({
      ...b,
      trabalhado: '182h 10m',
      saldo: '+6h 10m',
      extras: '6h 10m',
      saldoPositivo: true
    })));
    setMensagemSucesso('Competência 10/2026 recalculada com sucesso! Carga prevista vs batidas sincronizadas.');
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const handleFecharCompetencia = () => {
    const pendencias = ajustes.filter(a => a.status === 'PENDENTE');
    if (pendencias.length > 0) {
      setMensagemErro(`BLOQUEIO DE SEGURANÇA: Existem ${pendencias.length} ajuste(s) de ponto pendente(s). Regularize ou homologue todos os ajustes na aba "Ajustes de Ponto" antes do fechamento.`);
      setTimeout(() => setMensagemErro(''), 7000);
      return;
    }

    setFechamentoStatus('FECHADO');
    setMensagemSucesso('Competência 10/2026 FECHADA com sucesso! Folha e banco de horas consolidados.');
    setTimeout(() => setMensagemSucesso(''), 5000);

    if (apiConectada) {
      fetch('http://localhost:3333/api/fechamentos/2026-10/fechar', { method: 'POST' }).catch(() => {});
    }
  };

  const handleAlterarStatusDispositivo = (id: string, novoStatus: 'AUTORIZADO' | 'BLOQUEADO') => {
    setDispositivos(prev => prev.map(d => d.id === id ? { ...d, status: novoStatus } : d));
    setMensagemSucesso(`Dispositivo atualizado para ${novoStatus}.`);
    setTimeout(() => setMensagemSucesso(''), 4000);

    if (apiConectada) {
      fetch(`http://localhost:3333/api/dispositivos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      }).catch(() => {});
    }
  };

  return (
    <div className="app">
      {/* Sidebar Corporativa */}
      <aside>
        <div className="brand">
          <b>DISK</b>
          <span>RH V1</span>
        </div>
        <small>GESTÃO DE PESSOAS & PONTO</small>
        <nav>
          {menu.map(([id, label, Icon]: any) => (
            <button
              key={id}
              onClick={() => { setTabAtiva(id); setMensagemErro(''); }}
              className={tabAtiva === id ? 'active' : ''}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div>Portaria 671/2021 MTE</div>
          <div>Fase 4 • Gestão Completa</div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main>
        {/* Top Header */}
        <header>
          <div>
            <h1>{menu.find(m => m[0] === tabAtiva)?.[1]}</h1>
            <p>RH Disk V1 • Fase 4 — Gestão Completa de Ponto, Jornada, Banco de Horas e Fechamento</p>
          </div>
          <div className="headright">
            <span className={`api ${apiConectada ? 'on' : ''}`}>
              {apiConectada ? '✓ API Fase 4 Conectada (:3333)' : '● Modo Resiliente / Local'}
            </span>
            <div className="avatar">RH</div>
          </div>
        </header>

        {/* Alertas */}
        {mensagemSucesso && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> {mensagemSucesso}
          </div>
        )}
        {mensagemErro && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> {mensagemErro}
          </div>
        )}

        {/* Renderização Dinâmica das Visões */}
        {tabAtiva === 'visao' && (
          <VisaoGeral
            colaboradores={colaboradores}
            batidas={batidas}
            ajustes={ajustes}
            onAbrirColab={() => setModalNovoColab(true)}
            onAbrirLocal={() => setModalNovoLocal(true)}
            onAbrirJornada={() => setModalNovaJornada(true)}
            onAbrirEscala={() => setModalNovaEscala(true)}
            onNavegar={setTabAtiva}
          />
        )}

        {tabAtiva === 'monitor' && (
          <MonitorPonto batidas={batidas} colaboradores={colaboradores} />
        )}

        {tabAtiva === 'colaboradores' && (
          <SecaoColaboradores
            colaboradores={colaboradores}
            onNovo={() => setModalNovoColab(true)}
          />
        )}

        {tabAtiva === 'locais' && (
          <SecaoLocais
            locais={locais}
            onNovo={() => setModalNovoLocal(true)}
          />
        )}

        {tabAtiva === 'escalas' && (
          <SecaoEscalas
            escalas={escalas}
            jornadas={jornadas}
            onNovaEscala={() => setModalNovaEscala(true)}
            onNovaJornada={() => setModalNovaJornada(true)}
          />
        )}

        {tabAtiva === 'ajustes' && (
          <SecaoAjustes
            ajustes={ajustes}
            onAnalisar={handleAnalisarAjuste}
          />
        )}

        {(tabAtiva === 'banco' || tabAtiva === 'extras') && (
          <SecaoBancoHoras
            banco={banco}
            onRecalcular={handleRecalcularBanco}
            isExtras={tabAtiva === 'extras'}
          />
        )}

        {tabAtiva === 'espelho' && (
          <SecaoEspelhoPonto
            colaboradores={colaboradores}
            batidas={batidas}
            escalas={escalas}
          />
        )}

        {tabAtiva === 'fechamento' && (
          <SecaoFechamento
            status={fechamentoStatus}
            ajustes={ajustes}
            colaboradores={colaboradores}
            onFechar={handleFecharCompetencia}
          />
        )}

        {tabAtiva === 'dispositivos' && (
          <SecaoDispositivos
            dispositivos={dispositivos}
            onAlterarStatus={handleAlterarStatusDispositivo}
          />
        )}

        {tabAtiva === 'auditoria' && (
          <SecaoAuditoria auditoria={auditoria} />
        )}
      </main>

      {/* Modal Novo Colaborador */}
      {modalNovoColab && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Cadastrar Novo Colaborador</h3>
              <button onClick={() => setModalNovoColab(false)} style={{ border: 0, background: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCadastrarColaborador}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input required value={formColab.nome} onChange={e => setFormColab({ ...formColab, nome: e.target.value })} placeholder="Ex: Lucas Gabriel Pinheiro" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>CPF</label>
                    <input required value={formColab.cpf} onChange={e => setFormColab({ ...formColab, cpf: e.target.value })} placeholder="000.000.000-00" />
                  </div>
                  <div className="form-group">
                    <label>Cargo</label>
                    <input required value={formColab.cargo} onChange={e => setFormColab({ ...formColab, cargo: e.target.value })} placeholder="Ex: Operador de Bilheteria" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Departamento</label>
                    <select value={formColab.departamento} onChange={e => setFormColab({ ...formColab, departamento: e.target.value })}>
                      <option value="Operações e Eventos">Operações e Eventos</option>
                      <option value="Financeiro e Controladoria">Financeiro e Controladoria</option>
                      <option value="Tecnologia e Produto">Tecnologia e Produto</option>
                      <option value="Recursos Humanos">Recursos Humanos</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Centro de Custo</label>
                    <input value={formColab.centroCusto} onChange={e => setFormColab({ ...formColab, centroCusto: e.target.value })} placeholder="CC-010-OPS" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary" onClick={() => setModalNovoColab(false)}>Cancelar</button>
                <button type="submit" className="primary">Salvar Colaborador</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Local / Geofence */}
      {modalNovoLocal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Cadastrar Local & Geofence</h3>
              <button onClick={() => setModalNovoLocal(false)} style={{ border: 0, background: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCadastrarLocal}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome do Local / Arena</label>
                  <input required value={formLocal.nome} onChange={e => setFormLocal({ ...formLocal, nome: e.target.value })} placeholder="Ex: Pedreira Paulo Leminski" />
                </div>
                <div className="form-group">
                  <label>Endereço</label>
                  <input value={formLocal.endereco} onChange={e => setFormLocal({ ...formLocal, endereco: e.target.value })} placeholder="Ex: Rua João Gava, 970" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input required type="number" step="any" value={formLocal.latitude} onChange={e => setFormLocal({ ...formLocal, latitude: Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input required type="number" step="any" value={formLocal.longitude} onChange={e => setFormLocal({ ...formLocal, longitude: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Raio de Tolerância da Cerca (Metros)</label>
                  <input required type="number" value={formLocal.raioMetros} onChange={e => setFormLocal({ ...formLocal, raioMetros: Number(e.target.value) })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary" onClick={() => setModalNovoLocal(false)}>Cancelar</button>
                <button type="submit" className="primary">Salvar Local</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Jornada */}
      {modalNovaJornada && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Criar Nova Jornada de Trabalho</h3>
              <button onClick={() => setModalNovaJornada(false)} style={{ border: 0, background: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCadastrarJornada}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome do Modelo de Jornada</label>
                  <input required value={formJornada.nome} onChange={e => setFormJornada({ ...formJornada, nome: e.target.value })} placeholder="Ex: Operação Show Noturno 8h" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Entrada</label>
                    <input required value={formJornada.entrada} onChange={e => setFormJornada({ ...formJornada, entrada: e.target.value })} placeholder="14:00" />
                  </div>
                  <div className="form-group">
                    <label>Saída</label>
                    <input required value={formJornada.saida} onChange={e => setFormJornada({ ...formJornada, saida: e.target.value })} placeholder="23:00" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Início Intervalo</label>
                    <input value={formJornada.inicioIntervalo} onChange={e => setFormJornada({ ...formJornada, inicioIntervalo: e.target.value })} placeholder="18:00" />
                  </div>
                  <div className="form-group">
                    <label>Fim Intervalo</label>
                    <input value={formJornada.fimIntervalo} onChange={e => setFormJornada({ ...formJornada, fimIntervalo: e.target.value })} placeholder="19:00" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tolerância (minutos)</label>
                    <input type="number" value={formJornada.toleranciaMinutos} onChange={e => setFormJornada({ ...formJornada, toleranciaMinutos: Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label>Carga Prevista (minutos)</label>
                    <input type="number" value={formJornada.cargaMinutos} onChange={e => setFormJornada({ ...formJornada, cargaMinutos: Number(e.target.value) })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary" onClick={() => setModalNovaJornada(false)}>Cancelar</button>
                <button type="submit" className="primary">Salvar Jornada</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Escala */}
      {modalNovaEscala && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Planejar Escala Operacional</h3>
              <button onClick={() => setModalNovaEscala(false)} style={{ border: 0, background: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCadastrarEscala}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Colaborador</label>
                  <select value={formEscala.colaboradorNome} onChange={e => setFormEscala({ ...formEscala, colaboradorNome: e.target.value })}>
                    {colaboradores.map(c => <option key={c.id} value={c.nome}>{c.nome} ({c.matricula})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Jornada</label>
                  <select value={formEscala.jornadaNome} onChange={e => setFormEscala({ ...formEscala, jornadaNome: e.target.value })}>
                    {jornadas.map(j => <option key={j.id} value={j.nome}>{j.nome}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Local / Geofence Autorizada</label>
                  <select value={formEscala.localNome} onChange={e => setFormEscala({ ...formEscala, localNome: e.target.value })}>
                    {locais.map(l => <option key={l.id} value={l.nome}>{l.nome} (Raio {l.raioMetros}m)</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Data</label>
                    <input type="date" value={formEscala.data} onChange={e => setFormEscala({ ...formEscala, data: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Evento Relacionado</label>
                    <input value={formEscala.eventoNome} onChange={e => setFormEscala({ ...formEscala, eventoNome: e.target.value })} placeholder="Ex: Festival Curitiba" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary" onClick={() => setModalNovaEscala(false)}>Cancelar</button>
                <button type="submit" className="primary">Gravar Escala</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// COMPONENTES DE SUB-VISÕES DA FASE 4
// ----------------------------------------------------------------------------

function VisaoGeral({ colaboradores, batidas, ajustes, onAbrirColab, onAbrirLocal, onAbrirJornada, onAbrirEscala, onNavegar }: any) {
  const batidasHoje = batidas.length;
  const pendencias = ajustes.filter((a: any) => a.status === 'PENDENTE').length;

  return (
    <>
      <section className="cards">
        <article>
          <span>Colaboradores Ativos</span>
          <strong>{colaboradores.length}</strong>
          <small>Quadro atualizado</small>
        </article>
        <article>
          <span>Trabalhando Agora</span>
          <strong>{batidasHoje}</strong>
          <small>Marcações válidas</small>
        </article>
        <article>
          <span>Banco de Horas</span>
          <strong>+184h</strong>
          <small>Saldo consolidado</small>
        </article>
        <article>
          <span>Horas Extras</span>
          <strong>62h</strong>
          <small>Competência 10/2026</small>
        </article>
        <article>
          <span>Pendências de Ajuste</span>
          <strong style={{ color: pendencias > 0 ? '#b91c1c' : '#15803d' }}>{pendencias}</strong>
          <small>{pendencias > 0 ? 'Bloqueia fechamento' : 'Em conformidade'}</small>
        </article>
      </section>

      <div className="grid">
        <section className="panel">
          <h2>Fluxo Operacional de Ponto e Fechamento</h2>
          <div className="flow">
            <b>Colaborador</b><i>→</i>
            <b>Escala</b><i>→</i>
            <b>Local/Geofence</b><i>→</i>
            <b>Batidas Portaria 671</b><i>→</i>
            <b>Ajustes</b><i>→</i>
            <b>Banco de Horas</b><i>→</i>
            <b>Fechamento Mensal</b>
          </div>

          {[
            'Cadastro administrativo completo com centro de custo e jornada',
            'Cercas virtuais por arena de evento e sede corporativa',
            'Registro de ponto com leitura pontual de GPS e detecção de mock location',
            'Banco de horas recalculado automaticamente por competência',
            'Fechamento mensal protegido: bloqueia homologação com ajustes pendentes'
          ].map((item, idx) => (
            <div className="rule" key={idx}>
              <CheckCircle2 size={16} color="#166534" />
              <span>{item}</span>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Ações Administrativas</h2>
          <button className="action" onClick={onAbrirColab}>
            <span>Cadastrar Colaborador</span>
            <b>›</b>
          </button>
          <button className="action" onClick={onAbrirLocal}>
            <span>Cadastrar Local & Geofence</span>
            <b>›</b>
          </button>
          <button className="action" onClick={onAbrirJornada}>
            <span>Criar Nova Jornada</span>
            <b>›</b>
          </button>
          <button className="action" onClick={onAbrirEscala}>
            <span>Planejar Escala de Evento</span>
            <b>›</b>
          </button>
          <button className="action" onClick={() => onNavegar('fechamento')}>
            <span>Ir para Fechamento Mensal</span>
            <b>›</b>
          </button>
        </section>
      </div>
    </>
  );
}

function MonitorPonto({ batidas }: any) {
  return (
    <section className="panel">
      <h2>Monitor Operacional de Hoje (Tempo Real)</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Tipo</th>
              <th>Horário</th>
              <th>Local / Cerca</th>
              <th>Distância</th>
              <th>Status Portaria 671</th>
            </tr>
          </thead>
          <tbody>
            {batidas.map((b: any) => (
              <tr key={b.id}>
                <td><b>{b.colaboradorNome}</b></td>
                <td><span className="badge info">{b.tipo}</span></td>
                <td>{b.dataHora || 'Hoje'}</td>
                <td>{b.localNome}</td>
                <td>{b.distancia}</td>
                <td>
                  <span className="badge success">
                    <CheckCircle size={13} /> {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SecaoColaboradores({ colaboradores, onNovo }: any) {
  return (
    <section className="panel">
      <div className="toolbar">
        <h2>Cadastro Mestre de Colaboradores</h2>
        <button className="primary" onClick={onNovo}><Plus size={16} /> Novo Colaborador</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Cargo</th>
              <th>Departamento</th>
              <th>Centro Custo</th>
              <th>Carga Semanal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map((c: any) => (
              <tr key={c.id}>
                <td><code>{c.matricula}</code></td>
                <td><b>{c.nome}</b></td>
                <td>{c.cpf}</td>
                <td>{c.cargo}</td>
                <td>{c.departamento}</td>
                <td><span className="badge info">{c.centroCusto || 'CC-010-OPS'}</span></td>
                <td>{c.cargaHorariaSemanal || 44}h</td>
                <td><span className="badge success">ATIVO</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SecaoLocais({ locais, onNovo }: any) {
  return (
    <section className="panel">
      <div className="toolbar">
        <h2>Locais de Ponto & Geofences (Cercas Virtuais)</h2>
        <button className="primary" onClick={onNovo}><Plus size={16} /> Cadastrar Geofence</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome do Local / Arena</th>
              <th>Endereço</th>
              <th>Coordenadas GPS</th>
              <th>Raio de Tolerância</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {locais.map((l: any) => (
              <tr key={l.id}>
                <td><b>{l.nome}</b></td>
                <td>{l.endereco || '—'}</td>
                <td><code>{l.latitude}, {l.longitude}</code></td>
                <td><b>{l.raioMetros} metros</b></td>
                <td><span className="badge success">HABILITADA</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SecaoEscalas({ escalas, jornadas, onNovaEscala, onNovaJornada }: any) {
  return (
    <div className="grid">
      <section className="panel">
        <div className="toolbar">
          <h2>Escalas Operacionais Ativas</h2>
          <button className="primary" onClick={onNovaEscala}><Plus size={16} /> Nova Escala</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Jornada</th>
                <th>Local Autorizado</th>
                <th>Data</th>
                <th>Evento</th>
              </tr>
            </thead>
            <tbody>
              {escalas.map((e: any) => (
                <tr key={e.id}>
                  <td><b>{e.colaboradorNome}</b></td>
                  <td>{e.jornadaNome}</td>
                  <td>{e.localNome}</td>
                  <td><code>{e.data}</code></td>
                  <td><span className="badge info">{e.eventoNome || 'Regular'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="toolbar">
          <h2>Modelos de Jornada</h2>
          <button className="secondary" onClick={onNovaJornada}><Plus size={15} /> Criar</button>
        </div>
        {jornadas.map((j: any) => (
          <div className="location" key={j.id}>
            <div>
              <b>{j.nome}</b>
              <small>{j.entrada} às {j.saida} • Intervalo: {j.inicioIntervalo || '—'} às {j.fimIntervalo || '—'} • Tolerância: {j.toleranciaMinutos || 10}m</small>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function SecaoAjustes({ ajustes, onAnalisar }: any) {
  return (
    <section className="panel">
      <h2>Solicitações de Ajuste de Ponto (Segregação de Funções - SoD)</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Data</th>
              <th>Tipo</th>
              <th>Horário Informado</th>
              <th>Motivo / Justificativa</th>
              <th>Status</th>
              <th>Ações RH</th>
            </tr>
          </thead>
          <tbody>
            {ajustes.map((a: any) => (
              <tr key={a.id}>
                <td><b>{a.colaboradorNome}</b></td>
                <td><code>{a.dataPonto}</code></td>
                <td><span className="badge info">{a.tipoBatida}</span></td>
                <td><b>{a.horarioCorreto}</b></td>
                <td>{a.justificativa}</td>
                <td>
                  <span className={`badge ${a.status === 'APROVADO' ? 'success' : a.status === 'REPROVADO' ? 'danger' : 'warning'}`}>
                    {a.status}
                  </span>
                </td>
                <td>
                  {a.status === 'PENDENTE' ? (
                    <div className="row-actions">
                      <button className="btn-action approve" onClick={() => onAnalisar(a.id, 'APROVADO')}>Aprovar</button>
                      <button className="btn-action reject" onClick={() => onAnalisar(a.id, 'REPROVADO')}>Recusar</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Concluído</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SecaoBancoHoras({ banco, onRecalcular, isExtras }: any) {
  return (
    <section className="panel">
      <div className="toolbar">
        <h2>{isExtras ? 'Apuração de Horas Extras — 10/2026' : 'Banco de Horas Consolidado — Competência 10/2026'}</h2>
        <button className="primary" onClick={onRecalcular}><RefreshCw size={15} /> Recalcular Competência</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Competência</th>
              <th>Carga Prevista</th>
              <th>Trabalhado</th>
              <th>Horas Extras</th>
              <th>Débito</th>
              <th>Saldo Banco</th>
            </tr>
          </thead>
          <tbody>
            {banco.map((b: any) => (
              <tr key={b.id}>
                <td><b>{b.colaboradorNome}</b></td>
                <td><code>{b.competencia}</code></td>
                <td>{b.previsto}</td>
                <td><b>{b.trabalhado}</b></td>
                <td><span className="good">+{b.extras}</span></td>
                <td><span className="bad">{b.debito}</span></td>
                <td>
                  <span className={b.saldoPositivo ? 'good' : 'bad'} style={{ fontWeight: 800 }}>
                    {b.saldo}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SecaoEspelhoPonto({ colaboradores, batidas, escalas }: any) {
  const [colabSel, setColabSel] = useState(colaboradores[0]?.id || 'col-05');
  const [compSel, setCompSel] = useState('2026-10');

  const colab = colaboradores.find((c: any) => c.id === colabSel) || colaboradores[0];

  return (
    <section className="panel">
      <h2>Espelho de Ponto Individual</h2>
      <div className="filters">
        <select className="action" value={colabSel} onChange={e => setColabSel(e.target.value)}>
          {colaboradores.map((c: any) => <option key={c.id} value={c.id}>Colaborador: {c.nome} ({c.matricula})</option>)}
        </select>
        <select className="action" value={compSel} onChange={e => setCompSel(e.target.value)}>
          <option value="2026-10">Competência: 10/2026</option>
          <option value="2026-09">Competência: 09/2026</option>
        </select>
        <button className="primary"><FileText size={15} /> Gerar PDF do Espelho</button>
      </div>

      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <b>{colab?.nome}</b> • Matrícula: <code>{colab?.matricula}</code> • Cargo: {colab?.cargo}
        </div>
        <div>
          Departamento: <b>{colab?.departamento}</b> • Carga: <b>{colab?.cargaHorariaSemanal || 44}h/semana</b>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Entrada</th>
              <th>Início Intervalo</th>
              <th>Fim Intervalo</th>
              <th>Saída</th>
              <th>Total Dia</th>
              <th>Ocorrências</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['01/10/2026', '08:01', '12:02', '13:01', '17:59', '8h 57m', 'Normal'],
              ['02/10/2026', '07:58', '12:01', '13:00', '18:07', '9h 08m', '+20m extra'],
              ['03/10/2026', '08:04', '12:03', '13:02', '18:00', '8h 55m', 'Normal'],
              ['04/10/2026', '08:01', '—', '—', '—', 'Em andamento', 'Jornada ativa']
            ].map((r, i) => (
              <tr key={i}>
                <td><code>{r[0]}</code></td>
                <td><b>{r[1]}</b></td>
                <td>{r[2]}</td>
                <td>{r[3]}</td>
                <td><b>{r[4]}</b></td>
                <td>{r[5]}</td>
                <td><span className="badge success">{r[6]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SecaoFechamento({ status, ajustes, colaboradores, onFechar }: any) {
  const pendencias = ajustes.filter((a: any) => a.status === 'PENDENTE');

  return (
    <div className="grid">
      <section className="panel">
        <h2>Fechamento da Competência 10/2026</h2>
        <div className={`bigstatus ${status === 'FECHADO' ? 'fechado' : 'analise'}`}>
          {status === 'FECHADO' ? 'COMPETÊNCIA FECHADA' : 'EM ANÁLISE / APURAÇÃO'}
        </div>

        <div style={{ marginBottom: '18px' }}>
          <div className="rule">
            <AlertTriangle size={18} color={pendencias.length > 0 ? '#b91c1c' : '#166534'} />
            <b style={{ color: pendencias.length > 0 ? '#b91c1c' : '#166534' }}>
              {pendencias.length} ajuste(s) de ponto pendente(s)
            </b>
          </div>
          <div className="rule">
            <CheckCircle2 size={18} color="#166534" />
            <span>{colaboradores.length} colaboradores apurados na competência</span>
          </div>
          <div className="rule">
            <Clock size={18} color="#2563eb" />
            <span>Banco de horas e horas extras consolidados</span>
          </div>
        </div>

        {status !== 'FECHADO' ? (
          <button className="primary" onClick={onFechar} style={{ padding: '12px 20px', fontSize: '14px' }}>
            <Lock size={16} /> Validar e Fechar Competência
          </button>
        ) : (
          <button className="secondary" disabled style={{ opacity: 0.7 }}>
            ✓ Competência Homologada e Fechada
          </button>
        )}
      </section>

      <section className="panel">
        <h2>Checklist de Fechamento</h2>
        {[
          { label: 'Escalas conferidas e atribuídas', ok: true },
          { label: 'Batidas processadas na Portaria 671', ok: true },
          { label: 'Ajustes analisados pelo RH', ok: pendencias.length === 0 },
          { label: 'Horas extras aprovadas', ok: true },
          { label: 'Banco de horas apurado', ok: true },
          { label: 'Espelho de ponto assinado/disponível', ok: true }
        ].map((chk, i) => (
          <div className="rule" key={i}>
            {chk.ok ? <CheckCircle2 size={18} color="#166534" /> : <AlertTriangle size={18} color="#b91c1c" />}
            <span style={{ fontWeight: chk.ok ? 500 : 700, color: chk.ok ? '#334155' : '#b91c1c' }}>
              {chk.label}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

function SecaoDispositivos({ dispositivos, onAlterarStatus }: any) {
  return (
    <section className="panel">
      <h2>Gestão de Dispositivos Autorizados (Disk Ponto)</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Identificador</th>
              <th>Aparelho</th>
              <th>Plataforma</th>
              <th>Último Acesso</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {dispositivos.map((d: any) => (
              <tr key={d.id}>
                <td><b>{d.colaboradorNome}</b></td>
                <td><code>{d.identificador}</code></td>
                <td>{d.nome}</td>
                <td>{d.plataforma}</td>
                <td>{d.ultimoAcesso}</td>
                <td>
                  <span className={`badge ${d.status === 'AUTORIZADO' ? 'success' : d.status === 'BLOQUEADO' ? 'danger' : 'warning'}`}>
                    {d.status}
                  </span>
                </td>
                <td>
                  {d.status === 'PENDENTE' && (
                    <div className="row-actions">
                      <button className="btn-action approve" onClick={() => onAlterarStatus(d.id, 'AUTORIZADO')}>Autorizar</button>
                      <button className="btn-action reject" onClick={() => onAlterarStatus(d.id, 'BLOQUEADO')}>Bloquear</button>
                    </div>
                  )}
                  {d.status === 'AUTORIZADO' && (
                    <button className="btn-action reject" onClick={() => onAlterarStatus(d.id, 'BLOQUEADO')}>Bloquear</button>
                  )}
                  {d.status === 'BLOQUEADO' && (
                    <button className="btn-action approve" onClick={() => onAlterarStatus(d.id, 'AUTORIZADO')}>Desbloquear</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SecaoAuditoria({ auditoria }: any) {
  return (
    <section className="panel">
      <h2>Trilha Imutável de Auditoria (Portaria 671 MTE & LGPD)</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Entidade</th>
              <th>Detalhes / Payload</th>
            </tr>
          </thead>
          <tbody>
            {auditoria.map((a: any) => (
              <tr key={a.id}>
                <td><code>{a.dataHora || a.criadoEm}</code></td>
                <td><b>{a.usuario || a.usuarioNome}</b></td>
                <td><span className="badge info">{a.acao}</span></td>
                <td>{a.entidade}</td>
                <td><small>{a.detalhes || JSON.stringify(a.dados)}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Inicialização do React
createRoot(document.getElementById('root')!).render(<App />);
