const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs").promises; // Import the fs module
const ejs = require("ejs"); // Import the EJS templating engine
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

    // Extract confirmed events from req.body
    const confirmedEvents = req.query.confirmedEvents.split(",");
    console.log(confirmedEvents)

    // Render the EJS template with confirmed events data
    const renderedTemplate = ejs.render(template, { confirmedEvents });

    const mailOptions = {
      from: {
        name: "Ecell VIT Bhopal",
        address: process.env.USER,
      },
      to: req.query.email,
      subject: "Registration Confirmation",
      html: renderedTemplate,
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
