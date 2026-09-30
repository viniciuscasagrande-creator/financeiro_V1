import { apiClient } from './api';
import { UsuarioSession, PerfilUsuario } from '../types';

export const authService = {
  async login(email: string, senha: string): Promise<UsuarioSession> {
    try {
      const response = await apiClient.post<UsuarioSession>('/auth/login', { email, senha });
      if (response.data.token) {
        localStorage.setItem('disk_token', response.data.token);
      }
      return response.data;
    } catch {
      // Mock Fallback para demonstração autônoma
      let mockUser: UsuarioSession;
      if (email.includes('produtor')) {
        mockUser = {
          id: 'usr-prod-01',
          email: 'produtor@demo.disk',
          nome: 'João Silva',
          perfil: 'PRODUTOR',
          produtorId: 'prod-abc',
          cargo: 'Diretor Financeiro Produtora ABC'
        };
      } else if (email.includes('admin')) {
        mockUser = {
          id: 'usr-adm-01',
          email: 'admin@demo.disk',
          nome: 'Vinicius Master',
          perfil: 'ADMINISTRADOR',
          cargo: 'Administrador Master'
        };
      } else {
        mockUser = {
          id: 'usr-fin-01',
          email: 'financeiro@demo.disk',
          nome: 'Maria Valente',
          perfil: 'FINANCEIRO',
          cargo: 'Supervisora Tesouraria Disk'
        };
      }
      localStorage.setItem('disk_token', `demo_token_${mockUser.perfil}`);
      return mockUser;
    }
  },

  logout(): void {
    localStorage.removeItem('disk_token');
  }
};
