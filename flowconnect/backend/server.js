const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server: SocketIO } = require("socket.io");
const initSocket = require("./socket/socket.js");
const notificationsRouter = require("./routes/notifications.js");
const analyticsRouter = require("./routes/analytics.js");

const app = express();
const server = http.createServer(app);

const io = new SocketIO(server, {
  cors: { origin: "*" },
});

initSocket(io);

mongoose.connect("YOUR_MONGO_URI");

app.use(express.json());
app.use("/api/notifications", notificationsRouter);
app.use("/api/dashboard", analyticsRouter);

server.listen(5000, () => console.log("Server running on port 5000"));