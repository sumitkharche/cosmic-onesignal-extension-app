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
  const {bucket} = request.body.data;
  const searchBucket = Cosmic.bucket({ slug: 'onesignal-info' });
  const bucketSlugRes = await searchBucket.getObject({ slug: bucket });
  var headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${bucketSlugRes.object.metadata.onesignalrestapikey}`
  };
  var data = {
        app_id: bucketSlugRes.object.metadata.onesignalapiid,
        headings: { "en": bucketSlugRes.object.metadata.onesignalnotificationheading },
        contents: { "en": bucketSlugRes.object.metadata.onesignalnotificationcontent },
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
          console.log(JSON.parse(data));
      });
  });

  req.on('error', function (e) {
      console.log("ERROR:");
      console.log(e);
  });

  req.write(JSON.stringify(data));
  req.end();

  response.send(JSON.stringify(bucketSlugRes,null,2));
});

app.post('/api/addBucketSlug', async (req, res) => {
  try {   
    const { id, 
            slug,
            onesignalapiid,
            onesignalrestapikey,
            onesignalnotificationheading,
            onesignalnotificationcontent
          } = req.body;
    if (!id || !slug) {
      throw new Error('Must provide bucket id and slug');
    }

    const searchBucket = Cosmic.bucket({ slug: 'onesignal-info' });

    await searchBucket.addObject({
      content: slug,
      slug: id,
      title: id,
      type_slug: 'onesignal-details',
      metafields: [
        {
          value: onesignalapiid,
          key: "onesignalapiid",
          title: "onesignal-api-id",
          type: "text",
          children: null
        },
        {
          value: onesignalrestapikey,
          key: "onesignalrestapikey",
          title: "onesignal-rest-api-key",
          type: "text",
          children: null
        },
        {
          value: onesignalnotificationheading,
          key: "onesignalnotificationheading",
          title: "onesignal-notification-heading",
          type: "text",
          children: null
        },
        {
          value: onesignalnotificationcontent,
          key: "onesignalnotificationcontent",
          title: "onesignal-notification-content",
          type: "text",
          children: null
        }
      ]
    });

    return res.status(200).send();
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
    return res.status(400).json({ error: e.message });
  }
});


app.post('/api/removeBucketSlug/:id', async (req, res) => {
  try {
    console.log(JSON.stringify(req.params,2,null)); 
    const { id } = req.params;
    if (!id) {
      throw new Error('No id provided');
    }

    const searchBucket = Cosmic.bucket({ slug: 'onesignal-info' });
    await searchBucket.deleteObject({ slug: id }).catch(() => undefined);
    return res.status(200).send();
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
    return res.status(400).json({ error: e.message });
  }
});

app.get('/api/getBucketSlug/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error('No id provided');
    }

    const searchBucket = Cosmic.bucket({ slug: 'onesignal-info' });
    const bucketDetails = await searchBucket.getObject({ slug: id }).catch(() => undefined);
    return res.status(200).send(bucketDetails);
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
    return res.status(400).json({ error: e.message });
  }
});

app.listen(port);
