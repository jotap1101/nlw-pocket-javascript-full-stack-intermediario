import 'dotenv/config';  // Para carregar variáveis do .env
import { drizzle } from 'drizzle-orm/node-postgres';  // Drizzle para PostgreSQL
import { Pool } from 'pg';  // Driver do PostgreSQL
import { goalCompletions, goals } from './schema';  // Suas tabelas
import dayjs from 'dayjs';  // Biblioteca de datas

// Função principal de seed
async function seed() {
    // Criar pool de conexões com o PostgreSQL usando a URL do Neon
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,  // Pega do .env
        ssl: {
            rejectUnauthorized: false,  // Necessário para Neon
        },
    });

    // Conectar ao banco de dados usando o Drizzle com Pool
    const db = drizzle(pool);

    // Apagar todos os dados de 'goalCompletions' e 'goals'
    await db.delete(goalCompletions);
    await db.delete(goals);

    // Inserir algumas metas no banco de dados e retornar os resultados
    const result = await db.insert(goals).values([
        { title: 'Acordar cedo', desiredWeeklyFrequency: 5 },
        { title: 'Me exercitar', desiredWeeklyFrequency: 3 },
        { title: 'Meditar', desiredWeeklyFrequency: 1 }
    ]).returning();

    // Definir o início da semana para usar como data de conclusão
    const startOfWeek = dayjs().startOf('week');

    // Inserir algumas conclusões de metas com base nas metas criadas
    await db.insert(goalCompletions).values([
        { goalId: result[0].id, createdAt: startOfWeek.toDate() },
        { goalId: result[1].id, createdAt: startOfWeek.add(1, 'day').toDate() },
    ]);

    console.log('Banco de dados populado com sucesso!');
}

// Executar a função seed
seed().catch((err) => {
    console.error('Erro ao semear o banco de dados: ', err);
    process.exit(1);  // Finalizar com erro
});
