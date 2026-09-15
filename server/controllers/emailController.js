// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// // Create transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // Gmail App Password
//   },
// });

// /**
//  * Sends order confirmation email to customer + admin
//  * Amounts are in ₹ INR
//  */
// export const sendOrderConfirmation = async (
//   userEmail,
//   orderDetails,
//   items
// ) => {
//   const totalAmountInr = Number(orderDetails.total_amount).toLocaleString(
//     "en-IN",
//     { minimumFractionDigits: 2 }
//   );

//   const orderId = orderDetails.id;
//   const orderDate = new Date(orderDetails.order_date).toLocaleString("en-IN");
//   const adminEmail = process.env.ADMIN_EMAIL;

//   // Build items list (₹ INR)
//   const itemHtmlList = items
//     .map(
//       (item) =>
//         `<li>${item.name} (${item.quantity} × ₹${Number(
//           item.price
//         ).toLocaleString("en-IN")})</li>`
//     )
//     .join("");

//   // 1️⃣ Customer Email
//   const customerMailOptions = {
//     from: `"ConstroMart" <${process.env.EMAIL_USER}>`,
//     to: userEmail,
//     subject: `Order Confirmation #${orderId} - ConstroMart`,
//     html: `
//       <h2>Thank you for your order!</h2>
//       <p>Your order <strong>#${orderId}</strong> was placed on ${orderDate}.</p>
//       <h3>Order Details</h3>
//       <ul>${itemHtmlList}</ul>
//       <p><strong>Total Paid: ₹${totalAmountInr}</strong></p>
//       <p>We will notify you once your order is processed.</p>
//       <br/>
//       <p>— ConstroMart Team</p>
//     `,
//   };

//   // 2️⃣ Admin Email
//   const adminMailOptions = {
//     from: `"ConstroMart" <${process.env.EMAIL_USER}>`,
//     to: adminEmail,
//     subject: `NEW ORDER #${orderId}`,
//     html: `
//       <h3>New Order Received</h3>
//       <p><strong>Order ID:</strong> ${orderId}</p>
//       <p><strong>Customer:</strong> ${userEmail}</p>
//       <p><strong>Total:</strong> ₹${totalAmountInr}</p>
//       <h4>Items</h4>
//       <ul>${itemHtmlList}</ul>
//     `,
//   };

//   try {
//     await transporter.sendMail(customerMailOptions);
//     await transporter.sendMail(adminMailOptions);
//     return true;
//   } catch (error) {
//     console.error("Email sending error:", error);
//     return false;
//   }
// };

// /**
//  * Sends inquiry email to admin
//  */
// export const sendInquiryEmail = async (inquiryDetails) => {
//   const adminEmail = process.env.ADMIN_EMAIL;

//   const mailOptions = {
//     from: `"ConstroMart" <${process.env.EMAIL_USER}>`,
//     to: adminEmail,
//     subject: `NEW WEBSITE INQUIRY`,
//     html: `
//       <h2>New Customer Inquiry</h2>
//       <p><strong>Name:</strong> ${inquiryDetails.name || "N/A"}</p>
//       <p><strong>Email:</strong> ${inquiryDetails.email || "N/A"}</p>
//       <p><strong>Phone:</strong> ${inquiryDetails.phone || "N/A"}</p>
//       <h3>Message</h3>
//       <p>${inquiryDetails.message || "No message provided."}</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return true;
//   } catch (error) {
//     console.error("Inquiry email error:", error);
//     return false;
//   }
// };

import nodemailer from "nodemailer";

export const sendOrderConfirmation = async ({ order, items, paymentMethod }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const itemList = items
    .map(
      (i) => `${i.name} × ${i.quantity} — ₹${i.price * i.quantity}`
    )
    .join("\n");

  const mailOptions = {
    from: process.env.EMAIL_USER,
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
`,
  };

  await transporter.sendMail(mailOptions);
};
