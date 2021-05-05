const express = require('express');

const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');

const router = express.Router();

function logger(req, res, next) {
  console.log(`
    ${req.method} request to ${req.baseUrl} endpoint!
    req.body ${JSON.stringify(req.body)}
    req.params.id ${req.params.id} TODO fix!!!
  `)
  next()
}

router.get('/', logger, (req, res, next) => {
  Hubs.find(req.query)
    .then(hubs => {
      res.status(200).json(hubs);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error retrieving the hubs',
      });
    });
});

async function idChecker(req, res, next) {
  try {
    const hub = await Hubs.findById(req.params.id)
    if (!hub) {
      res.status(404).json({
        message: `hub with id ${req.params.id} not found!`,
      });
    } else {
      req.hub = hub
      next()
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
}

router.get('/:id', logger, idChecker, (req, res) => {
  res.json(req.hub)
});

router.post('/', (req, res) => {
  Hubs.add(req.body)
    .then(hub => {
      res.status(201).json(hub);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error adding the hub',
      });
    });
});

router.delete('/:id', logger, idChecker, (req, res) => {
  Hubs.remove(req.params.id)
    .then(() => {
      res.status(200).json({ message: 'The hub has been nuked' });
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error removing the hub',
      });
    });
});

router.put('/:id', logger, idChecker, (req, res) => {
  Hubs.update(req.params.id, req.body)
    .then(hub => {
      res.status(200).json(hub);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error updating the hub',
      });
    });
});

router.get('/:id/messages', logger, idChecker, (req, res) => {
  Hubs.findHubMessages(req.params.id)
    .then(messages => {
      res.status(200).json(messages);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error getting the messages for the hub',
      });
    });
});

router.post('/:id/messages', logger, idChecker, (req, res) => {
  const messageInfo = { ...req.body, hub_id: req.params.id };

  Messages.add(messageInfo)
    .then(message => {
      res.status(210).json(message);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error adding message to the hub',
      });
    });
});

const errorHandler = (err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    note: 'something nasty went down in hubs router',
    message: err.message,
    stack: err.stack,
  })
}

router.use(errorHandler) // this traps errors happening "before"

module.exports = router;
