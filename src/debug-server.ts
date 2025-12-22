import express from "express";

const app = express();

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.listen(4010, () => {
  console.log("DEBUG server on 4010");
});
