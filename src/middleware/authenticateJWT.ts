import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
): any {
  const authHeader = req.header('Authorization');
  console.log('Authorization: ' + authHeader);

  let token: string | undefined;
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Acesso negado. Token expirado.' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: 'Acesso negado. Token inválido.' });
      } else {
        return res.status(403).json({ message: 'Acesso negado. Erro na verificação do token.' });
      }
    }

    const user = decoded as JwtPayload;
    
    // @ts-ignore
    req.user = user;

    const issuedAtISO = new Date((user.iat! * 1000)).toISOString();
    const expiresAtISO = new Date((user.exp! * 1000)).toISOString();
    console.log(`Token validado para usuário: ${user.username}
    Emitido em: ${issuedAtISO}
    Expira em: ${expiresAtISO}
      `);

    next();
  });
}
