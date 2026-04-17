const { createServer } = require('./createServer.cjs');

const { server, mongoose } = createServer();

const url = process.env.MONGODB_URI;
mongoose
  .connect(url)
  .then(() => console.log('Mongo DB connected'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 8000;
server.run(PORT, () => console.log(`Server on :${PORT}`));