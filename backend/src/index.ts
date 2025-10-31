import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import dishRoutes from './routes/dishCRUD.routes';
import categoryRoutes from './routes/category.routes'; 
import districtRoutes from './routes/district.routes'; 
import userRoutes from './routes/user.routes'; 
import reservationRoutes from './routes/reservation.routes'; 
import subscriptionRoutes from './routes/subscription.routes';
import reviewRoutes from './routes/review.routes';
import paymentRoutes from './routes/payment.routes'; 
import * as paymentController from './controllers/payment.controller';


const app = express();
app.use(cors());

app.post(
  '/api/payments/webhook', 
  express.raw({type: 'application/json'}), 
  paymentController.handleStripeWebhook
);

app.use(express.json());


// Servir archivos estáticos desde la carpeta 'public'
// Ahora, las imágenes en 'public/uploads' serán accesibles desde http://localhost:3000/uploads/nombre-archivo.ext
const uploadsDir = path.join(__dirname, '../public/uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reservations', reservationRoutes); 
app.use('/api/reviews', reviewRoutes);
app.use('/api/subscriptions', subscriptionRoutes); 
app.use('/api/payments', paymentRoutes); 

// Rutas de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀');
});


// health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
