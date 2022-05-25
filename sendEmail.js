const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { EOL, networkInterfaces } = require('os');
const { readFileSync } = require('fs');
const { writeFile } = require('fs/promises');
const fetch = require('node-fetch'); // not necessary in v18. fetch will be in the default API
const env = dotenv.config();

if(env.error) {
    console.error('Problem with parseing the env file: ' + env.error);
    process.exit(1);
}

const INTERVAL = Number.parseInt(env.parsed.INTERVAL);

const transporter = nodemailer.createTransport({
    service: env.parsed.EMAIL_PROVIDER, 
    auth: {
        user: env.parsed.EMAIL_ADDRESS,
        pass: env.parsed.EMAIL_PASSWORD, // TODO change for a token or so?
    }
});

const mailOptions = {
    from: env.parsed.EMAIL_ADDRESS,
    to: env.parsed.TO,
    bcc: env.parsed.BCC,
    subject: env.parsed.EMAIL_SUBJECT,
};

let lastIp;

try {
    lastIp = JSON.parse(readFileSync(env.parsed.IP_FILE_DESTINATION))['ip'];
    if(lastIp === undefined) throw new Error(`${env.parsed.IP_FILE_DESTINATION} doesn't contain a key named 'ip'`);
} catch(err) {
    console.error(err);
    process.exit(1);
}

async function getCurrentIP() {
    const resp = await fetch('https://api.myip.com');
    const body = await resp.json();
    return body.ip;
}

async function iteration() {
    let webserviceIP;
    try {
        webserviceIP = await getCurrentIP();
    } catch(e) {
        console.error('Problem retrieving the current IP. Waiting for next iteration (which will start in approximately ' + INTERVAL + ' minutes). err:' + e);
        return;
    }

    if(lastIp !== webserviceIP) {
        mailOptions['text'] = `The raspi has a new public IP: ${JSON.stringify(webserviceIP)}${EOL}Local IP Config: ${EOL}${JSON.stringify(networkInterfaces(), null, '\t')}`;
        transporter.sendMail(mailOptions, async (err, info) => {
          if(err) {
            console.error(err);
          } else {
            console.log(info);
            await writeFile(env.parsed.IP_FILE_DESTINATION, JSON.stringify({'ip': webserviceIP}));
            lastIp = webserviceIP;
          }
        });
    }
}

// since the first execution of iteration would be after inMinutes minutes and we would like to send the ip immediately we have to call it once
iteration();
setInterval(iteration, INTERVAL * 60 * 1000);