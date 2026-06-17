import express from 'express';
import path from 'path'
import { fileURLToPath } from 'node:url';
import cors from 'cors'

const app = express();
const PORT = 8081;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors())
app.use(express.static(__dirname));
app.get('/{*path}', (req, res)=>{
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT, ()=>{
    console.log(`Frontend rodando em http://localhost:${PORT}`)
})