const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({

  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000

});

transporter.verify(function(error, success) {

  if (error) {
    console.log("❌ Mail Error:", error);
  } 
  else {
    console.log("✅ Mail Server Ready");
  }

});

module.exports = transporter;