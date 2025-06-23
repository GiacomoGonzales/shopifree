import * as functions from 'firebase-functions';
import * as sgMail from '@sendgrid/mail';

// Initialize SendGrid
const sendGridApiKey = functions.config().sendgrid?.api_key;
if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}

// Send welcome email
export const sendWelcomeEmail = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { email, name } = data;
    
    if (!email || !name) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and name are required');
    }

    const msg = {
      to: email,
      from: 'noreply@shopifree.app',
      subject: 'Welcome to Shopifree!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining Shopifree. We're excited to help you build your online store.</p>
        <p>Get started by creating your first store in your dashboard.</p>
      `,
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    functions.logger.error('Error sending welcome email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

// Send order confirmation email
export const sendOrderConfirmation = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { email, orderData } = data;
    
    if (!email || !orderData) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and order data are required');
    }

    const msg = {
      to: email,
      from: 'noreply@shopifree.app',
      subject: `Order Confirmation #${orderData.id}`,
      html: `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order! Order #${orderData.id}</p>
        <p>Total: $${orderData.total}</p>
        <p>We'll notify you when your order ships.</p>
      `,
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    functions.logger.error('Error sending order confirmation:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

export const emailFunctions = {
  sendWelcomeEmail,
  sendOrderConfirmation,
}; 