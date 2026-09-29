/**
 * Middleware de Segurança & Isolamento Estrito de Tenant
 * Regra: Um Produtor NUNCA tem permissão para consultar dados de outro Produtor.
 */

import { ContextoRequisicao, PerfilUsuario } from '../types';

export class AuthMiddleware {
  /**
   * Garante o isolamento estrito entre produtores (Multi-tenant)
   * Se o Produtor A (id: prod-abc) tentar acessar dados do Produtor B (id: prod-xyz), retorna 403.
   */
  static validarIsolamentoTenant(contexto: ContextoRequisicao, produtorAlvoId: string): void {
    if (contexto.perfil === "PRODUTOR") {
      if (!contexto.produtorId || contexto.produtorId !== produtorAlvoId) {
        throw new Error(
          `403 — Acesso não autorizado: O usuário ${contexto.usuarioId} (Produtor: ${contexto.produtorId}) não possui permissão para acessar os dados do Produtor ${produtorAlvoId}.`
        );
      }
    }
  }

  /**
   * Exige perfil mínimo para execução de rotas administrativas ou de tesouraria
   */
  static exigirPerfil(contexto: ContextoRequisicao, perfisAutorizados: PerfilUsuario[]): void {
    if (!perfisAutorizados.includes(contexto.perfil) && contexto.perfil !== "ADMINISTRADOR") {
      throw new Error(
        `403 — Acesso proibido: Ação restrita aos perfis: [${perfisAutorizados.join(', ')}]. Perfil atual: ${contexto.perfil}.`
      );
    }
  }
}
