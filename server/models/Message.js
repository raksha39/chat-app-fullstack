import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String }, // Changed from 'text' to 'content'
    seen: { type: Boolean, default: false },
    image: { type: String }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;