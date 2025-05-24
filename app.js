require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const session = require("express-session");
const engine = require("ejs-mate"); // Import ejs-mate
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");

const fs = require('fs');
const uploadDir = 'public/uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Use the file upload middleware


const app = express();
const PORT = process.env.PORT || 3035;

// Set ejs-mate as the engine for rendering EJS files
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.use(express.json());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));


// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }
}));

// MongoDB Connection
const client = new MongoClient(process.env.MONGO_URI);
let db;

client.connect()
    .then(() => {
        db = client.db();
        console.log("✅ Connected to MongoDB");
    })
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/");
    }
    next();
};
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
app.get("/", (req, res) => res.render("index", { layout: "layout", title: "Home", activePage: "home" }));
app.get("/dashboard", (req, res) => res.render("dashboard", { layout: "layout", title: "dashboard", activePage: "dashboard" }));
app.get("/issuance", (req, res) => res.render("issuance", { layout: "layout", title: "issuance", activePage: "dashboard" }));
app.get("/document", (req, res) => res.render("document", { layout: "layout", title: "document", activePage: "document" }));
app.get("/view-request", (req, res) => res.render("view-request", { layout: "layout", title: "view-request", activePage: "document" }));
app.get("/request-now", (req, res) => res.render("request-now", { layout: "layout", title: "request-now", activePage: "document" }));
app.get("/resident", (req, res) => res.render("resident", { layout: "layout", title: "resident", activePage: "resident" }));
app.get("/view-resident", (req, res) => res.render("view-resident", { layout: "layout", title: "view-resident", activePage: "resident" }));
app.get("/view-permit", (req, res) => res.render("view-permit", { layout: "layout", title: "view-permit", activePage: "business" }));
app.get("/view-blotter/:id", async (req, res) => {
    const blotterId = req.params.id;
    try {
        const blotter = await db.collection("blotters").findOne({ _id: new ObjectId(blotterId) });
        if (!blotter) {
            return res.status(404).send("Blotter record not found");
        }
        res.render("view-blotter", { layout: "layout", title: "View Blotter", activePage: "blotter", blotter });
    } catch (error) {
        console.error("Error fetching blotter record:", error);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/print-document", (req, res) => res.render("print-document", { layout: "layout", title: "print-document", activePage: "document" }));
app.get("/notification", (req, res) => res.render("notification", { layout: "layout", title: "notification", activePage: "notification" }));
app.get("/blotter", async (req, res) => {
    try {
        const blotters = await db.collection("blotters").find({}).toArray();
        res.render("blotter", { layout: "layout", title: "blotter", activePage: "blotter", blotters });
    } catch (error) {
        console.error("Error fetching blotters:", error);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/business", (req, res) => res.render("business", { layout: "layout", title: "business", activePage: "business" }));
app.get("/profileA", (req, res) => res.render("profileA", { layout: "layout", title: "profileA", activePage: "profileA" }));
app.get("/announcement", (req, res) => res.render("announcement", { layout: "layout", title: "announcement", activePage: "announcement" }));
app.get("/forgot", (req, res) => res.render("forgot", { layout: "layout", title: "forgot", activePage: "forgot" }));
app.get("/notification", (req, res) => res.render("notification", { layout: "layout", title: "notification", activePage: "notification" }));
app.get("/archive-announcement", (req, res) => res.render("archive-announcement", { layout: "layout", title: "archive-announcement", activePage: "announcement" }));
app.get("/archive-resident", (req, res) => res.render("archive-resident", { layout: "layout", title: "archive-resident", activePage: "resident" }));
app.get("/archive-blotter", (req, res) => res.render("archive-blotter", { layout: "layout", title: "archive-blotter", activePage: "blotter" }));
app.get("/archive-business", (req, res) => res.render("archive-business", { layout: "layout", title: "archive-business", activePage: "business" }));
app.get("/archive-document", (req, res) => res.render("archive-document", { layout: "layout", title: "archive-document", activePage: "document" }));
app.get("/blotter-summary", (req, res) => res.render("blotter-summary", { layout: "layout", title: "blotter-summary", activePage: "dashboard" }));


app.get("/home", (req, res) => res.render("home", { layout: "user", title: "home", activePage: "home" }));
app.get("/profile", (req, res) => res.render("profile", { layout: "user", title: "profile", activePage: "profile" }));
app.get("/user-announcement", (req, res) => res.render("user-announcement", { layout: "user", title: "user-announcement", activePage: "user-announcement" }));
app.get("/request", (req, res) => res.render("request", { layout: "user", title: "request", activePage: "request" }));
app.get("/user-notification", (req, res) => res.render("user-notification", { layout: "user", title: "user-notification", activePage: "user-notification" }));
const sampleReportRouter = require('./routes/sampleReport');

// Register sample report route
app.use('/', sampleReportRouter);

app.get("/edit-blotter/:id", async (req, res) => {
    const blotterId = req.params.id;
    try {
        const blotter = await db.collection("blotters").findOne({ _id: new ObjectId(blotterId) });
        if (!blotter) {
            return res.status(404).send("Blotter record not found");
        }
        res.render("edit-blotter", { layout: "layout", title: "Edit Blotter", activePage: "blotter", blotter });
    } catch (error) {
        console.error("Error fetching blotter record:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/edit-blotter/:id", async (req, res) => {
    const blotterId = req.params.id;
    const { caseNo, natureOfComplaint, dateFiled, complainant, respondent } = req.body;
    try {
        const updateResult = await db.collection("blotters").updateOne(
            { _id: new ObjectId(blotterId) },
            { $set: { caseNo, natureOfComplaint, dateFiled: new Date(dateFiled), complainant, respondent } }
        );
        if (updateResult.matchedCount === 0) {
            return res.status(404).send("Blotter record not found");
        }
        res.redirect("/blotter");
    } catch (error) {
        console.error("Error updating blotter record:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/add-blotter", async (req, res) => {
    const { caseNo, complainant, respondent, natureOfComplaint, dateFiled } = req.body;
    try {
        await db.collection("blotters").insertOne({
            caseNo,
            complainant,
            respondent,
            natureOfComplaint,
            dateFiled: new Date(dateFiled)
        });
        res.redirect("/blotter");
    } catch (error) {
        console.error("Error adding new blotter record:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/archive-blotter", async (req, res) => {
    try {
        // Assuming archived blotters have a field 'archived' set to true
        const archivedBlotters = await db.collection("blotters").find({ archived: true }).toArray();
        res.render("archive-blotter", { layout: "layout", title: "Archive Blotter", activePage: "blotter", archivedBlotters });
    } catch (error) {
        console.error("Error fetching archived blotters:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/update-blotter-status", async (req, res) => {
    const { blotterId, status } = req.body;
    try {
        const updateResult = await db.collection("blotters").updateOne(
            { _id: new ObjectId(blotterId) },
            { $set: { status } }
        );
        if (updateResult.matchedCount === 0) {
            return res.status(404).send("Blotter record not found");
        }
        res.redirect(`/edit-blotter/${blotterId}`);
    } catch (error) {
        console.error("Error updating blotter status:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
