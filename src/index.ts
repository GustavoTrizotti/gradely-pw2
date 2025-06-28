import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import alunosRoutes from './routes/alunos';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/', authRoutes);

app.use('/alunos', alunosRoutes);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
