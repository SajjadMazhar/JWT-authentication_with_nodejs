const express = require("express")
require("dotenv").config()
const app = express();
const jwt = require("jsonwebtoken")

app.use(express.json())
const posts = [
    {
        username:"Sajjad",
        title:"post 1"
    },
    {
        username:"Mazhar",
        title:"post 2"
    }
]
let refreshTokens = []

app.get("/posts", generateAccessToken, (req,res)=>{
    res.json(posts.filter(post=>post.username === req.user.name))
})

app.post("/token", (req, res)=>{
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401);
    if(refreshTokens.includes(refreshToken)) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403);
        const accessToken = generateAccessToken({name:user.name})
        res.json({accessToken})
    });
})

app.delete("/logout", (req, res)=>{
    refreshTokens = refreshTokens.filter(token => token!== req.body.token)
    res.sendStatus("204")
})
app.post("/login",(req,res)=>{
    const username = req.body.username;
    const user = {name:username}
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.json({accessToken, refreshToken})
})

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'15s'})
}

app.listen(4000, ()=>{
    console.log("connection successful")
})