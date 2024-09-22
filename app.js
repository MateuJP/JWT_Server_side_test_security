import express from 'express'
import cors from 'cors'
import router from './routes/routes.js';
const app = express();

app.use(cors())

app.use(express.json())

app.use('/client/v1/', router)

app.listen(3000, () => {
    console.log('Server UP running in http://localhost:3000/')
})