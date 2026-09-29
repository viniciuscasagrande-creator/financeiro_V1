import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authMiddleware } from './auth/auth.middleware';
import { WorkflowEngine } from './workflow/workflow.engine';
import { PerfilUsuario } from './types';

export const app = express();

app.use(cors());
app.use(express.json());

// Instância única do Core de Workflow Financeiro
export const workflowEngine = new WorkflowEngine();

// --- 1. AUTENTICAÇÃO ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (email === 'produtor@demo.disk') {
    return res.json({
      id: 'usr-prod-01',
      email: 'produtor@demo.disk',
      nome: 'João Silva',
      perfil: 'PRODUTOR',
      produtorId: 'prod-abc',
      token: 'jwt_mock_produtor'
    });
  }
  if (email === 'admin@demo.disk') {
    return res.json({
      id: 'usr-adm-01',
      email: 'admin@demo.disk',
      nome: 'Vinicius Master',
      perfil: 'ADMINISTRADOR',
      token: 'jwt_mock_admin'
    });
  }
  return res.json({
    id: 'usr-fin-01',
    email: 'financeiro@demo.disk',
    nome: 'Maria Valente',
    perfil: 'FINANCEIRO',
    token: 'jwt_mock_financeiro'
  });
});

// --- 2. SALDOS & ISOLAMENTO MULTI-TENANT ---
app.get('/api/produtores/:produtorId/saldos', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  // Segurança estrita: Produtor não pode ler dados de outro produtor
  if (user?.perfil === 'PRODUTOR' && user?.produtorId !== req.params.produtorId) {
    return res.status(403).json({ erro: '403 Forbidden: Acesso cruzado entre produtores é proibido.' });
  }

  res.json([
    {
      eventoId: 'evt-curitiba-2026',
      eventoNome: 'Festival Curitiba 2026',
      vendasBrutas: 500000,
      taxasDeducoes: 50000,
      saldoDisponivel: 200000,
      aReceber: 80000,
      bloqueadoReserva: 20000
    },
    {
      eventoId: 'evt-artista-a',
      eventoNome: 'Show Artista A - Turnê Especial',
      vendasBrutas: 280000,
      taxasDeducoes: 30000,
      saldoDisponivel: 95000,
      aReceber: 60000,
      bloqueadoReserva: 0
    }
  ]);
});

// --- 3. MOTOR DE SOLICITAÇÕES (REPASSE / ANTECIPAÇÃO / BORDERÔ) ---
app.post('/api/solicitacoes/repasse', authMiddleware, (req: Request, res: Response) => {
  const { produtorId, eventoId, valor, dadosBancarios } = req.body;
  const user = (req as any).user;

  try {
    const solicitacao = workflowEngine.criarSolicitacaoRepasse(
      produtorId,
      eventoId,
      valor,
      dadosBancarios,
      user?.nome || 'Produtor Demo'
    );
    res.status(201).json(solicitacao);
  } catch (err: any) {
    res.status(400).json({ erro: err.message });
  }
});

// --- 4. APROVAÇÃO E REJEIÇÃO OPERACIONAL ---
app.post('/api/solicitacoes/:id/aprovar', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.perfil === 'PRODUTOR') {
    return res.status(403).json({ erro: 'Produtores não possuem permissão para aprovar operações.' });
  }

  try {
    const atualizada = workflowEngine.aprovarOperacao(req.params.id, user?.nome || 'Mesa Tesouraria');
    res.json(atualizada);
  } catch (err: any) {
    res.status(400).json({ erro: err.message });
  }
});

app.post('/api/solicitacoes/:id/rejeitar', authMiddleware, (req: Request, res: Response) => {
  const { motivo, observacao } = req.body;
  const user = (req as any).user;
  if (user?.perfil === 'PRODUTOR') {
    return res.status(403).json({ erro: 'Produtores não possuem permissão para rejeitar operações.' });
  }

  try {
    const atualizada = workflowEngine.rejeitarOperacao(
      req.params.id,
      motivo,
      observacao,
      user?.nome || 'Mesa Tesouraria'
    );
    res.json(atualizada);
  } catch (err: any) {
    res.status(400).json({ erro: err.message });
  }
});

// --- 5. ESTEIRA DE ASSINATURAS SEQUENCIAIS ---
// Produtor assina PRIMEIRO
app.post('/api/assinaturas/:id/produtor', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const doc = workflowEngine.assinarComoProdutor(req.params.id, user?.nome || 'João Silva', '127.0.0.1');
    res.json(doc);
  } catch (err: any) {
    res.status(400).json({ erro: err.message });
  }
});

// Financeiro Disk assina SEMPRE POR ÚLTIMO (bloqueado se produtor não tiver assinado)
app.post('/api/assinaturas/:id/financeiro', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const doc = workflowEngine.assinarComoDisk(req.params.id, user?.nome || 'Maria Valente', '127.0.0.1');
    res.json(doc);
  } catch (err: any) {
    // Retorna erro se a ordem sequencial for violada
    res.status(400).json({ erro: err.message });
  }
});

// --- 6. LIQUIDAÇÃO BANCÁRIA PIX E LEDGER ---
app.post('/api/solicitacoes/:id/liquidar-pix', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const resultado = workflowEngine.liquidarRepassePIX(req.params.id, user?.nome || 'Tesouraria Disk');
    res.json(resultado);
  } catch (err: any) {
    res.status(400).json({ erro: err.message });
  }
});

// --- 7. LEDGER DE PARTIDAS DOBRADAS ---
app.get('/api/financeiro/ledger', authMiddleware, (_req: Request, res: Response) => {
  res.json(workflowEngine.obterLedger());
});

export default app;
