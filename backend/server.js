require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://rickymetral.xyz'] // Vite's default port
}));
// app.use(bodyParser.json());
app.use(express.json());


const url = process.env.MONGODB_URI;
mongoose.connect(url)
  .then(() => console.log("Mongo DB connected"))
  .catch(err => console.log(err));

var api = require('./api.js');
api.setApp(app, mongoose );

app.use((req, res, next) =>
{
  app.get("/api/ping", (req, res, next) => {
	res.status(200).json({ message: "Hello World" });
  });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

app.listen(5001); // start Node + Express server on port 5000