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


app.post("/submit", (req, res) => {
  const existingUser = Users.findOne(req.body.username);
  if (!existingUser) {
    
  
  console.log(req.body);
      Users.create(req.body)
        .then(() => {
          console.log("User created.");
        })
        .catch((error) => {
          console.error("Error creating user.", error);
        });
      res.render("signin.ejs");
  }
  else{
    res.render("index.ejs",{existingUser:true});
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
