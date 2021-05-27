const express = require("express");
const { logger } = require("./hubs-middleware");
const Hubs = require("./hubs-model.js");
const Messages = require("../messages/messages-model.js");

const router = express.Router();

router.get("/", logger, (req, res, next) => {
  Hubs.find(req.query)
    .then((hubs) => {
      res.status(200).json(hubs);
    })
    .catch(next);
});

router.get("/:id", (req, res) => {
  Hubs.findById(req.params.id)
    .then((hub) => {
      if (hub) {
        res.status(200).json(hub);
      } else {
        res.status(404).json({ message: "Hub not found" });
      }
    })
    .catch((error) => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: "Error retrieving the hub",
      });
    });
});

router.post("/", (req, res) => {
  Hubs.add(req.body)
    .then((hub) => {
      res.status(201).json(hub);
    })
    .catch((error) => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: "Error adding the hub",
      });
    });
});

router.delete("/:id", (req, res) => {
  Hubs.remove(req.params.id)
    .then((count) => {
      if (count > 0) {
        res.status(200).json({ message: "The hub has been nuked" });
      } else {
        res.status(404).json({ message: "The hub could not be found" });
      }
    })
    .catch((error) => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: "Error removing the hub",
      });
    });
});

router.put("/:id", (req, res) => {
  Hubs.update(req.params.id, req.body)
    .then((hub) => {
      if (hub) {
        res.status(200).json(hub);
      } else {
        res.status(404).json({ message: "The hub could not be found" });
      }
    })
    .catch((error) => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: "Error updating the hub",
      });
    });
});

router.get("/:id/messages", (req, res) => {
  Hubs.findHubMessages(req.params.id)
    .then((messages) => {
      res.status(200).json(messages);
    })
    .catch((error) => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: "Error getting the messages for the hub",
      });
    });
});

router.post("/:id/messages", (req, res) => {
  const messageInfo = { ...req.body, hub_id: req.params.id };

  Messages.add(messageInfo)
    .then((message) => {
      res.status(210).json(message);
    })
    .catch((error) => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: "Error adding message to the hub",
      });
    });
});

router.use((err, req, res, next) => {
  // eslint-disable-line
  res.status(err.status || 500).json({
    note: "something nasty went down in hubs router",
    message: err.message,
    stack: err.stack,
  });
}); // this traps errors happening "before"

module.exports = router;
