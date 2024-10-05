// src\routes\ticketRoutes.ts

import { Router } from 'express';
import { createTicket, assignUserToTicket, getTicketDetails, getTicketAnalytics, getTicketDashboardAnalytics } from '../controllers/ticketController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { createTicketValidation } from '../validators/ticketValidation';

const router = Router();

router.post('/tickets', authenticateJWT, createTicketValidation, createTicket);
router.get('/tickets/analytics', authenticateJWT, getTicketAnalytics);
router.post('/tickets/:ticketId/assign', authenticateJWT, assignUserToTicket);
router.get('/tickets/:ticketId', authenticateJWT, getTicketDetails);
router.get('/dashboard/analytics', authenticateJWT, getTicketDashboardAnalytics);


export default router;
