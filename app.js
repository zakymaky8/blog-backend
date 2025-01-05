const bodyParser = require("body-parser");
const express = require("express");
const path = require("path")
const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient();
const app = express();
const cors = require("cors");

const methodOverride = require("method-override");

app.use(methodOverride("_method"));
  
// app.use((req, res, next) => {
//     console.log(`HTTP Method: ${req.method}`);
//     next();
//   });
  
const { createRouter } = require("./routes/createRoute");
const { readRoute } = require("./routes/readRoute");
const indexRouter = require("./routes/indexRoute");
const { deleteRouter } = require("./routes/deleteRoute");
const { updateRoute } = require("./routes/updateRoute");

app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static("views"))
app.use(cors());


// routers

app.use("/", createRouter)

app.use("/", indexRouter)
app.use("/", readRoute)
app.use("/", deleteRouter)
app.use("/", updateRoute)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.get("/", async (req, res) => {
    const users = await prisma.users.findMany()
    res.json({users: users})
    // res.json({message: "welcome to zakblog api"})
})



app.listen(3456, () => {
    console.log("server is listening at 3456");
})