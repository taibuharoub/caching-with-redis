const express = require("express");
const Redis = require("ioredis");
const connectDB = require("./db");
connectDB();

const Post = require("./models/Post");

const app = express();
const redis = new Redis();

const cache = (req, res, next) => {
  const { id } = req.params;
  redis.get(id, (error, result) => {
    if (error) throw error;
    if (result !== null) {
      //here is a sting so will return it to an object
      return res.status(200).json(JSON.parse(result));
    } else {
      return next();
    }
  });
};

app.use(express.json());

app.get("/post/:id", cache, async (req, res, next) => {
  const { id } = req.params;
  const data = await Post.findById(id);
    redis.set(id, JSON.stringify(data));
//   decide to persist the data for certain time
//   redis.set(id, JSON.stringify(data), "ex", 15); //expires in 15s
  return res.status(200).json(data);
});

app.listen(3000, () => {
  console.log(`Server at http://localhost:3000`);
});
