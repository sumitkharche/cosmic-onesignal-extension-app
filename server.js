const express = require('express');
const bodyParser = require('body-parser');
const cosmic = require('cosmicjs');
const https = require('https');
const cors = require('cors');

const port = parseInt(process.env.PORT, 10) || 9090;
const app = express();
app.use(cors());
app.use(bodyParser.json());

const Cosmic = cosmic();

app.post('/api/create', async function (request, response) {
  var onesignalapiid = request.query['apiid'];
  var onesignalrestapikey = request.query['restapikey'];
  var notificationheading = request.query['notificationheading'];
  var notificationcontent = request.query['notificationcontent'];
  var headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${onesignalrestapikey}`
  };

  var data = {
        app_id: onesignalapiid,
        headings: { "en": notificationheading },
        contents: { "en": notificationcontent },
        included_segments: ["All"]
    };

  var options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
  };

  var req = https.request(options, function (res) {
      res.on('data', function (data) {
          console.log("Response:");
      });
  });

  req.on('error', function (e) {
      console.log("ERROR:");
      console.log(e);
  });

  req.write(JSON.stringify(data));
  req.end();

  response.status(200).send('Notification Send Successfully!');
});
app.listen(port);
