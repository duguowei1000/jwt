require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const transactions = require("./transactions");
const users = require("./users");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("working");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (users[username].password === password) {  //username ==>> username in your object
    //authenticate and create the jwt

    const newToken = jwt.sign(
      {
        user: username,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: 60 * 60 }
    );
    res
    .status(200)
    .cookie("NewCookie", newToken, { path: "/", httpOnly: true })
    .send("cookie");

    res.status(200).json({ token: newToken });
  } else {
    res.status(403).send("unauthorised");
  }
});

// app.post("/posts", (req,res) => {
//     console.log(req.headers.bearertoken)
//     const authtoken = req.headers.bearertoken
//     //validate the token
//     const decoded = jwt.verify(authtoken, process.env.TOKEN_SECRET)
//     //if invalid, shld send back 403
//     if(!decoded){
//         res.sendStatus(403).end
//     }
//     console.log('>>>',decoded)
//     //if valid, retrieve username of token
//     const username = decoded.user;
//     const userTransactions = transactions[username]
//     res.status(200).json({ transactions: userTransactions})

// })

const verifyToken = (req,res,next) => {
    try{
        console.log(req.headers.bearertoken)
        const authtoken = req.headers.bearertoken
        //validate the token
        const decoded = jwt.verify(authtoken, process.env.TOKEN_SECRET)
        const username = decoded.user
        req.user = username
        next()
        //if valid, retrieve username of token
        
    }catch (error){
        res.sendStatus(403)
    }
}

app.post("/posts", verifyToken, (req,res) => {

    console.log('requser',req.user)
    const username = req.user;
    const userTransactions = transactions[username]
    res.status(200).json({ transactions: userTransactions})

})

app.post("/logout", (req, res) => {
    res.clearCookie("NewCookie").send("cookie dead")
})


app.listen(4500, () => {
  console.log("listening at port 4500");
});
