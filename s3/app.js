"use strict";

const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fileName = "app.js";
const axios = require("axios"); // Import Axios for making HTTP requests
const { HttpException } = require("./HttpException.utils");

const app = express();
const port = 8083;

app.use(express.json());
app.use(cors());

app.use(function (req, res, next) {
  res.locals.reqId = uuidv4();
  next();
});

app.post("/add-sub", async (req, res) => {
  const { a = 0, b = 0 } = req.body;
  console.log(`A: ${a}, B: ${b}`);

  try {
    // Make an HTTP request to service S1 to get the sum
    const sumResponse = await axios.post("http://s1:3001/sum", { a, b });

    // Make an HTTP request to service S2 to get the difference
    const differenceResponse = await axios.post("http://s2:3002/difference", { a, b });

    // Extract the results from the responses
    const sum = sumResponse.data.result;
    const difference = differenceResponse.data.result;

    // Return the results as JSON
    res.json({ sum, difference });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.all("*", (req, res, next) => {
  const err = new HttpException(404, "Endpoint Not Found");
  return res.status(err.status).send(err.message);
});

app.listen(port, () => {
  console.log("Start", fileName, `S3 App listening at http://localhost:${port}`);
});
