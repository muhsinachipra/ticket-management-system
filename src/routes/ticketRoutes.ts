import { Router } from 'express';
import { createTicket, assignUserToTicket } from '../controllers/ticketController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { createTicketValidation } from '../validators/ticketValidation';

const router = Router();

router.post('/tickets', authenticateJWT, createTicketValidation, createTicket);
router.post('/tickets/:ticketId/assign', assignUserToTicket);

export default router;
