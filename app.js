import express from "express";

import mongoose from "mongoose";

import bodyParser from "body-parser";

const app = express();

const port = process.env.PORT||3000;

import Users from "./model/userschema.js";

const db =
  "mongodb+srv://rs2321446:raj773592@cluster0.wargaq5.mongodb.net/User?retryWrites=true&w=majority";

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

mongoose.connect(db).then(()=>{
  console.log("Connected to db.");
}).catch((error)=>{
  console.error("Error connecting to db.",error);
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});


app.post("/submit", async (req, res) => {
  try {
    // Use async/await to wait for the findOne operation to complete
    const existingUser = await Users.findOne({ username: req.body.username });
    console.log(existingUser);
    if (!existingUser) {
      console.log(req.body);

      // Create a new user
      await Users.create(req.body);
      
      console.log("User created.");
      res.render("signin.ejs");
    } else {
      // User already exists
      res.render("index.ejs", { existingUser: true });
    }
  } catch (error) {
    console.error("Error processing user request.", error);
    // Handle the error appropriately, e.g., render an error page or send an error response
    res.status(500).send("Internal Server Error");
  }
});



    app.post("/signin", async (req, res) => {
      const { username, password } = req.body;
    
      try {
        const user = await Users.findOne({ username, password });
        
        if (user) {
          // Authentication successful
          res.render("credentials.ejs",{user});
        } else {
          // Authentication failed
          res.status(401).render("signin.ejs",{error:true});
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    


app.get("/signin", (req, res) => {
  res.render("signin.ejs");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
