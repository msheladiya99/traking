import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as orderService from '../services/orderService.js';
import * as emailService from '../services/emailService.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-this-in-production';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (email.trim().toLowerCase() !== ADMIN_EMAIL.trim().toLowerCase() || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    // Sign JWT token valid for 24h
    const token = jwt.sign(
      { email: ADMIN_EMAIL, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      admin: {
        email: ADMIN_EMAIL,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response) {
  return res.json({
    success: true,
    admin: {
      email: ADMIN_EMAIL,
    },
  });
}

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = await orderService.getDashboardMetrics();
    return res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrdersList(req: Request, res: Response, next: NextFunction) {
  try {
    const search = req.query.search as string;
    const statusFilter = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    const result = await orderService.getOrders({
      search,
      statusFilter,
      startDate,
      endDate,
      page,
      limit,
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
}

export async function generateTrackingLink(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const trackingData = await orderService.generateOrGetTrackingToken(id);

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const trackingUrl = `${appUrl}/track/${trackingData.tracking_token}`;

    return res.json({
      success: true,
      data: {
        ...trackingData,
        trackingUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleTracking(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Field "enabled" must be a boolean.' });
    }

    const updated = await orderService.toggleTrackingState(id, enabled);

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendTrackingEmailRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { recipientEmail } = req.body || {};

    const trackingData = await orderService.generateOrGetTrackingToken(id);

    if (!trackingData || !trackingData.tracking_token) {
      return res.status(400).json({ success: false, message: 'Tracking link not generated yet.' });
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const trackingUrl = `${appUrl}/track/${trackingData.tracking_token}`;

    const order = await orderService.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const targetEmail = (recipientEmail && recipientEmail.trim()) || order.email;
    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'Please provide a valid recipient email address.' });
    }

    const result = await emailService.sendTrackingEmail(order, trackingUrl, targetEmail);

    return res.json({
      success: true,
      message: `Tracking email sent successfully to ${targetEmail}.`,
      data: result,
    });
  } catch (error: any) {
    console.error('Error sending tracking email:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send tracking email.',
    });
  }
}

export async function updateOrderAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { address, city, state, pin, customerName, first_name, last_name, email, phone, total_amount } = req.body;

    const updated = await orderService.updateOrderAddress(id, {
      address,
      city,
      state,
      pin,
      customerName,
      first_name,
      last_name,
      email,
      phone,
      total_amount,
    });

    return res.json({
      success: true,
      message: 'Address and customer details updated successfully.',
      order: updated,
    });
  } catch (error: any) {
    console.error('Error updating order address:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order address.',
    });
  }
}

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId, customerName, email, phone, address, city, state, pin, total_amount, product_name } = req.body;

    if (!email || !address || !city) {
      return res.status(400).json({ success: false, message: 'Email, address, and city are required.' });
    }

    const newOrder = await orderService.createManualOrder({
      orderId,
      customerName: customerName || 'Customer',
      email,
      phone,
      address,
      city,
      state: state || 'Gujarat',
      pin: pin || '',
      total_amount: total_amount || '1999',
      product_name: product_name || 'Premium Ghaghra Choli',
    });

    return res.status(201).json({
      success: true,
      message: 'Manual order created successfully.',
      order: newOrder,
    });
  } catch (error: any) {
    console.error('Error creating manual order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create manual order.',
    });
  }
}

