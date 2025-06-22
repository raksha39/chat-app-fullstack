import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloud.js";
import { io, userSocketMap } from "../server.js";

// Get all users except the current user
export const getUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");
        
        // Count number of unseen messages (fixed field names)
        const unseen = {};
        const promises = filteredUsers.map(async (user) => {
            const unseenCount = await Message.find({ 
                sender: user._id, 
                recipient: userId, 
                seen: false 
            });
            
            if (unseenCount.length > 0) {
                unseen[user._id] = unseenCount.length;
            }
        });

        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers, unseen });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get all messages for selected user (fixed field names)
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: myId, recipient: selectedUserId },
                { sender: selectedUserId, recipient: myId }
            ]
        })
        .populate('sender', 'fullName profilePic')
        .populate('recipient', 'fullName profilePic')
        .sort({ createdAt: 1 });

        // Format messages for frontend consistency
        const formattedMessages = messages.map(msg => ({
            ...msg.toObject(),
            senderId: msg.sender._id,      // Add for compatibility
            recipientId: msg.recipient._id, // Add for compatibility
            message: msg.content           // Add for compatibility
        }));

        await Message.updateMany(
            { sender: selectedUserId, recipient: myId },
            { seen: true }
        );

        res.json({ success: true, messages: formattedMessages });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Mark messages as seen
export const markMessagesSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Send message to user (MAJOR FIX)
export const sendMessage = async (req, res) => {
    try {
        const { message, image } = req.body; // Fixed: expect 'message' not 'text'
        const { id: recipientId } = req.params; // Fixed: get recipient from params
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "chat-app",
                resource_type: "auto"
            });
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            sender: senderId,           // Fixed field name
            recipient: recipientId,     // Fixed field name
            content: message,           // Fixed field name
            image: imageUrl
        });

        // Populate sender and recipient info for frontend
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'fullName profilePic')
            .populate('recipient', 'fullName profilePic');

        // Format response to include both field names for compatibility
        const responseMessage = {
            ...populatedMessage.toObject(),
            senderId: senderId,        // Add for frontend compatibility
            recipientId: recipientId,  // Add for frontend compatibility
            message: message           // Add for frontend compatibility
        };

        // Emit the new message to the recipient's socket
        const receiverSocketId = userSocketMap[recipientId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", {
                ...populatedMessage.toObject(),
                senderId: senderId,  // Add for frontend compatibility
                recipientId: recipientId
            });
        }
       
        res.json({ success: true, message: responseMessage });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}