require('dotenv').config();
const sendEmail = require('./sendEmail');

const testEmail = async () => {
  try {
    console.log('Email Username:', process.env.EMAIL_USERNAME);
    console.log('Email Password:', process.env.EMAIL_PASSWORD);
    console.log('Email From:', process.env.EMAIL_FROM);
    
    await sendEmail({
      email: 'haithem.bourbia@dipower.fr', // Remplacez par un email de test valide
      subject: 'Test Email',
      message: 'This is a test email to verify the sendEmail functionality.',
    });
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
};

testEmail();
