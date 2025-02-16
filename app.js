const bodyParser = require("body-parser");
const express = require("express");

const app = express();

const cors = require("cors");
require("dotenv").config()

const PORT = process.env.PORT ?? 8080

const { createRouter } = require("./routes/createRoute");
const { readRoute } = require("./routes/readRoute");
const indexRouter = require("./routes/indexRoute");
const { deleteRouter } = require("./routes/deleteRoute");
const { updateRoute } = require("./routes/updateRoute");

//  app level middlewares

app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static("views"))
app.use(cors());


// routers

app.use("/api/", createRouter)
app.use("/api/", indexRouter)
app.use("/api/", readRoute)
app.use("/api/", deleteRouter)
app.use("/api/", updateRoute)


app.get("/", async (req, res) => {
    res.json({message: "Welcome to tip-logger api! Esure that you're verified and there you go!"})
})

app.listen(PORT, () => {
    console.log("App is listening on port ", PORT);
})