import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed do Banco PostgreSQL: RH Disk & Disk Ponto (Fase 4) ---');

  const defaultHash = await bcrypt.hash('Disk@123', 10);

  // 1. Locais e Geofences
  const sede = await prisma.localPonto.upsert({
    where: { id: 'sede-disk' },
    update: {},
    create: {
      id: 'sede-disk',
      nome: 'Sede DiskIngressos Curitiba',
      endereco: 'Rua Visconde de Nácar, 1505 - Centro, Curitiba/PR',
      latitude: -25.4284,
      longitude: -49.2733,
      raioMetros: 150,
      ativo: true
    }
  });

  const arena = await prisma.localPonto.upsert({
    where: { id: 'arena-baixada' },
    update: {},
    create: {
      id: 'arena-baixada',
      nome: 'Arena da Baixada (Ligga Arena)',
      endereco: 'Rua Buenos Aires, 1260 - Água Verde, Curitiba/PR',
      latitude: -25.4484,
      longitude: -49.2770,
      raioMetros: 350,
      ativo: true
    }
  });

  // 2. Jornadas com tolerância e carga prevista
  const jornada44 = await prisma.jornada.upsert({
    where: { id: 'jor-padrao-44h' },
    update: {},
    create: {
      id: 'jor-padrao-44h',
      nome: 'Comercial Padrão 44h (Seg-Sex)',
      entrada: '08:00',
      inicioIntervalo: '12:00',
      fimIntervalo: '13:00',
      saida: '17:48',
      toleranciaMinutos: 10,
      cargaMinutos: 480
    }
  });

  const jornadaShow = await prisma.jornada.upsert({
    where: { id: 'jor-show-noturno' },
    update: {},
    create: {
      id: 'jor-show-noturno',
      nome: 'Operação Show Turno Noturno',
      entrada: '14:00',
      inicioIntervalo: '18:00',
      fimIntervalo: '19:00',
      saida: '23:00',
      toleranciaMinutos: 15,
      cargaMinutos: 540
    }
  });

  // 3. Usuários e Colaboradores com SoD e Centros de Custo
  const userAdmin = await prisma.usuario.upsert({
    where: { email: 'admin@diskingressos.com.br' },
    update: {},
    create: {
      email: 'admin@diskingressos.com.br',
      senhaHash: defaultHash,
      perfil: 'ADMINISTRADOR'
    }
  });

  const userRh = await prisma.usuario.upsert({
    where: { email: 'rh@diskingressos.com.br' },
    update: {},
    create: {
      email: 'rh@diskingressos.com.br',
      senhaHash: defaultHash,
      perfil: 'RH'
    }
  });

  const userAna = await prisma.usuario.upsert({
    where: { email: 'ana.martins@diskingressos.com.br' },
    update: {},
    create: {
      email: 'ana.martins@diskingressos.com.br',
      senhaHash: defaultHash,
      perfil: 'COLABORADOR'
    }
  });

  const colabAna = await prisma.colaborador.upsert({
    where: { cpf: '123.456.789-01' },
    update: {},
    create: {
      nome: 'Ana Martins',
      cpf: '123.456.789-01',
      matricula: 'DI-001',
      cargo: 'Analista de Operações',
      departamento: 'Operações e Eventos',
      centroCusto: 'CC-010-OPS',
      cargaHorariaSemanal: 44,
      usuarioId: userAna.id,
      ativo: true
    }
  });

  const userCarlos = await prisma.usuario.upsert({
    where: { email: 'carlos.souza@diskingressos.com.br' },
    update: {},
    create: {
      email: 'carlos.souza@diskingressos.com.br',
      senhaHash: defaultHash,
      perfil: 'COLABORADOR'
    }
  });

  const colabCarlos = await prisma.colaborador.upsert({
    where: { cpf: '234.567.890-12' },
    update: {},
    create: {
      nome: 'Carlos Souza',
      cpf: '234.567.890-12',
      matricula: 'DI-002',
      cargo: 'Assistente de Operações',
      departamento: 'Operações e Eventos',
      centroCusto: 'CC-010-OPS',
      cargaHorariaSemanal: 44,
      usuarioId: userCarlos.id,
      ativo: true
    }
  });

  // 4. Escalas vinculadas a Local e Evento
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);

  await prisma.escala.upsert({
    where: { colaboradorId_data: { colaboradorId: colabAna.id, data: hoje } },
    update: {},
    create: {
      colaboradorId: colabAna.id,
      jornadaId: jornada44.id,
      localId: sede.id,
      data: hoje,
      eventoNome: 'Operação Sede Disk',
      observacao: 'Escala regular presencial'
    }
  });

  await prisma.escala.upsert({
    where: { colaboradorId_data: { colaboradorId: colabCarlos.id, data: hoje } },
    update: {},
    create: {
      colaboradorId: colabCarlos.id,
      jornadaId: jornadaShow.id,
      localId: arena.id,
      data: hoje,
      eventoNome: 'Festival Curitiba 2026',
      observacao: 'Operação Show Turno Noturno'
    }
  });

  // 5. Dispositivos Autorizados do Disk Ponto
  await prisma.dispositivo.upsert({
    where: { identificador: 'dev-samsung-a55-ana' },
    update: {},
    create: {
      identificador: 'dev-samsung-a55-ana',
      colaboradorId: colabAna.id,
      nome: 'Galaxy A55 (Corporativo)',
      plataforma: 'Android 14',
      status: 'AUTORIZADO',
      ultimoAcesso: new Date()
    }
  });

  await prisma.dispositivo.upsert({
    where: { identificador: 'dev-moto-g84-carlos' },
    update: {},
    create: {
      identificador: 'dev-moto-g84-carlos',
      colaboradorId: colabCarlos.id,
      nome: 'Moto G84 (Pessoal)',
      plataforma: 'Android 13',
      status: 'AUTORIZADO',
      ultimoAcesso: new Date()
    }
  });

  // 6. Banco de Horas Inicial (Competência 2026-10)
  await prisma.bancoHoras.upsert({
    where: { colaboradorId_competencia: { colaboradorId: colabAna.id, competencia: '2026-10' } },
    update: {},
    create: {
      colaboradorId: colabAna.id,
      competencia: '2026-10',
      minutosSaldo: 320, // +5h 20m
      minutosExtras: 320,
      minutosDebito: 0
    }
  });

  await prisma.bancoHoras.upsert({
    where: { colaboradorId_competencia: { colaboradorId: colabCarlos.id, competencia: '2026-10' } },
    update: {},
    create: {
      colaboradorId: colabCarlos.id,
      competencia: '2026-10',
      minutosSaldo: -75, // -1h 15m
      minutosExtras: 70,
      minutosDebito: 145
    }
  });

  // 7. Fechamento de Ponto
  await prisma.fechamentoPonto.upsert({
    where: { competencia: '2026-09' },
    update: {},
    create: {
      competencia: '2026-09',
      status: 'FECHADO',
      fechadoEm: new Date('2026-10-01T10:00:00Z'),
      fechadoPor: userRh.id,
      observacao: 'Competência Setembro/2026 homologada sem pendências'
    }
  });

  await prisma.fechamentoPonto.upsert({
    where: { competencia: '2026-10' },
    update: {},
    create: {
      competencia: '2026-10',
      status: 'EM_ANALISE',
      observacao: 'Competência Outubro/2026 aberta para apuração'
    }
  });

  console.log('✓ Locais criados:', sede.nome, '|', arena.nome);
  console.log('✓ Jornadas criadas:', jornada44.nome, '|', jornadaShow.nome);
  console.log('✓ Usuários, Colaboradores, Escalas, Dispositivos e Banco de Horas semeados com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed Prisma:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
