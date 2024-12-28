import express from 'express';
import cors from 'cors';
import UserRoutes from './routes/UserRoutes.js';
import PetRoutes from './routes/PetRoutes.js';

const port = 3017;
const app = express(); // Invocação do express

app.use(express.static('public'));  // Definicão de arquivos estaticos
app.use(express.json());    // Definição para leitura de arquivos JSON
app.use(cors({ credentials: true, origin: 'http://localhost:3018' }));  // Endereço da apliação no front end
app.use(express.static('public'));  // Definicão de arquivos estaticos

// Routes
app.use('/users', UserRoutes);
app.use('/pets', PetRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}!`);
});