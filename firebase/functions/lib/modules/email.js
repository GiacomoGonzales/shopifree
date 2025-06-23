"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailFunctions = exports.sendOrderConfirmation = exports.sendWelcomeEmail = void 0;
const functions = __importStar(require("firebase-functions"));
const sgMail = __importStar(require("@sendgrid/mail"));
// Initialize SendGrid
const sendGridApiKey = (_a = functions.config().sendgrid) === null || _a === void 0 ? void 0 : _a.api_key;
if (sendGridApiKey) {
    sgMail.setApiKey(sendGridApiKey);
}
// Send welcome email
exports.sendWelcomeEmail = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        functions.logger.error('Error sending welcome email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send email');
    }
});
// Send order confirmation email
exports.sendOrderConfirmation = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        functions.logger.error('Error sending order confirmation:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send email');
    }
});
exports.emailFunctions = {
    sendWelcomeEmail: exports.sendWelcomeEmail,
    sendOrderConfirmation: exports.sendOrderConfirmation,
};
//# sourceMappingURL=email.js.map