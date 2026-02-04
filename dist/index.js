"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const firebase_1 = require("./firebase");
const app = (0, express_1.default)();
const JWT_SECRET = process.env.JWT_SECRET || "f7b9c2a5e8d1436a9201f8b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3";
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: "Access denied. Token not provided." });
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ error: "Invalid or expired token." });
        req.user = user;
        next();
    });
};
app.get("/user/:email", async (req, res) => {
    try {
        const email = req.params.email;
        if (!email)
            return res.status(400).json({ error: "Email is required" });
        const snapshot = await firebase_1.db.collection("users").where("email", "==", email).get();
        if (snapshot.empty)
            return res.json({ success: false });
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const user = { id: userDoc.id, email: userData.email };
        const token = jsonwebtoken_1.default.sign(user, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            success: true,
            user,
            token
        });
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching user", details: error });
    }
});
app.post("/user", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ error: "Email is required" });
        const newUserRef = firebase_1.db.collection("users").doc();
        await newUserRef.set({
            email,
            created_at: new Date(),
        });
        res.json({ success: true, id: newUserRef.id });
    }
    catch (error) {
        res.status(500).json({ error: "Error creating user", details: error });
    }
});
app.get("/tasks/:userId", authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        if (req.user.id !== userId) {
            return res.status(403).json({ error: "You do not have permission to view these tasks" });
        }
        let query = firebase_1.db.collection("tasks").where("userId", "==", userId);
        const snapshot = await query.get();
        if (snapshot.empty) {
            return res.json({ tasks: [], message: "No tasks found" });
        }
        const tasks = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || "",
                description: data.description || "",
                completed: data.completed || false,
                created_at: data.created_at ? data.created_at.toDate?.() || data.created_at : null,
            };
        });
        const sortedTasks = tasks.sort((a, b) => {
            if (!a.created_at)
                return 1;
            if (!b.created_at)
                return -1;
            return b.created_at.getTime() - a.created_at.getTime();
        });
        res.json({ tasks: sortedTasks });
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching tasks", details: error });
    }
});
app.post("/tasks", authenticateToken, async (req, res) => {
    try {
        const { userId, title, description } = req.body;
        if (!userId || !title)
            return res.status(400).json({ error: "Required fields missing" });
        const newTaskRef = firebase_1.db.collection("tasks").doc();
        await newTaskRef.set({
            userId,
            title,
            description: description || "",
            completed: false,
            created_at: new Date(),
        });
        res.json({ success: true, id: newTaskRef.id });
    }
    catch (error) {
        res.status(500).json({ error: "Error creating task", details: error.toString() });
    }
});
app.put("/tasks/:id", authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { title, description, completed } = req.body;
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (completed !== undefined)
            updateData.completed = completed;
        if (Object.keys(updateData).length === 0)
            return res.status(400).json({ error: "No data provided for update" });
        await firebase_1.db.collection("tasks").doc(id).update(updateData);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Error updating task", details: error });
    }
});
app.delete("/tasks/:id", authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        await firebase_1.db.collection("tasks").doc(id).delete();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting task", details: error });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
