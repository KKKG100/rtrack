import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0"

const video = document.getElementById("video")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const socket = new WebSocket("ws://localhost:3000")

let poseLandmarker
let running = true

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    })

    video.srcObject = stream

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video)
        }
    })
}

async function createPoseLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    )

    poseLandmarker = await PoseLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task"
            },
            runningMode: "VIDEO",
            numPoses: 1
        }
    )
}

function normalizePoint(point) {
    return {
        x: point.x,
        y: point.y,
        z: point.z
    }
}

async function predict() {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const drawingUtils = new DrawingUtils(ctx)

    async function frame() {

    if (!running) return

    const now = performance.now()

    const result = poseLandmarker.detectForVideo(
        video,
        now
    )

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    )

    console.log(result)

    if (
        result &&
        result.landmarks &&
        result.landmarks[0]
    ) {

        const landmarks = result.landmarks[0]

        const important = {

            head: landmarks[0],

            leftShoulder: landmarks[11],
            rightShoulder: landmarks[12],

            leftElbow: landmarks[13],
            rightElbow: landmarks[14],

            leftHand: landmarks[15],
            rightHand: landmarks[16],

            leftHip: landmarks[23],
            rightHip: landmarks[24],

            leftKnee: landmarks[25],
            rightKnee: landmarks[26],

            leftFoot: landmarks[27],
            rightFoot: landmarks[28]
        }

        if (
            socket.readyState === WebSocket.OPEN
        ) {

            socket.send(
                JSON.stringify(important)
            )

        }

        console.log("SENT")
    }

    requestAnimationFrame(frame)
}

    frame()
}

await setupCamera()
await createPoseLandmarker()
await predict()
