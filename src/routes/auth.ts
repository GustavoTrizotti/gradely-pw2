import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { users } from '../data/users';

const router = Router();

router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password } = req.body;
      if (users.find(u => u.username === username)) {
        res.status(400).json({ message: 'Usuário já existe!' });
        return;
      }
      const hash = await bcrypt.hash(password, 10);
      users.push({ username, password: hash });
      res.status(201).json({ message: 'Usuário registrado!' });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password } = req.body;
      const user = users.find(u => u.username === username);
      const passwordMatches = user
        ? await bcrypt.compare(password, user.password)
        : false;

      if (!user || !passwordMatches) {
        res.status(401).json({ message: 'Login incorreto!' });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET as string;

      const expiresInSeconds = 3 * 60;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const exp = nowInSeconds + expiresInSeconds;

      const payload: JwtPayload = { username, exp };

      const token = jwt.sign(
        payload,
        jwtSecret
      );

      res.json({ token: `Bearer ${token}` });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
