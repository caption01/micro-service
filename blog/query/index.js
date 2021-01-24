const express = require("express");
const bodyParse = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParse.json());
app.use(cors());

const posts = {};

const handleEvents = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;
    posts[id] = {
      id,
      title,
      comments: [],
    };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    const comment = post.comments.find((comment) => {
      return comment.id === id;
    });

    comment.status = status;
    comment.content = content;
  }
};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const {
    events: { type, data },
  } = req.body;

  handleEvents(type, data);

  console.log(posts);

  res.send({});
});

app.listen(4002, async () => {
  console.log("query service running on 4002");

  const res = await axios.get("http://event-bus-srv:4005/events");

  for (let object of res.data) {
    console.log(object);
    console.log("Processing", object.events.type);

    handleEvents(object.events.type, object.events.data);
  }
});
