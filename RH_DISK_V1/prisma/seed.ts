import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed do Banco PostgreSQL: RH Disk & Disk Ponto ---');

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

  // 2. Jornadas
  const jornada44 = await prisma.jornada.upsert({
    where: { id: 'jor-padrao-44h' },
    update: {},
    create: {
      id: 'jor-padrao-44h',
      nome: 'Comercial Padrão 44h (Seg-Sex)',
      entrada: '08:00',
      inicioIntervalo: '12:00',
      fimIntervalo: '13:00',
      saida: '17:48'
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
      saida: '23:00'
    }
  });

  // 3. Usuários e Colaboradores
  const userAdmin = await prisma.usuario.upsert({
    where: { email: 'admin@diskingressos.com.br' },
    update: {},
    create: {
      email: 'admin@diskingressos.com.br',
      senhaHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6df.7s1wR7FmEeq', // admin123
      perfil: 'ADMINISTRADOR'
    }
  });

  const userRh = await prisma.usuario.upsert({
    where: { email: 'rh@diskingressos.com.br' },
    update: {},
    create: {
      email: 'rh@diskingressos.com.br',
      senhaHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6df.7s1wR7FmEeq', // rh123
      perfil: 'RH'
    }
  });

  const userAna = await prisma.usuario.upsert({
    where: { email: 'ana.martins@diskingressos.com.br' },
    update: {},
    create: {
      email: 'ana.martins@diskingressos.com.br',
      senhaHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6df.7s1wR7FmEeq', // ponto123
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
      departamento: 'Operações',
      usuarioId: userAna.id,
      ativo: true
    }
  });

  const userCarlos = await prisma.usuario.upsert({
    where: { email: 'carlos.souza@diskingressos.com.br' },
    update: {},
    create: {
      email: 'carlos.souza@diskingressos.com.br',
      senhaHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6df.7s1wR7FmEeq', // ponto123
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
      departamento: 'Operações',
      usuarioId: userCarlos.id,
      ativo: true
    }
  });

  console.log('✓ Locais criados:', sede.nome, '|', arena.nome);
  console.log('✓ Jornadas criadas:', jornada44.nome, '|', jornadaShow.nome);
  console.log('✓ Usuários e Colaboradores semeados com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed Prisma:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
