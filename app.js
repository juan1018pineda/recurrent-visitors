import express from "express";
import mongoose from "mongoose";

const app = express();

//Conexión a DB
mongoose.connect(
  process.env.MONGODB_URL || "mongodb://localhost:27017/recurrent_visitors",
  { useNewUrlParser: true }
);
mongoose.connection.on("error", function (e) {
  console.error(e);
});

//Schema
const schema = {
  name: String,
  count: Number,
};

//Model
const Visitor = mongoose.model("visitors", schema);

//Controller
app.get("/", (req, res) => {
  const name =
    req.query.name == undefined || req.query.name == ""
      ? "Anónimo"
      : req.query.name;
  if (name === "Anónimo") {
    const visitor = new Visitor({ name, count: 1 });
    visitor.save((err, visitor) => {});
  } else {
    const visitor = Visitor.findOne({ name });
    if (visitor) {
      visitor.count += 1;
      visitor.save((err, visitor) => {});
    } else {
      const visitor = new Visitor({ name, count: 1 });
      visitor.save((err, visitor) => {});
    }
  }
  Visitor.find((err, data) => {
    if (err) res.status(500).send();
    if (data.length === 0) res.status(204);
    let table = `<table><tr><th>Id</th><th>Name</th><th>Visits</th></tr>`;
    data.forEach((visitor) => {
      table += `<tr><td>${visitor._id}</td><td>${visitor.name}</td><td>${visitor.count}</td></tr>`;
    });
    table += `</table>`;
    res.send(table);
  });
});

app.listen(3000, () => console.log("Listening on port 3000"));
