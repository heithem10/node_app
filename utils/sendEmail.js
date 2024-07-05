const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Vous pouvez utiliser d'autres services d'emailing comme Outlook, Yahoo, etc.
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM, // Adresse email d'envoi
    to: email,
    subject,
    text: message
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
