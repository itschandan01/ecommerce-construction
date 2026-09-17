const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const sendEmail = async ({ to, cc, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!fromEmail) {
    throw new Error("EMAIL_FROM is not configured");
  }

  const payload = {
    sender: {
      name: "Aditya Enterprises",
      email: fromEmail,
    },

    to: [
      {
        email: to,
      },
    ],

    subject,
    htmlContent: html,
  };

  if (text) {
    payload.textContent = text;
  }

  if (cc) {
    payload.cc = [
      {
        email: cc,
      },
    ];
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",

    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },

    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Brevo Email Error:", data);

    throw new Error(
      data?.message || "Failed to send email through Brevo"
    );
  }

  return data;
};

/**
 * Sends 6-digit OTP email for Signup Verification
 */
export const sendSignupOtpEmail = async ({ email, otp, name }) => {
  return sendEmail({
    to: email,

    subject: `${otp} is your verification code for Aditya Enterprises`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

        <div style="background-color: #1a202c; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Aditya Enterprises</h2>

          <p style="margin: 5px 0 0 0; color: #cbd5e0;">
            Email Verification
          </p>
        </div>

        <div style="padding: 30px; text-align: center; background-color: #ffffff;">

          <p style="font-size: 16px; color: #4a5568;">
            Hello ${name || "User"},
          </p>

          <p style="font-size: 15px; color: #4a5568;">
            Thank you for signing up. Please use the following 6-digit code to verify your email address:
          </p>

          <div style="margin: 25px 0; background-color: #f7fafc; border: 2px dashed #cbd5e0; padding: 15px; display: inline-block; border-radius: 8px;">

            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2b6cb0;">
              ${otp}
            </span>

          </div>

          <p style="font-size: 13px; color: #a0aec0;">
            This code is valid for 10 minutes. If you did not request this, please ignore this email.
          </p>

        </div>
      </div>
    `,
  });
};

/**
 * Sends 6-digit OTP email for Password Reset
 */
export const sendPasswordResetOtpEmail = async ({ email, otp }) => {
  return sendEmail({
    to: email,

    subject: `${otp} is your Password Reset Code - Aditya Enterprises`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

        <div style="background-color: #e53e3e; color: #ffffff; padding: 20px; text-align: center;">

          <h2 style="margin: 0;">
            Aditya Enterprises
          </h2>

          <p style="margin: 5px 0 0 0; color: #fed7d7;">
            Password Reset Request
          </p>

        </div>

        <div style="padding: 30px; text-align: center; background-color: #ffffff;">

          <p style="font-size: 15px; color: #4a5568;">
            You requested to reset your password. Use the code below to set a new password:
          </p>

          <div style="margin: 25px 0; background-color: #fff5f5; border: 2px dashed #feb2b2; padding: 15px; display: inline-block; border-radius: 8px;">

            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #c53030;">
              ${otp}
            </span>

          </div>

          <p style="font-size: 13px; color: #a0aec0;">
            This code will expire in 10 minutes. Do not share this code with anyone.
          </p>

        </div>
      </div>
    `,
  });
};

/**
 * Sends order confirmation email with itemized list,
 * total price, and payment method.
 */
