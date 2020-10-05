
/* Semi-automatic email and database update for admins in the Monthly Calling Campaign
Author: Chris Mullin
Date: September, 2020
Usage:  On the command line, type
    node notifyAdmin.js <username>
Prerequisites: In your mail account, you must allow access for less-secure apps.  For example, in gmail,
turn on the switch at https://myaccount.google.com/lesssecureapps and disable two-step authentication.

Note:  The process item that the Getting Started with Node says is automatically available
 wasn't available until I put in the following code.  Now it's available!  I guess it's part of express?
 It's even available after I comment the requirement out!  Very strange. 
 
const express = require('express')
*/

// console.log('CSM program output:') 
console.log('') // Create header and space in the terminal output to distinguish program result

var nodemailer = require('nodemailer'); // include code for sending SMTP mail
const emailInfo = require('./email_info.json');

const CSMarg = process.argv.slice(2);   // capture command line arguments into an array

if (CSMarg.length==0) {
    console.log("This script requires the admin's user name as an argument")  // If no argument, notify
} else {   
    console.log('Sending an email to ' + CSMarg[0])  // If argument present, say what we're doing
}

// Define service, user name, and password.  They should get pulled from a configuration file
var transporter = nodemailer.createTransport({
  service: emailInfo.MailService,
  auth: {
    user: emailInfo.ReturnAddress,
    pass: emailInfo.MailPassword
  }
});

// Define addresses, subject, and message, using fields from the config file
var mailOptions = {
  from: emailInfo.ReturnAddress,
  to: CSMarg[0],
  subject: emailInfo.MailSubject,
  text: emailInfo.MailGreeting + CSMarg[0] + emailInfo.MailBody
};

// Send the actual email, reporting errors or reporting success
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

console.log('') // Create space in terminal after program's output.  It's interesting that Email sent 
// response shows up after this space.