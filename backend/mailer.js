const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Check transporter
transporter.verify((error, success) => {

  if (error) {
    console.log("❌ Mail server connection failed");
    console.log(error);
  } 
  else {
    console.log("✅ Mail server ready");
  }

});

module.exports = transporter;