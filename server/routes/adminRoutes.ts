import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public Admin auth route
router.post('/login', adminController.login);

// Protected Admin routes
router.use(requireAdminAuth);
router.get('/me', adminController.getMe);
router.get('/dashboard', adminController.getDashboard);
router.get('/orders', adminController.getOrdersList);
router.post('/orders', adminController.createOrder);
router.get('/orders/:id', adminController.getOrderDetails);
router.put('/orders/:id/address', adminController.updateOrderAddress);
router.patch('/orders/:id/address', adminController.updateOrderAddress);
router.post('/orders/:id/tracking', adminController.generateTrackingLink);
router.patch('/orders/:id/tracking', adminController.toggleTracking);
router.post('/orders/:id/send-email', adminController.sendTrackingEmailRoute);

export default router;

