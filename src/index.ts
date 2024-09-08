// src/index.ts
import express from 'express';
import merkleRoutes from './routes/merkleRoutes';

const app = express();
const port = 3010;

app.use(express.json());
app.use('/api', merkleRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
