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

export async function getProfile(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user as JwtPayload;
    const userProfile = await userService.getUserProfile(userPayload.id_user);

    if (!userProfile) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    return res.status(200).json(userProfile);
  } catch (error: any) {
    console.error('Error al obtener el perfil del usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user as JwtPayload;
    const { name, phone } = req.body;

    // Validación simple: al menos uno de los campos debe estar presente
    if (!name && !phone) {
      return res.status(400).json({ error: 'Se requiere al menos un campo (nombre o teléfono) para actualizar.' });
    }

    const updatedUser = await userService.updateUserProfile(userPayload.id_user, { name, phone });

    return res.status(200).json({ message: 'Perfil actualizado con éxito', user: updatedUser });

  } catch (error: any) {
    console.error('Error al actualizar el perfil del usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
