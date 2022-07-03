require('dotenv').config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors({
    origin: process.env.CORS
}));

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
