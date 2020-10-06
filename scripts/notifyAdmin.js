
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
const fs = require('fs')  // include the file system functions
const path = require('path')  // include path manipulation functions
const configPath = '/Users/Shared/notifyAdmin.cfg'
// console.log(path.resolve(configPath))  // Uncomment this line to check full path of configPath

const CSMarg = process.argv.slice(2);   // capture command line arguments into an array

if (CSMarg.length==0) {
    console.log("This script requires the admin's user name as an argument")  // If no argument, notify
} else {   
    console.log('Sending an email to ' + CSMarg[0])  // If argument present, say what we're doing
}

// Get the first parameter, delimited by quotes, that comes after paramName in the notifyAdmin.cfg file
function getConfig(paramName) {
  try {
      var data = fs.readFileSync(configPath, 'utf8')
    } catch (err) {
      console.error(err)
    }
  var namePos = data.indexOf(paramName,0);  // Find the parameter name in the file's data
  var pos1 = data.indexOf('"',namePos);    // Find the next occurance of "  
  var pos2 = data.indexOf('"', pos1 + 1);   // Find a further occurance of "
  var result = data.slice(pos1 + 1, pos2);      // Return what's between the quotes
  return result;
}
// Define service, user name, and password.  They should get pulled from a configuration file
var transporter = nodemailer.createTransport({
  service: getConfig('MailService'),
  auth: {
    user: getConfig('ReturnAddress'),
    pass: getConfig('MailPassword')
  }
});

// Define addresses, subject, and message, using fields from the config file
var mailOptions = {
  from: getConfig('ReturnAddress'),
  to: CSMarg[0],
  subject: getConfig('MailSubject'),
  text: getConfig('MailGreeting') + CSMarg[0] + getConfig('MailBody') // CSMarg[0] to be replaced by database retrieval
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