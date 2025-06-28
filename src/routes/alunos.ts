import { Router, Request, Response } from 'express';
import { alunos } from '../data/alunos';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { IncomingStudent, Student } from '../models/types';

const router = Router();
router.use(authenticateJWT);

router.get('/', (_req, res: Response) => {
  res.json(alunos);
});

router.get('/medias', (_req, res: Response) => {
  const result = alunos.map(a => ({
    nome: a.nome,
    media: Number(((a.nota1 + a.nota2) / 2).toFixed(2)),
  }));
  res.json(result);
});

router.get('/aprovados', (_req, res: Response) => {
  const result = alunos.map(a => {
    const media = (a.nota1 + a.nota2) / 2;
    return {
      nome: a.nome,
      status: media >= 6 ? 'aprovado' : 'reprovado',
    };
  });
  res.json(result);
});

router.get('/:id', (req: Request, res: Response) => {
  const { id: idParam } = req.params;

  // validação “manual” de número
  if (!/^\d+$/.test(idParam)) {
    res.status(400).json({ message: 'ID inválido! Use apenas dígitos.' });
    return;
  }

  const id = Number(idParam);

  const aluno = alunos.find(a => a.id === id);
  if (!aluno) {
    res.status(404).json({ message: 'Aluno não encontrado!' });
    return;
  }
  res.json(aluno);
});


router.post('/', (req: Request, res: Response) => {
  const novo = req.body as IncomingStudent;

  const maxId = alunos.length > 0 ? Math.max(...alunos.map(a => a.id)) : 0;

 const aluno: Student = {
    id: maxId + 1,
    ...novo
  };

  alunos.push(aluno);
  res.status(201).json(novo);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id: idParam } = req.params;
  if (!/^\d+$/.test(idParam)) {
    res.status(400).json({ message: 'ID inválido! Use apenas dígitos.' });
    return;
  }

  const id = Number(idParam);
  const idx = alunos.findIndex(a => a.id === id);

  if (idx < 0) {
    res.status(404).json({ message: 'Aluno não encontrado!' });
    return;
  }

  alunos[idx] = { id, ...req.body };
  res.json(alunos[idx]);
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id: idParam } = req.params;
  if (!/^\d+$/.test(idParam)) {
    res.status(400).json({ message: 'ID inválido! Use apenas dígitos.' });
    return;
  }

  const id = Number(idParam);
  const idx = alunos.findIndex(a => a.id === id);

  if (idx < 0) {
    res.status(404).json({ message: 'Aluno não encontrado!' });
    return;
  }
  const [removido] = alunos.splice(idx, 1);
  res.json(removido);
});

export default router;
