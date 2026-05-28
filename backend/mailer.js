const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({

  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  tls: {
    rejectUnauthorized: false,
    family: 4
  }

});

transporter.verify((error, success) => {

  if (error) {
    console.log("❌ Mail Error:", error);
  } 
  else {
    console.log("✅ Mail Server Ready");
  }

});

module.exports = transporter;