import React, {  useContext, useEffect, useState } from "react";
import assets from "../assets/assets"; 
import { FormatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/chatContext";
import { AuthContext } from "../../context/Auth";
import toast from "react-hot-toast"; // Add this import


const ChatContainer = () => {
    const {messages, selectedUser, setSelectedUser, sendMessage, getMessages} = React.useContext(ChatContext);
    const {authUser, onlineUsers} = useContext(AuthContext);
    const scrollEnd = React.useRef(null);

    const [input, setInput] = useState(''); // Fixed variable name

    // Add handleSendMessage function
    const handleSendMessage = async(e) => {
        if (e) e.preventDefault(); // Make e optional since onClick doesn't pass event
        if (input.trim() === "") return;
        
        try {
            console.log("Sending message:", input.trim()); // Debug log
            await sendMessage(input.trim());
            setInput('');
            toast.success("Message sent!");
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
            // Don't let the error crash the component
        }
    };

    //handle sending an image
    const handleImageSend = async (e) => {
        const file = e.target.files[0];
        if(!file || !file.type.startsWith("image/")) {
            toast.error("Please select a valid image file.");
            return;
        }
        
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                console.log("Sending image..."); // Debug log
                // Send image as base64 string, not object
                await sendMessage(reader.result);
                e.target.value = "";
                toast.success("Image sent!");
            }
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Failed to send image:", error);
            toast.error("Failed to send image");
        }
    }

    useEffect(() => {
        if(selectedUser) {
            getMessages(selectedUser._id); // Fetch messages for the selected user
        }
    }, [selectedUser]); // Add dependency

    useEffect(() => {
        if(scrollEnd.current) {
            scrollEnd.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]); // Add dependency

    // Add debug logs
    console.log("ChatContainer Debug:");
    console.log("messages:", messages);
    console.log("authUser:", authUser);
    console.log("selectedUser:", selectedUser);
    
    // Debug each message structure
    if (messages.length > 0) {
        console.log("First message structure:", messages[0]);
        console.log("Message fields:", Object.keys(messages[0]));
    }
    
    return selectedUser ? (
        <div className="h-full sm:w-3/4 md:w-1/2 lg:w-1/2 overflow-scroll relative backdrop-blur-lg">
            <div className="flex items-center gap-10 py-3 mx-6 border-b border-stone-500">
                <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 rounded-full" />
                <p className="flex-1 text-lg text-white flex items-center gap-2">
                    {selectedUser.fullName || "Unknown User"}
                    {onlineUsers.includes(selectedUser._id) && (
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    )}
                </p>
                <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className="md:hidden max-w-7" />
                <img src={assets.help_icon} alt="" className="max-md:hidden w-5" />
            </div>

            {/* Messages area */}
            <div className="flex flex-col gap-4 p-6 h-full overflow-y-scroll">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${
                        // Use consistent field name - check what your backend sends
                        (msg.sender?._id || msg.senderId) === authUser?._id ? 'justify-end' : 'justify-start'
                    }`}>
                        {msg.image ? (
                            <img src={msg.image} alt="" className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8" />
                        ) : (
                            <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all ${
                                (msg.sender?._id || msg.senderId) === authUser?._id
                                    ? 'bg-violet-500/30 text-white rounded-br-none' 
                                    : 'bg-gray-600/30 text-white rounded-bl-none'
                            }`}>
                                {msg.content || msg.message || msg.text} {/* Try all possible field names */}
                            </p>
                        )}
                        <div className="text-center text-xs text-gray-400">
                            <img src={
                                (msg.sender?._id || msg.senderId) === authUser?._id 
                                    ? authUser?.profilePic || assets.avatar_icon 
                                    : selectedUser?.profilePic || assets.avatar_icon
                            } alt="" className="w-5 h-5 rounded-full" />
                            <p className="text-gray-400">{FormatMessageTime(msg.createdAt)}</p>
                        </div>
                    </div>
                ))}
                <div ref={scrollEnd}></div>
            </div>

            {/* Input area */}
            <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
                <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
                    <input 
                        onChange={(e) => setInput(e.target.value)} 
                        value={input}
                        onKeyDown={(e) => e.key === "Enter" ? handleSendMessage() : null}
                        type="text" 
                        placeholder="Send a message"
                        className='flex-1 text-sm p-3 border-none rounded-lg outline-none bg-transparent text-white placeholder-gray-400'
                    />
                    <input onChange={handleImageSend} type="file" id='image' accept='image/png, image/jpeg' hidden/>
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer"/>
                    </label>
                </div>
                <img 
                    src={assets.send_button} 
                    alt="" 
                    className="w-7 cursor-pointer"
                    onClick={handleSendMessage}
                />
            </div>
        </div>
    ) : (
        <div className="flex flex-col w-1/2 items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
            <img src={assets.logo_icon} className="max-w-16" alt="" />
            <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
        </div>
    );
};

export default ChatContainer;
