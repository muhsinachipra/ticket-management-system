import { Router } from 'express';
import { createTicket, assignUserToTicket } from '../controllers/ticketController';

const router = Router();

router.post('/tickets', createTicket);
router.post('/tickets/:ticketId/assign', assignUserToTicket);

export default router;
