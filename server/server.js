import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

//verify environment variables
console.log("Environment check:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✓" : "✗");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓" : "✗");
console.log("PORT:", process.env.PORT);

//create express app and http server
const app = express();
const server = http.createServer(app);

//initialize socket.io server
export const io =new Server(server,{
    cors: {origin :"*"}
})

//stor online users
export const userSocketMap ={};

//socket .io connection handler
io.on("connection" , (socket) =>{
    const userId=socket.handshake.query.userId;
    console.log ("User Connected" , userId);

    if(userId) userSocketMap[userId] =socket.id;

    //emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));


    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys (userSocketMap))
    })
    
})

//Middlewares setup
app.use(express.json({limit : "2mb"}));
app.use(cors());

//routes setup
app.use("/api/status" , (req, res) => res.send("Server is live"));
app.use("/api/auth" , userRouter);
app.use("/api/messages", messageRouter);

(async () => {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log("Server is running on port " + PORT);
    });
})();