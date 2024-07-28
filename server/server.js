const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");

// Number of salt rounds
const saltRounds = 10;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://priyanshug02:tdiCicyeliaKEPAo@cluster0.5qvpygy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const dbName = "main";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(cors());

// GET endpoint to retrieve data
// app.get("/api/data", (req, res) => {
//   res.json({ message: "Hello from Node.js! TEST" });
// var hashedPass = bcrypt.hashSync(pass, saltRounds);
// console.log(user, hashedPass);
// });

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.post("/login", async (req, res) => {
  const { user, pass } = req.body;

  // Search in DB for user, if not found, return error
  // if found, check password
  // if correct, return success
  // if incorrect, return error
  var result = await client
    .db(dbName)
    .collection("users")
    .findOne({ user: user });

  if (!result) {
    console.log("User not found");
    res.status(400).json({ error: "User not found" });
  } else if (!(await bcrypt.compare(pass, result.pass))) {
    console.log("Incorrect password");
    res.status(400).json({ error: "Incorrect password" });
  } else {
    console.log("Login successful");
    res.status(200).json({
      tasks: result.tasks,
      classes: result.classes,
    });
  }
});

app.post("/create", async (req, res) => {
  const { user, pass } = req.body;

  // Search in DB for user, if found, return error
  // if not found, create user
  // return success
  var result = await client
    .db(dbName)
    .collection("users")
    .findOne({ user: user });

  if (result) {
    console.log("A user with that name already exists");
    res.status(400).json({ error: "A user with that name already exists" });
  } else {
    var hashedPass = await bcrypt.hash(pass, saltRounds);

    result = await client.db(dbName).collection("users").insertOne({
      user: user,
      pass: hashedPass,
      tasks: [],
      classes: [],
    });

    console.log("User created");

    res.status(200).json({ 
      tasks: [],
      classes: [],
    });
  }
});

app.post("/update", async (req, res) => {

  // Update DB with new tasks
  // Only if user is not empty
  // Return success
  
  const { user, tasks, classes } = JSON.parse(req.body);

  if(user === ""){
    console.log("Invalid request");
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  
  await client
    .db(dbName)
    .collection("users")
    .updateOne({ user: user }, { $set: { tasks: tasks, classes: classes } });

  console.log("Update successful");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    // Implement retry logic if necessary
  }
}

async function startServer() {
  await connectToMongoDB();
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");

  await client.close();
  console.log("MongoDB connection closed");

  process.exit(0);
});
