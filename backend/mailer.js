const SibApiV3Sdk = require("@getbrevo/brevo");
require("dotenv").config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (to, subject, htmlContent) => {

  try {

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;

    sendSmtpEmail.htmlContent = htmlContent;

    sendSmtpEmail.sender = {
      name: "KisanMitra",
      email: process.env.EMAIL_USER
    };

    sendSmtpEmail.to = [
      {
        email: to
      }
    ];

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("✅ Email sent:", result);

    return result;

  } catch (error) {

    console.log("❌ Email Error:", error);

    throw error;
  }
};

module.exports = sendEmail;