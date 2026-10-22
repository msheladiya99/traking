import nodemailer from 'nodemailer';

// You will need to configure your actual SMTP credentials in the .env file
// Example for Gmail: EMAIL_USER=your-email@gmail.com, EMAIL_PASS=your-app-password
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
});

export async function sendTrackingEmail(order: any, trackingUrl: string, customRecipient?: string) {
  const customerEmail = (customRecipient && customRecipient.trim()) || order.email;
  if (!customerEmail) {
    throw new Error(`No customer email address specified for order ${order.orderId || order.order_id || order.id || 'N/A'}`);
  }

  const billAmount = order.total_amount || 0;
  
  // Format the delivery address
  let addressText = 'Delivery Address Details Not Found';
  if (order.address || order.city) {
    addressText = `${order.address || ''}, ${order.city || ''}, ${order.state || ''} - ${order.pin || ''}`.replace(/^, | , | - $/g, '').trim();
  }

  const orderIdDisplay = order.orderId || order.order_id || order.id || 'N/A';
  const customerName = order.customerName || (order.first_name ? `${order.first_name} ${order.last_name || ''}`.trim() : 'Customer');

  const mailOptions = {
    from: `"Vastriya Tracking" <${process.env.EMAIL_USER || 'no-reply@vastriya.com'}>`,
    to: customerEmail,
    subject: `Your Tracking Link for Order #${orderIdDisplay} - Vastriya`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="background-color: #881337; padding: 28px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Vastriya</h1>
          <p style="color: #fecdd3; margin: 6px 0 0; font-size: 14px;">Order Tracking Notification</p>
        </div>

        <div style="padding: 28px 24px;">
          <p style="font-size: 16px; margin-top: 0;">Hello <strong>${customerName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Your order is being processed! A real-time tracking link has been generated so you can track your package every step of the way.
          </p>
          
          <div style="background-color: #fff1f2; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #ffe4e6;">
            <h3 style="margin-top: 0; color: #9f1239; font-size: 15px; border-bottom: 1px solid #fecdd3; padding-bottom: 10px;">Order & Delivery Information</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 130px;">Order ID:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">#${orderIdDisplay}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Amount:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">₹${billAmount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; vertical-align: top;">Delivery Address:</td>
                <td style="padding: 8px 0; font-weight: 500; color: #334155; line-height: 1.5;">${addressText}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${trackingUrl}" style="background-color: #881337; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(136, 19, 55, 0.25);">
              Track Your Order Status &rarr;
            </a>
          </div>

          <p style="color: #64748b; font-size: 13px; text-align: center; margin-bottom: 0;">
            Or copy this link to your browser:<br>
            <a href="${trackingUrl}" style="color: #be123c; word-break: break-all;">${trackingUrl}</a>
          </p>
        </div>

        <div style="background-color: #f8fafc; padding: 18px 24px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            Thank you for shopping with Vastriya! If you have any questions, feel free to contact our customer support.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Tracking email sent to ${customerEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipient: customerEmail };
  } catch (error) {
    console.error(`[EmailService] Failed to send tracking email to ${customerEmail}:`, error);
    throw error;
  }
}
