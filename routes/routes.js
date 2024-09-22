import express, { Router } from 'express'
import { SignJWT } from 'jose'
import { configJWT } from '../config/index.js'
import { generateTokenValidator, validateTokenEntry } from '../help/validationRoules.js';
import { validationResult } from "express-validator";

const router = Router();

router.post('/generateToken', generateTokenValidator(), async (req, res) => {
    let error = validationResult(req);
    if (!error.isEmpty()) return res.status(400).json({ message: "Error en la entrada de datos" });
    try {
        const authHeader = req.headers.authorization;
        const { clientName, pdf_name } = req.body
        if (!authHeader || !authHeader.startsWith('key')) {
            return res.status(403).json({ error: 'Acceso no autorizado: Falta el token.' });
        }
        const key = authHeader.split(' ')[1];
        if (key !== configJWT.private_key) {
            return res.status(403).json({ error: "Clave no válida." })
        }
        const jwtConstructor = new SignJWT({ clientName, pdf_name });
        const encoder = new TextEncoder();
        const jwt = await jwtConstructor
            .setProtectedHeader({ alg: "HS256", typ: "JWT" })
            .setIssuedAt()
            .setExpirationTime("5 min")
            .sign(encoder.encode(configJWT.private_key))
        return res.status(200).json({ jwt })
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})

router.get('/media_content', validateTokenEntry, async (req, res) => {
    let error = validationResult(req);
    if (!error.isEmpty()) return res.status(400).json({ message: "Error en la entrada de datos" });
    return res.status(200).json({ message: "Operación completada con éxito" })


})


export default router