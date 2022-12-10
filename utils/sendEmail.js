const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "tarekmedhat706@gmail.com", // generated ethereal user
      pass: "vjitfvyeexcfmsqm", // generated ethereal password
    },
  });
  // send mail with defined transport object
  const mailOptions = {
    from: "Nest E-commerce <tarekmedhat706@gmail.com>", // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };
  await transporter.sendMail(mailOptions);
};
module.exports = { sendEmail };
