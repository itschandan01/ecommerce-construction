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
 * Sends order confirmation email with itemized list, total price, and payment method
 */
export const sendOrderConfirmation = async ({ order, items, paymentMethod }) => {
  const transporter = getTransporter();

  const formattedItemsHtml = (items || [])
    .map((item) => {
      const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #2d3748;">
            <strong>${item.name || `Product #${item.productId || 'Item'}`}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center; color: #4a5568;">
            ${item.quantity || 1}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #2d3748;">
            ₹${Number(item.price || 0).toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #2b6cb0; font-weight: bold;">
            ₹${itemTotal.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const formattedItemsText = (items || [])
    .map((i) => `- ${i.name || 'Product'} × ${i.quantity || 1} @ ₹${i.price} = ₹${(i.price * i.quantity).toFixed(2)}`)
    .join("\n");

  const paymentMethodText =
    paymentMethod === "razorpay"
      ? "Pay Online (Razorpay) - PAID"
      : "Cash on Delivery (COD) - PENDING";

  const mailOptions = {
    from: `"Aditya Enterprises" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `Order #${order.id} Confirmation - Aditya Enterprises`,
    text: `
Thank you for your order!

Order ID: ${order.id}
Total Paid: ₹${order.total_amount}
Payment Method: ${paymentMethodText}

Items Ordered:
${formattedItemsText}

We will process and deliver your order shortly.
Aditya Enterprises
`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #1a202c; color: #ffffff; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #3182ce;">Aditya Enterprises</h1>
          <p style="margin: 5px 0 0 0; color: #cbd5e0; font-size: 14px;">Construction & Building Materials</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background-color: #c6f6d5; color: #22543d; display: inline-block; padding: 8px 18px; border-radius: 20px; font-weight: bold; font-size: 14px;">
              🎉 Order Successfully Placed!
            </div>
            <p style="color: #4a5568; margin-top: 15px; font-size: 15px;">
              Thank you for your order. A copy of this receipt has been saved for your records.
            </p>
          </div>

          <!-- Order Summary Card -->
          <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #4a5568;">
              <tr>
                <td style="padding: 4px 0;"><strong>Order ID:</strong></td>
                <td style="text-align: right; color: #2d3748; font-weight: bold;">#${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Payment Method:</strong></td>
                <td style="text-align: right; color: #2b6cb0; font-weight: 600;">${paymentMethodText}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Order Status:</strong></td>
                <td style="text-align: right; color: #38a169; font-weight: 600;">CONFIRMED</td>
              </tr>
            </table>
          </div>

          <!-- Items Table -->
          <h3 style="color: #2d3748; margin-bottom: 12px; font-size: 16px; border-bottom: 2px solid #edf2f7; padding-bottom: 8px;">
            Order Items
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #edf2f7; color: #4a5568;">
                <th style="padding: 10px; text-align: left;">Item Name</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Unit Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${formattedItemsHtml}
            </tbody>
          </table>

          <!-- Total Summary Box -->
          <div style="border-top: 2px solid #e2e8f0; padding-top: 15px; text-align: right;">
            <span style="font-size: 16px; color: #4a5568;">Total Payable Amount: </span>
            <span style="font-size: 22px; font-weight: bold; color: #2b6cb0; margin-left: 10px;">
              ₹${Number(order.total_amount).toFixed(2)}
            </span>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; border-top: 1px solid #edf2f7; padding-top: 20px;">
            <p style="font-size: 13px; color: #718096; margin: 0;">
              Thank you for trusting Aditya Enterprises!
            </p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
