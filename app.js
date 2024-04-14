const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs").promises; // Import the fs module
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

app.get("/get", async (req, res) => {
  res.send('Hello World')
});

app.get("/sendmail", async (req, res) => {
  try {
    // Read the email template file
    const template = await fs.readFile("email-template.html", "utf-8");

    // Extract details from req.query
    const { name, email, message } = req.query;

    const mailOptions = {
      from: {
        name: "Ecell VIT Bhopal",
        address: process.env.USER,
      },
      to: email,
      subject: "Hello ✔",
      html: template.replace(/{name}/g, name).replace(/{email}/g, email).replace(/{message}/g, message), // Include the template content here with interpolated details
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
