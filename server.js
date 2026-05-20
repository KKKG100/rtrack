const express = require("express")
const http = require("http")
const WebSocket = require("ws")
const path = require("path")

const app = express()

const server = http.createServer(app)

const wss = new WebSocket.Server({
    server
})

app.use(express.static(path.join(__dirname, "public")))

let latestPose = {}

-----------------------------------------------------
-- WEBSOCKET
-----------------------------------------------------

wss.on("connection", (ws) => {

    console.log("WebSocket connected")

    ws.on("message", (message) => {

        try {

            latestPose = JSON.parse(
                message.toString()
            )

        } catch (err) {

            console.log(err)

        }
    })

    ws.on("close", () => {

        console.log("WebSocket disconnected")

    })
})

-----------------------------------------------------
-- POSE ENDPOINT
-----------------------------------------------------

app.get("/pose", (req, res) => {

    res.json(latestPose)

})

-----------------------------------------------------
-- TEST
-----------------------------------------------------

app.get("/test", (req, res) => {

    res.send("Server works")

})

-----------------------------------------------------
-- START
-----------------------------------------------------

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {

    console.log("Running on port " + PORT)

})
