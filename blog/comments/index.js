const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const comments = commentByPostId[req.params.id] || [];

  comments.push({
    id: commentId,
    content,
    status: "pending",
  });

  commentByPostId[req.params.id] = comments;

  await axios.post("http://event-bus-srv:4005/events", {
    events: {
      type: "CommentCreated",
      data: {
        id: commentId,
        content,
        postId: req.params.id,
        status: "pending",
      },
    },
  });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  const {
    events: { type, data },
  } = req.body;

  if (type === "CommentModerated") {
    const { id, postId, status, content } = data;

    const comments = commentByPostId[postId];

    const comment = comments.find((comment) => {
      return comment.id === id;
    });

    comment.status = status;

    await axios.post("http://event-bus-srv:4005/events", {
      events: {
        type: "CommentUpdated",
        data: {
          id,
          status,
          postId,
          content,
        },
      },
    });
  }

  console.log("ReviceEvent", type);

  res.send({});
});

app.listen(4001, () => {
  console.log("server posts running at 4001");
});
