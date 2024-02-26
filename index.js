const isReady = require("./db/dbready");
const procedureReady = require("./db/isProcedureReady");
//const sanitizeInput = require("./middlewares/sanitizeinput");

require("dotenv").config();
const express = require("express"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  app = express(),
  port = process.env.PORT,
  helmet = require("helmet"),
  client = require("./db/db");

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(cors());


app.use("/api/classes",require("./routes/classes/classes"))
app.use("/api/types",require("./routes/typesforClass/types"))
app.use("/api/blogs",require("./routes/blogs/blog"))




app.get('/', (req, res) => res.send('Hello World!'))



































client
  .connect()
  .then(async() => {
    console.log("psql is connected ..");
    app.listen(port, () =>
      console.log(`Example app listening on port ${port}!`)
    );
    await isReady();
    await procedureReady();
  })
  .catch((error) => console.log(error));
