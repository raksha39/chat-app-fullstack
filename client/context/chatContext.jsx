import { createContext , useState , useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./Auth";


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users,setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const {socket , axios, authUser} = useContext(AuthContext); // Add authUser

    //function to get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseen); // Changed from unseenMessages to unseen
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to get all messages for selected user - FIXED
    const getMessages = async (userId) => {
        try {
            console.log("Getting messages for userId:", userId);
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                console.log("Messages received:", data.messages);
                setMessages(data.messages);
                // DON'T set selectedUser here - it should already be set by Sidebar
                // The user object should come from the users array, not from this function
            }
        } catch (error) {
            console.error("Get messages error:", error);
            toast.error(error.response?.data?.message || "Failed to get messages");
        }
    }

    // function to send message to selected user
    const sendMessage = async (message) => {
        try {
            console.log("ChatContext sendMessage called with:", message);
            console.log("Selected user:", selectedUser);
            
            if (!selectedUser || !selectedUser._id) {
                toast.error("No user selected");
                return;
            }
            
            // Determine if it's an image (base64 string) or text
            const isImage = typeof message === 'string' && message.startsWith('data:image/');
            
            const requestData = isImage 
                ? { image: message }    // Send as image
                : { message: message }; // Send as message (not text)
            
            console.log("Sending request:", requestData);
            
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, requestData);
            
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.message]);
                // DON'T reset selectedUser here
            } else {
                toast.error(data.message || "Failed to send message");
                // DON'T reset selectedUser on error
            }
        } catch (error) {
            console.error("Send message error:", error);
            toast.error(error.response?.data?.message || "Failed to send message");
            // DON'T reset selectedUser on error
            throw error;
        }
    }

    // function to subscribe to messages for selected user
    const subscribeToMessages = async () => {
        if(!socket) return;
        socket.on("newMessage", (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages ((prevMessages)=> [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages ((prevUnseenMessages)=>({
                ...prevUnseenMessages, [newMessage.senderId] :
                prevUnseenMessages [newMessage.senderId] ? prevUnseenMessages
                [newMessage.senderId] +1:1
                }))
            }
        })
    }

    // function to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if(socket) socket.off("newMessage");
    }
    useEffect(() => {
        subscribeToMessages();

        return ()=> unsubscribeFromMessages();
    }, [socket, selectedUser])
    
    // Make sure value object includes all functions
    const value = {
        messages,
        users, 
        selectedUser, 
        unseenMessages,
        setMessages,
        setUsers,
        setSelectedUser,
        setUnseenMessages,
        getUsers,      // Add this - it's missing!
        getMessages,   // Add this - it's missing!
        sendMessage, 
        subscribeToMessages
    };

    return (
        <ChatContext.Provider value={value}>
        {children}
        </ChatContext.Provider>
    );
}