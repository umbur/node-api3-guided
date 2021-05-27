const express = require("express"); // importing a CommonJS module
const morgan = require("morgan");
const hubsRouter = require("./hubs/hubs-router.js");
const cors = require("cors");
const server = express();

server.use(express.json());
server.use(morgan("dev"));
server.use(cors());
server.use("/api/hubs", addLambdaHeader, hubsRouter);

// custom middleware
server.use((req, res, next) => {
  // console.log("next:", next);
  next();
});

server.get("/", addLambdaHeader, (req, res) => {
  // console.log("this", this);
  // throw new Error("pizdec!!");
  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome to the Lambda Hubs API</p>
  `);
});

// error handling middleware
// server.use((err, req, res) => {
//   res.status(500).json({
//     message: err.message,
//     stack: err.stack,
//     // custom: "something went wrong!", for production
//   });
// });

module.exports = server;

function addLambdaHeader(req, res, next) {
  res.set("X-Lambda", "vardkes!");
  next();
}
