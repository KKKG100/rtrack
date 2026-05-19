const express = require("express")
const http = require("http")
const WebSocket = require("ws")
const path = require("path")

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

app.use(express.static(path.join(__dirname, "public")))

let latestPose = {}

wss.on("connection", (ws) => {
    console.log("Browser connected")

    ws.on("message", (message) => {
        try {
            latestPose = JSON.parse(message.toString())
        } catch (err) {
            console.log(err)
        }
    })
})

app.get("/pose", (req, res) => {
    res.json(latestPose)
})

const PORT = 3000

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})