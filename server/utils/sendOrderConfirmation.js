import nodemailer from "nodemailer";

/**
 * Sends order confirmation email to customer
 */
export const sendOrderConfirmation = async ({ order, items, paymentMethod }) => {
  try {
    // ✅ Debug env loading (remove later if you want)
    console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
    console.log("📧 Sending email to:", order.email);

    // ❗ Create transporter ONCE per call (safe)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // MUST be Gmail App Password
      },
    });

    // Optional but useful: verify SMTP connection
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    // Build item list
    const itemList = items
      .map(
        (i) => `${i.name} × ${i.quantity} — ₹${i.price * i.quantity}`
      )
      .join("\n");

    const mailOptions = {
      from: `"Aditya Enterprises" <${process.env.EMAIL_USER}>`,
      to: order.email,
      subject: `Order #${order.id} Confirmation`,
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

— Aditya Enterprises
`,
    };

    // 🚀 Send email
    await transporter.sendMail(mailOptions);

    console.log("✅ Order confirmation email sent successfully");
  } catch (error) {
    // ❌ THIS IS WHAT WAS MISSING EARLIER
    console.error("❌ Order email failed");
    console.error(error); // full error, not just message
  }
};
