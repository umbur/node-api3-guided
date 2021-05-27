const Hubs = require("./hubs-model.js");

function logger(req, res, next) {
  console.log(`
    ${req.method} request to ${req.baseUrl} endpoint!
    req.body ${JSON.stringify(req.body)}
    req.params.id ${req.params.id}
  `);
  next();
}
module.exports = { logger };
