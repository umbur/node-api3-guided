const express = require('express');
const yup = require('yup');
const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');

const router = express.Router();

function logger(req, res, next) {
  console.log(`
    ${req.method} request to ${req.baseUrl} endpoint!
    req.body ${JSON.stringify(req.body)}
    req.params.id ${req.params.id}
  `)
  next()
}

router.get('/', logger, (req, res, next) => {
  Hubs.find(req.query)
    .then(hubs => {
      res.status(200).json(hubs);
    })
    .catch(next);
});

async function idChecker(req, res, next) {
  try {
    const hub = await Hubs.findById(req.params.id)
    if (!hub) {
      next({ status: 404, message: `hub with id ${req.params.id} not found!` })
    } else {
      req.hub = hub
      next()
    }
  } catch (err) {
    next(err)
  }
}

router.get('/:id', logger, idChecker, (req, res) => {
  res.json(req.hub)
});

router.post('/', (req, res, next) => {
  Hubs.add(req.body)
    .then(hub => {
      res.status(201).json(hub);
    })
    .catch(next);
});

router.delete('/:id', logger, idChecker, (req, res, next) => {
  Hubs.remove(req.params.id)
    .then(() => {
      res.status(200).json({ message: 'The hub has been nuked' });
    })
    .catch(next);
});

router.put('/:id', logger, idChecker, (req, res, next) => {
  Hubs.update(req.params.id, req.body)
    .then(hub => {
      res.status(200).json(hub);
    })
    .catch(next);
});

router.get('/:id/messages', logger, idChecker, (req, res, next) => {
  Hubs.findHubMessages(req.params.id)
    .then(messages => {
      res.status(200).json(messages);
    })
    .catch(next);
});

const messageSchema = yup.object({
  sender: yup.string()
    .trim()
    .required('sender required')
    .min(3, 'sender must be 3 chars')
    .max(40, 'sender must be under 40 chars')
    
})

function validateMessage(req, res, next) {
  if (
    !req.body.text ||
    !req.body.text.trim() ||
    !req.body.sender ||
    !req.body.sender.trim() ||
    req.body.text.length < 4 ||
    req.body.sender.length < 4
  ) {
    next({ status: 400, message: 'text and sender required' })
  } else {
    next()
  }
}

router.post(
  '/:id/messages',
    logger,
    validateMessage,
    idChecker,
  (req, res, next) => {
    const messageInfo = { ...req.body, hub_id: req.params.id };

    Messages.add(messageInfo)
      .then(message => {
        res.status(201).json(message);
      })
      .catch(next);
  });

router.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    note: 'something nasty went down in hubs router',
    message: err.message,
    stack: err.stack,
  })
}) // this traps errors happening "before"

module.exports = router;
