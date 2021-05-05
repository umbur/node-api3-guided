const express = require('express');
const { log } = require('./hubs-middleware');
const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');

const router = express.Router();

router.get('/', logger, (req, res, next) => {
  Hubs.find(req.query)
    .then(hubs => {
      res.status(200).json(hubs);
    })
    .catch(next);
});

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
