import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import dishRoutes from './routes/dishCRUD.routes';
import categoryRoutes from './routes/category.routes'; 


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/categories', categoryRoutes);



// Rutas de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀');
});



// health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
