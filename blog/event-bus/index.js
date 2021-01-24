const express = require("express");
const bodayParse = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodayParse.json());
app.use(cors());

const eventRecords = [];

app.post("/events", async (req, res) => {
  const events = req.body;

  eventRecords.push(events);

  await axios.post("http://posts-clusterip-srv:4000/events", events);
  await axios.post("http://comments-srv:4001/events", events);
  await axios.post("http://query-srv:4002/events", events);
  await axios.post("http://moderation-srv:4003/events", events);

  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  console.log(eventRecords);
  res.send(eventRecords);
});

app.listen(4005, () => {
  console.log("event-bus running on 4005");
});
