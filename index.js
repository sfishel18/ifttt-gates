const Firestore = require('@google-cloud/firestore');
const axios = require('axios');

const stringify = input =>
  typeof input === "string" ? input : JSON.stringify(input);

exports.trigger = (req, res) => {
  if (req.method === "HEAD") {
    res.status(200).send();
    return;
  }
  const { auth, webhook } = req.body;
  if (auth !== process.env.AUTH_KEY) {
    res.status(401).send("Access denied");
    return;
  }
  if (!webhook) {
    res.status(400).send('Required argument "webhook" is missing or empty');
    return;
  }

  const db = new Firestore({
    projectId: 'ifttt-gates',
    keyFilename: './keyfile.json',
  });

  db.doc(`gates/${encodeURIComponent(webhook)}`).get()
    .then(snapshot => {
        if (!snapshot.exists || !snapshot.get('active')) {
            return 'Webhook was not triggered';
        }
        return axios.get(webhook).then(response => stringify(response.data))
    })
    .then(message => res.status(200).send(message))
    .catch(err => {
        console.error(err);
        res.status(400).send('Error triggering webhook')
    })
};

exports.update = (req, res) => {
  if (req.method === "HEAD") {
    res.status(200).send();
    return;
  }
  const { auth, webhook, active } = req.body;
  if (auth !== process.env.AUTH_KEY) {
    res.status(401).send("Access denied");
    return;
  }
  if (!webhook) {
    res.status(400).send('Required argument "webhook" is missing or empty');
    return;
  }
  if (active !== true && active !== 'true' && active !== false && active !== 'false') {
    res.status(400).send('Required argument "active" is missing or invalid, it must "true" or "false"');
    return;
  }

  const db = new Firestore({
    projectId: 'ifttt-gates',
    keyFilename: './keyfile.json',
  });

  db.doc(`gates/${encodeURIComponent(webhook)}`).set({
      active: (active === true || active === 'true')
    })
    .then(() => res.status(200).send('Webhook updated successfully'))
    .catch(err => {
        console.error(err);
        res.status(400).send('Error updating webhook')
    })
};


exports.index = (req, res) => {
  switch (req.path) {
    case '/trigger':
      return exports.trigger(req, res)
    case '/update':
      return exports.update(req, res)
    default:
      res.send('function not defined')
  }
}
