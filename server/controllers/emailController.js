import nodemailer from "nodemailer";

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Sends 6-digit OTP email for Signup Verification
 */
export const sendSignupOtpEmail = async ({ email, otp, name }) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: `"Aditya Enterprises" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} is your verification code for Aditya Enterprises`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1a202c; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Aditya Enterprises</h2>
          <p style="margin: 5px 0 0 0; color: #cbd5e0;">Email Verification</p>
        </div>
        <div style="padding: 30px; text-align: center; background-color: #ffffff;">
          <p style="font-size: 16px; color: #4a5568;">Hello ${name || 'User'},</p>
          <p style="font-size: 15px; color: #4a5568;">Thank you for signing up. Please use the following 6-digit code to verify your email address:</p>
          <div style="margin: 25px 0; background-color: #f7fafc; border: 2px dashed #cbd5e0; padding: 15px; display: inline-block; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2b6cb0;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #a0aec0;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sends 6-digit OTP email for Password Reset
 */
export const sendPasswordResetOtpEmail = async ({ email, otp }) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: `"Aditya Enterprises" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} is your Password Reset Code - Aditya Enterprises`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #e53e3e; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Aditya Enterprises</h2>
          <p style="margin: 5px 0 0 0; color: #fed7d7;">Password Reset Request</p>
        </div>
        <div style="padding: 30px; text-align: center; background-color: #ffffff;">
          <p style="font-size: 15px; color: #4a5568;">You requested to reset your password. Use the code below to set a new password:</p>
          <div style="margin: 25px 0; background-color: #fff5f5; border: 2px dashed #feb2b2; padding: 15px; display: inline-block; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #c53030;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #a0aec0;">This code will expire in 10 minutes. Do not share this code with anyone.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sends order confirmation email
 */
export const sendOrderConfirmation = async ({ order, items, paymentMethod }) => {
  const transporter = getTransporter();

  const itemList = items
    .map(
      (i) => `${i.name} × ${i.quantity} — ₹${i.price * i.quantity}`
    )
    .join("\n");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.email,
    subject: `Order #${order.id} Confirmation - Aditya Enterprises`,
    text: `
Thank you for your order!

Order ID: ${order.id}
Total: ₹${order.total_amount}
Payment Method: ${paymentMethod.toUpperCase()}
Payment Status: ${
      paymentMethod === "razorpay" ? "PAID" : "CASH ON DELIVERY"
    }

Items:
${itemList}

We will deliver your order soon.
`,
  };

  await transporter.sendMail(mailOptions);
};
