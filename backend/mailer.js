const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({

  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }

});

// TEMPORARILY DISABLED FOR RAILWAY
// transporter.verify((error, success) => {

//   if (error) {
//     console.log("❌ Mail server connection failed");
//     console.log(error);
//   } 
//   else {
//     console.log("✅ Mail server ready");
//   }

// });

module.exports = transporter;