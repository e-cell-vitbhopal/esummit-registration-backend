const express = require("express");
const nodemailer = require("nodemailer");
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
  const mailOptions = {
    from: {
      name: "Ecell VIT Bhopal",
      address: process.env.USER,
    },
    to: ["iamarpit602@gmail.com"],
    subject: "Hello ✔",
    text: "Hello world?",
    html: "<b>Hello world?</b>",
  };

  try {
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
