require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

let config = {};
try {
    config = require('./config');
} catch (err) {
    // config.js is optional; fallback to environment variables or default URI
}

const MONGO_URI = process.env.MONGO_URI || config.MONGO_URI || "mongodb://localhost:27017/campusEventsDB";

function buildStandardMongoUri(srvUri) {
    if (!srvUri.startsWith("mongodb+srv://")) return null;
    try {
        const uri = srvUri.replace("mongodb+srv://", "mongodb://");
        const parsed = new URL(uri);
        const username = decodeURIComponent(parsed.username);
        const password = decodeURIComponent(parsed.password);
        const auth = username ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : "";
        const hostname = parsed.hostname;
        const [clusterName, ...domainParts] = hostname.split('.');
        const domain = domainParts.join('.');
        const hosts = [`${clusterName}-shard-00-00.${domain}:27017`, `${clusterName}-shard-00-01.${domain}:27017`, `${clusterName}-shard-00-02.${domain}:27017`].join(',');
        const params = new URLSearchParams(parsed.searchParams);
        if (!params.has('replicaSet')) params.set('replicaSet', `${clusterName}-shard-0`);
        if (!params.has('authSource')) params.set('authSource', 'admin');
        if (!params.has('retryWrites')) params.set('retryWrites', 'true');
        if (!params.has('w')) params.set('w', 'majority');
        if (!params.has('tls')) params.set('tls', 'true');
        const pathname = parsed.pathname === '/' ? '' : parsed.pathname;
        return `mongodb://${auth}${hosts}${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    } catch (err) {
        return null;
    }
}

// Mongoose schema & model
const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true, trim: true },
    eventType: {
        type: String,
        enum: ["Workshop", "Hackathon", "Seminar", "Masterclass", "Competition", "Other"],
        required: true,
    },
    resourcePerson: { type: String, trim: true },
    eventDate: { type: Date, required: true },
    venue: { type: String, trim: true },
    maxParticipants: { type: Number, min: 1 },
    registrationStatus: { type: String, enum: ["Open", "Closed"], default: "Open" },
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);

// Helper: validate ObjectId
function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

let dbConnected = false;

function requireDB(req, res) {
    if (!dbConnected) {
        res.status(503).json({ error: 'Database not connected' });
        return false;
    }
    return true;
}


app.post("/api/events", async (req, res) => {
    try {
        if (!requireDB(req, res)) return;
        const { eventName, eventType, eventDate, maxParticipants } = req.body;
        if (!eventName || !eventType) {
            return res.status(400).json({ error: "eventName and eventType are required" });
        }
        if (!eventDate) {
            return res.status(400).json({ error: "eventDate is required" });
        }
        if (maxParticipants != null && Number(maxParticipants) <= 0) {
            return res.status(400).json({ error: "maxParticipants must be a positive number" });
        }

        const event = new Event(req.body);
        const saved = await event.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/events", async (req, res) => {
    try {
        if (!requireDB(req, res)) return;
        const events = await Event.find().sort({ eventDate: 1 }).exec();
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/events/:id", async (req, res) => {
    try {
        if (!requireDB(req, res)) return;
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });
        const event = await Event.findById(id).exec();
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/events/:id", async (req, res) => {
    try {
        if (!requireDB(req, res)) return;
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });
        if (req.body.maxParticipants != null && Number(req.body.maxParticipants) <= 0) {
            return res.status(400).json({ error: "maxParticipants must be a positive number" });
        }

        const updated = await Event.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        }).exec();
        if (!updated) return res.status(404).json({ error: "Event not found" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/events/:id", async (req, res) => {
    try {
        if (!requireDB(req, res)) return;
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });
        const removed = await Event.findByIdAndDelete(id).exec();
        if (!removed) return res.status(404).json({ error: "Event not found" });
        res.json({ message: "Event deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

(async function start() {
    try {
        await mongoose.connect(process.env.MONGO_URI || MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        dbConnected = true;
        console.log("MongoDB (Mongoose) connected");
    } catch (err) {
        if (process.env.MONGO_URI?.startsWith('mongodb+srv://') || config.MONGO_URI?.startsWith('mongodb+srv://') || MONGO_URI.startsWith('mongodb+srv://')) {
            const srv = process.env.MONGO_URI || config.MONGO_URI || MONGO_URI;
            const fallback = buildStandardMongoUri(srv);
            if (fallback) {
                console.warn('SRV connect failed — retrying with standard MongoDB URI');
                try {
                    await mongoose.connect(fallback, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                    });
                    dbConnected = true;
                    console.log('MongoDB (Mongoose) connected via standard URI');
                    return;
                } catch (retryErr) {
                    console.error('Retry with standard URI failed:', retryErr.message);
                }
            }
        }
        dbConnected = false;
        console.error("MongoDB connection error:", err.message);
        console.error("Routes will return 503 until the database is available.");
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();