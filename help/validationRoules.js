import { body } from 'express-validator'
import validator from 'validator'
import { jwtVerify } from 'jose';
import { configJWT } from '../config/index.js';

const sanitizeInput = (input) => {
    let sanitizedInput = validator.trim(input);
    sanitizedInput = validator.escape(sanitizedInput);
    sanitizedInput = validator.stripLow(sanitizedInput);

    return sanitizedInput;
}
// Función auxiliar para verificar tokens JWT y su expiración
const verifyJWT = async (token) => {
    const encoder = new TextEncoder();
    return await jwtVerify(token, encoder.encode(configJWT.private_key));
}
export const generateTokenValidator = () => [
    body('clientName').notEmpty().isString().customSanitizer(value => sanitizeInput(value)),
    body('pdf_name').notEmpty().isString().customSanitizer(value => sanitizeInput(value))
];

// Middleware para validar tokens en general
export const validateTokenEntry = async (req, res, next) => {
    const authorization = req.query.token;
    if (!authorization) return res.status(401).json({ message: "Token No proporcionado" });
    try {
        const { payload } = await verifyJWT(authorization);

        // Verificación de expiración del token
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            return res.status(401).json({ message: "Token expirado" });
        }
        req.folder = `${payload.clientName}/${payload.pdf_name}`;
        next();
    } catch (error) {
        return res.status(500).json({ error: "Internal server Error", details: error.message });
    }
}