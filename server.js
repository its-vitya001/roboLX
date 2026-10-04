const express = require("express")
const fs = require("fs")
const path = require("path")
const multer = require("multer")

const app = express()
const adsFilePath = path.join(__dirname, "data", "ads.json")
const uploadsDir = path.join(__dirname, "static", "uploads")

fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, "-")
        cb(null, `${Date.now()}-${safeName}`)
    }
})

const upload = multer({ storage })

function readAds() {
    if (!fs.existsSync(adsFilePath)) {
        fs.writeFileSync(adsFilePath, "[]", "utf8")
        return []
    }

    const data = fs.readFileSync(adsFilePath, "utf8")
    return JSON.parse(data)
}

function writeAds(ads) {
    fs.writeFileSync(adsFilePath, JSON.stringify(ads, null, 2), "utf8")
}

app.set("view engine", "ejs")
app.set("views", "views")

app.use(express.static("static"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use("/uploads", express.static(uploadsDir))

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

app.get("/", (req, res) => {
    const ads = readAds()
    res.render("index", { ads })
})

app.get("/api/ads", (req, res) => {
    const ads = readAds()
    res.json(ads)
})

app.post("/api/ads", upload.single("image"), (req, res) => {
    const rawBody = req.body || {}
    const title = rawBody.title || rawBody["ad-title"]
    const description = rawBody.description || rawBody["ad-description"]

    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" })
    }

    const ads = readAds()
    const imageName = req.file ? req.file.filename : ""

    const newAd = {
        id: Date.now(),
        title: String(title).trim(),
        description: String(description).trim(),
        image: imageName ? [imageName] : []
    }

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