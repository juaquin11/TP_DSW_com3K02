import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// Rutas de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀');
});


app.use('/api/restaurants', restaurantRoutes);

// health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
