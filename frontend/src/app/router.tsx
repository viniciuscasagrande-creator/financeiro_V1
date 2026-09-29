import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { LoginPage } from '../auth/LoginPage';
import { RoleRoute } from '../auth/RoleRoute';
import { ProdutorLayout } from '../layouts/ProdutorLayout';
import { FinanceiroLayout } from '../layouts/FinanceiroLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { CentralAprovacoes } from '../financeiro/aprovacoes/CentralAprovacoes';
import { SaldosProdutor } from '../produtor/saldos/SaldosProdutor';
import { ExtratoProdutor } from '../produtor/extrato/ExtratoProdutor';
import { DadosBancariosProdutor } from '../produtor/dados-bancarios/DadosBancariosProdutor';
import { BorderosProdutor } from '../produtor/borderos/BorderosProdutor';
import { ProdutoresFinanceiro } from '../financeiro/produtores/ProdutoresFinanceiro';
import { GatewaysFinanceiro } from '../financeiro/gateways/GatewaysFinanceiro';
import { LedgerFinanceiro } from '../financeiro/ledger/LedgerFinanceiro';
import { TesourariaFinanceiro } from '../financeiro/tesouraria/TesourariaFinanceiro';

export const AppRouter: React.FC = () => {
  const { usuario, perfil, logout } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');

  // Se o usuário não estiver autenticado, exibe a tela de login
  if (!usuario) {
    return <LoginPage onLoginSuccess={() => setCurrentRoute('/dashboard')} />;
  }

  // AMBIENTE DO PRODUTOR (/produtor)
  if (perfil === 'PRODUTOR') {
    return (
      <RoleRoute allowedRoles={['PRODUTOR']}>
        <ProdutorLayout
          activeRoute={currentRoute}
          onNavigate={(route) => setCurrentRoute(route)}
          onOpenSolicitarRepasse={() => setCurrentRoute('/produtor/repasses')}
        >
          <div className="p-2">
            {currentRoute === '/dashboard' && (
              <SaldosProdutor onSolicitarRepasse={() => setCurrentRoute('/produtor/repasses')} />
            )}
            {currentRoute.includes('/saldos') && (
              <SaldosProdutor onSolicitarRepasse={() => setCurrentRoute('/produtor/repasses')} />
            )}
            {currentRoute.includes('/extrato') && <ExtratoProdutor />}
            {currentRoute.includes('/repasses') && (
              <div className="p-3 bg-white rounded shadow-sm border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-1">Solicitações de Repasse</h5>
                    <p className="text-muted fs-xs mb-0">Envio para análise da tesouraria Disk Ingressos.</p>
                  </div>
                  <button className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm">
                    <i className="ph-plus-circle"></i> Nova Solicitação
                  </button>
                </div>
                <div className="alert alert-warning p-3 d-flex align-items-center justify-content-between rounded border-0 shadow-sm mb-3">
                  <div>
                    <strong className="d-block fs-sm text-dark">Solicitação #REP-000129 em Análise</strong>
                    <span className="fs-xs text-muted">Festival Curitiba 2026 &bull; R$ 80.000,00 &bull; Destino: Itaú Ag. 0432 Conta 48291-0</span>
                  </div>
                  <span className="badge bg-warning text-dark px-3 py-2">Aguardando Análise Disk</span>
                </div>
              </div>
            )}
            {currentRoute.includes('/borderos') && <BorderosProdutor />}
            {currentRoute.includes('/dados-bancarios') && <DadosBancariosProdutor />}
          </div>
        </ProdutorLayout>
      </RoleRoute>
    );
  }

  // AMBIENTE ADMINISTRADOR MASTER (/admin)
  if (perfil === 'ADMINISTRADOR') {
    return (
      <RoleRoute allowedRoles={['ADMINISTRADOR']}>
        <AdminLayout
          activeRoute={currentRoute}
          onNavigate={(route) => setCurrentRoute(route)}
        >
          {currentRoute.includes('/aprovacoes') && <CentralAprovacoes />}
          {currentRoute.includes('/produtores') && <ProdutoresFinanceiro />}
          {currentRoute.includes('/gateways') && <GatewaysFinanceiro />}
          {currentRoute.includes('/ledger') && <LedgerFinanceiro />}
          {currentRoute.includes('/tesouraria') && <TesourariaFinanceiro />}
          {currentRoute === '/dashboard' && <ProdutoresFinanceiro />}
        </AdminLayout>
      </RoleRoute>
    );
  }

  // AMBIENTE FINANCEIRO DISK (/financeiro)
  return (
    <RoleRoute allowedRoles={['FINANCEIRO', 'ADMINISTRADOR']}>
      <FinanceiroLayout
        activeRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
      >
        {currentRoute.includes('/aprovacoes') && <CentralAprovacoes />}
        {currentRoute.includes('/produtores') && <ProdutoresFinanceiro />}
        {currentRoute.includes('/gateways') && <GatewaysFinanceiro />}
        {currentRoute.includes('/ledger') && <LedgerFinanceiro />}
        {currentRoute.includes('/tesouraria') && <TesourariaFinanceiro />}
        {currentRoute === '/dashboard' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <h4 className="fw-bold mb-0">Dashboard Financeiro Disk (Backoffice)</h4>
                <span className="text-muted fs-xs">Mesa de Operações &bull; Visão Transversal de Produtores e Liquidez</span>
              </div>
              <button
                className="btn btn-sm btn-warning fw-bold d-flex align-items-center gap-1 shadow-sm"
                onClick={() => setCurrentRoute('/aprovacoes')}
              >
                <i className="ph-scales"></i> <span>Central de Aprovações (17)</span>
              </button>
            </div>
            <ProdutoresFinanceiro />
          </div>
        )}
      </FinanceiroLayout>
    </RoleRoute>
  );
};

export default AppRouter;
