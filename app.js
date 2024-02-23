import express from "express";

import mongoose from "mongoose";

import bodyParser from "body-parser";

import { createServer } from "http";

import { Server } from "socket.io";

const app = express();

const port = procees.env.PORT||3000;

const server = createServer(app);

const io = new Server(server);

import formatMessage from "./message.js";

import Users from "./model/userschema.js";

const db =
  "mongodb+srv://rs2321446:raj773592@cluster0.wargaq5.mongodb.net/User?retryWrites=true&w=majority";

const active_users = {};

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

mongoose
  .connect(db)
  .then(() => {
    console.log("Connected to db.");
  })
  .catch((error) => {
    console.error("Error connecting to db.", error);
  });

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/submit", async (req, res) => {
  try {
    const existingUser = await Users.findOne({ username: req.body.username });
    console.log(existingUser);
    if (!existingUser) {
      console.log(req.body);

      await Users.create(req.body);

      console.log("User created.");
      res.render("signin.ejs");
    } else {
      res.render("index.ejs", { existingUser: true });
    }
  } catch (error) {
    console.error("Error processing user request.", error);

    res.status(500).send("Internal Server Error");
  }
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Users.findOne({ username, password });

    if (user) {
      const username = req.body.username;
      // Authentication successful
      res.render("chatapp.ejs", { username: username });
    } else {
      // Authentication failed
      res.status(401).render("signin.ejs", { error: true });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/:username/credentials", async (req, res) => {
  try {
    const username = req.params.username;

    const user = await Users.findOne({ username: username });

    if (user) {
      console.log(user);
      res.render("credentials.ejs", { user });
    } else {
      res.status(404).send("Credentials not found");
    }
  } catch (error) {
    console.error("Error fetching user credentials:", error);
    res.status(500).send("Internal Server Error");
  }
});

io.on("connection", (socket) => {
  socket.on("active", (username) => {
    active_users[socket.id] = username;
    socket.broadcast.emit("join", active_users[socket.id]);

    io.emit("updated_join", Object.values(active_users));
  });

  socket.on("chat message", (msg) => {
    const username = active_users[socket.id];
    io.emit("chat message", formatMessage(username, msg));
  });

  socket.on("disconnect", () => {
    if (active_users[socket.id]) {
      socket.broadcast.emit("leave", active_users[socket.id]);
      delete active_users[socket.id];
      io.emit("updated_left", Object.values(active_users));
    }
  });
});

app.get("/signin", (req, res) => {
  res.render("signin.ejs");
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
