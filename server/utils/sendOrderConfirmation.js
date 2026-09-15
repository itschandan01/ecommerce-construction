import { sendOrderConfirmation as sendOrderConfirmationEmail } from "../controllers/emailController.js";

/**
 * Sends order confirmation email to customer
 *
 * Uses Brevo HTTPS API through emailController.js.
 * Email delivery is handled through the Brevo API.
 */
export const sendOrderConfirmation = async ({
  order,
  items,
  paymentMethod,
}) => {
  try {
    await sendOrderConfirmationEmail({
      order,
      items,
      paymentMethod,
    });

    console.log("Order confirmation email sent successfully");
  } catch (error) {
    console.error("Order confirmation email failed:", error);
  }
};
