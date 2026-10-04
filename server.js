const express = require("express")
const fs = require("fs")
const path = require("path")
const muter = require("muter")

const app = express()
const adsFilePath = path.join(__dirname, "data", "ads.json")
const upload = muter({ storage: storage })

app.use(express.static("static"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use("uploads", express.static(path.join(__dirname, "static", "uploads")))

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

app.get("/expample", (req, res, next) => {
    req.userName = "John Doe"
    next()
}, (req, res) => {
    res.send(`Hello, ${req.userName}!`)
})

const storage = muter.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "static", "uploads"))
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
    }
})

function readAds() {
    const data = fs.readFileSync(adsFilePath, "utf8")
    return JSON.parse(data)
}

function writeAds(ads) {
    fs.writeFileSync(adsFilePath, JSON.stringify(ads, null, 2))
}

app.set("view engine", "ejs")
app.set("views", "views")

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/api/ads", (req, res) => {
    const ads = readAds()
    res.json(ads)
})

app.post("/api/ads", (req, res) => {
    const { title, description } = req.body || {}

    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" })
    }

    const ads = readAds()
    const newAd = { title, description }
    ads.push(newAd)
    writeAds(ads)

    res.status(201).json({ success: true, ad: newAd, ads })
})

app.use((req, res) => {
    res.status(404).render("notfound")
})

app.listen(3000, () => {
    console.log("Server started on http://localhost:3000")
})