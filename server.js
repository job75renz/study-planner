const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/studyplanner")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

const Task = mongoose.model("Task", {
  subject: String,
  task: String,
  deadline: String,
  status: String
});

app.post("/add", async (req, res) => {
  try {
    const data = new Task(req.body);
    await data.save();
    res.send("Added");
  } catch(e) {
    res.status(500).send("Error adding task");
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const data = await Task.find();
    res.json(data);
  } catch(e) {
    res.status(500).send("Error fetching tasks");
  }
});

app.put("/update/:id", async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, req.body);
    res.send("Updated");
  } catch(e) {
    res.status(500).send("Error updating task");
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.send("Deleted");
  } catch(e) {
    res.status(500).send("Error deleting task");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));