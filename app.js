const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const ejs = require("ejs");
const QRCode = require("qrcode");
const crypto = require("crypto-js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASSWORD,
  },
});

// Set EJS as the view engine
app.set("view engine", "ejs");

app.get("/get", async (req, res) => {
  res.send('Hello World')
});

app.get("/sendmail", async (req, res) => {
  try {
    // Read the HTML email template file
    const template = await fs.readFile("email-template.ejs", "utf-8");

    // Extract confirmed events from req.query
    const confirmedEvents = req.query.confirmedEvents.split(",");

    // Generate QR code data
    const qrData = {
      name: req.query.name,
      email: req.query.email,
      regno: req.query.regno,
      tranID: req.query.tranID,
      confirmedEvents: confirmedEvents.join(", "),
    };

    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptedQRData = crypto.AES.encrypt(JSON.stringify(qrData), encryptionKey).toString(); // Convert encrypted data to string

    // Generate QR code image as a Data URL (Base64)
    let QRImg = await QRCode.toDataURL(encryptedQRData); // Pass encrypted data directly

    // Render the EJS template with QR code image
    const renderedTemplate = ejs.render(template, {
      confirmedEvents,
      QRImg,
    });

    const mailOptions = {
      from: {
        name: "Ecell VIT Bhopal",
        address: process.env.USER,
      },
      to: req.query.email,
      subject: "Registration Confirmation",
      attachDataUrls: true,
      html: renderedTemplate
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email has been sent!");
    res.send("Email has been sent!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending email.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
