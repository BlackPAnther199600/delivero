import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOrderConfirmation = async (email, orderId, amount) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Ordine confermato #${orderId}`,
    html: `
      <h2>Ordine Confermato</h2>
      <p>Il tuo ordine <strong>#${orderId}</strong> è stato confermato.</p>
      <p><strong>Importo:</strong> €${amount}</p>
      <p>Cosa fare adesso: Traccia il tuo ordine nel nostro sito.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendBillReminder = async (email, billType, dueDate, amount) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Promemoria Bolletta - ${billType}`,
    html: `
      <h2>Promemoria Bolletta</h2>
      <p>La tua bolletta <strong>${billType}</strong> scade il <strong>${dueDate}</strong>.</p>
      <p><strong>Importo:</strong> €${amount}</p>
      <p>Paga ora per evitare ritardi.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendPasswordReset = async (email, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Ripristina la tua password - Delivero',
    html: `
      <h2>Ripristina Password</h2>
      <p>Hai richiesto di ripristinare la tua password.</p>
      <p><a href="${resetLink}">Clicca qui per ripristinare</a></p>
      <p>Questo link scadrà tra 1 ora.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
