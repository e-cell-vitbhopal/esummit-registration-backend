const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const ejs = require("ejs");
const QRCode = require("qrcode");
const crypto = require("crypto");
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

    // Encryption
    const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
    let encryptedQRData = cipher.update(JSON.stringify(qrData), 'utf8', 'hex');
    encryptedQRData += cipher.final('hex');

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

app.get("/decrypt", (req, res) => {
  try {
    // Get the encrypted data string from the query parameters
    const encryptedDataString = req.query.data;
    console.log(encryptedDataString)

    // Decrypt the data using the encryption key
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
    let decryptedDataString = decipher.update(encryptedDataString, 'hex', 'utf8');
    decryptedDataString += decipher.final('utf8');
    console.log(decryptedDataString)

    // Send the decrypted data string as a response
    res.send(decryptedDataString);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error decrypting data.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