export const sendOrderConfirmation = async ({
  order,
  items,
  paymentMethod,
  address,
}) => {
  const addr = address || order.address || {};
  const customerName = addr.full_name || order.user_name || "Valued Customer";
  const customerPhone = addr.phone || order.phone || "N/A";
  const customerEmail = order.email || process.env.ADMIN_EMAIL;
  const adminEmail = process.env.ADMIN_EMAIL;

  const rawDate = order.created_at || order.createdDate || order.date;
  const formattedOrderDate = rawDate
    ? new Date(rawDate).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      })
    : new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      });

  const addressParts = [
    addr.address_line || addr.street_address,
    addr.city,
    addr.state,
    addr.pincode ? `Pincode: ${addr.pincode}` : null,
  ].filter(Boolean);
  const addressText = addressParts.length > 0 ? addressParts.join(", ") : "Delivery details on file";

  // Calculate items subtotal and shipping
  const itemList = items || order.items || [];
  const calculatedSubtotal = itemList.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
  const subtotal = order.subtotal !== undefined ? Number(order.subtotal) : calculatedSubtotal;
  const shipping = order.shipping !== undefined ? Number(order.shipping) : (subtotal >= 1000 ? 0 : 50);
  const totalAmount = order.total_amount !== undefined ? Number(order.total_amount) : (subtotal + shipping);

  const formattedItemsHtml = itemList
    .map((item) => {
      const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #2d3748;">
            <strong>${item.name || `Product #${item.productId || "Item"}`}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center; color: #4a5568;">
            ${item.quantity || 1}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #2d3748;">
            ₹${Number(item.price || 0).toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #f97316; font-weight: bold;">
            ₹${itemTotal.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const formattedItemsText = itemList
    .map(
      (i) =>
        `- ${i.name || "Product"} × ${i.quantity || 1} @ ₹${i.price} = ₹${(
          Number(i.price || 0) * Number(i.quantity || 1)
        ).toFixed(2)}`
    )
    .join("\n");

  const paymentMethodText =
    paymentMethod === "razorpay"
      ? "Pay Online (Razorpay) - PAID"
      : "Cash on Delivery (COD) - PENDING";

  const shippingText = shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`;

  return sendEmail({
    to: customerEmail,
    cc: adminEmail && adminEmail !== customerEmail ? adminEmail : undefined,
    subject: `Order #${order.id} Confirmation - Aditya Enterprises`,
    text: `
------------------------------------
ADITYA ENTERPRISES
Order Confirmation
------------------------------------

Hello, ${customerName}!

Thank you for your order.

ORDER DETAILS
Order ID: #${order.id}
Order Date: ${formattedOrderDate}
Payment Method: ${paymentMethodText}

CUSTOMER DETAILS
Name: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail}

DELIVERY DETAILS
Delivery Address:
${addressText}

ORDER ITEMS:
${formattedItemsText}

ORDER SUMMARY:
Subtotal: ₹${subtotal.toFixed(2)}
Shipping: ${shippingText}
Total Amount: ₹${totalAmount.toFixed(2)}

Thank you for choosing Aditya Enterprises.
Build Today. Better Tomorrow.
------------------------------------
`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #0b192c; color: #ffffff; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #f97316;">
            🏗️ Aditya Enterprises
          </h1>
          <p style="margin: 5px 0 0 0; color: #cbd5e0; font-size: 14px;">
            Construction Materials Supplier • Build Today. Better Tomorrow.
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background-color: #d1fae5; color: #065f46; display: inline-block; padding: 8px 18px; border-radius: 20px; font-weight: bold; font-size: 14px;">
              🎉 Order Successfully Placed!
            </div>
            <p style="color: #4a5568; margin-top: 15px; font-size: 15px;">
              Hello <strong>${customerName}</strong>, thank you for your order with Aditya Enterprises.
            </p>
          </div>

          <!-- Order & Payment Info Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #4a5568;">
              <tr>
                <td style="padding: 6px 0;"><strong>Order ID:</strong></td>
                <td style="text-align: right; color: #0f172a; font-weight: bold;">#${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Order Date:</strong></td>
                <td style="text-align: right; color: #0f172a; font-weight: 500;">${formattedOrderDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Payment Method:</strong></td>
                <td style="text-align: right; color: #f97316; font-weight: 600;">${paymentMethodText}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Order Status:</strong></td>
                <td style="text-align: right; color: #10b981; font-weight: 600;">CONFIRMED</td>
              </tr>
            </table>
          </div>

          <!-- Customer & Delivery Details Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 25px;">
            <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
              📍 Customer & Delivery Information
            </h4>
            <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Name:</strong> ${customerName}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Phone:</strong> ${customerPhone}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Email:</strong> ${customerEmail}</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #334155;"><strong>Delivery Address:</strong><br />${addressText}</p>
          </div>

          <!-- Items Table -->
          <h3 style="color: #0f172a; margin-bottom: 12px; font-size: 16px; border-bottom: 2px solid #f97316; padding-bottom: 8px;">
            Ordered Items
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #f1f5f9; color: #475569;">
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

          <!-- Financial Breakdown -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #475569;">
              <span>Subtotal:</span>
              <span style="font-weight: 600; color: #0f172a;">₹${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #475569;">
              <span>Shipping / Freight:</span>
              <span style="font-weight: 700; color: ${shipping === 0 ? '#10b981' : '#0f172a'};">
                ${shipping === 0 ? 'FREE (Orders ≥ ₹1,000)' : `₹${shipping.toFixed(2)}`}
              </span>
            </div>
            <div style="border-top: 2px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #0f172a;">
              <span>Total Amount:</span>
              <span style="color: #f97316;">₹${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 0 0 4px 0;">
              Aditya Enterprises
            </p>
            <p style="font-size: 13px; color: #64748b; margin: 0;">
              Build Today. Better Tomorrow.
            </p>
          </div>
        </div>
      </div>
    `,
  });
};