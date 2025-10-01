import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { JwtPayload } from '../models/types';


// Maneja la solicitud para obtener el estado del usuario autenticado.
 
export async function getUserStatus(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user as JwtPayload;
    const userStatus = await userService.getUserStatus(userPayload);
    return res.status(200).json(userStatus);
  } catch (error: any) {
    console.error('Error al obtener el estado del usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
