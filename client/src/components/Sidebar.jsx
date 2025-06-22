import React, { useEffect } from "react";
import assets from "../assets/assets"; 
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Auth";
import { ChatContext } from "../../context/chatContext";

const Sidebar = () => {

    const {getUsers, users, unseenMessages, setUnseenMessages, selectedUser, setSelectedUser, getMessages} = React.useContext(ChatContext);
    const {logout , onlineUsers} = React.useContext(AuthContext);

    const [input , setInput] = React.useState("");
    const navigate = useNavigate();

    const filteredUsers = input ? users.filter(user => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

    useEffect(() => {
        getUsers();
    }, [onlineUsers]);

    const handleUserClick = async (user) => {
        try {
            console.log("Selecting user:", user);
            
            // Set selected user FIRST
            setSelectedUser(user);
            
            // Then get messages - don't let getMessages override selectedUser
            await getMessages(user._id);
            
            // Clear unseen messages for this user
            setUnseenMessages(prev => ({
                ...prev,
                [user._id]: 0
            }));
            
            console.log("User selection complete");
        } catch (error) {
            console.error("Error selecting user:", error);
            // Don't reset selectedUser on error
        }
    };

        return (
            <div
            className={`bg-[#818582]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ""}`}
            style={{ width: "30vw", minWidth: "100px", maxWidth: "250px" }}
            >
            <div className="pb-5">
                <div className="flex justify-between items-center ">
                <div className="flex justify-center items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <img src={assets.logo_icon} alt="logo" className="max-w-5 max-h-5" />
                    <p>Whispr</p>
                </div>
                <div className="relative py-2 group">
                    <img src={assets.menu_icon} alt="menu" className="max-h-5 cursor-pointer" />
                    <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282c34] border border-gray-700 text-gray-100 hidden group-hover:block">
                    <p onClick={() => navigate('/profile')} className="cursor-pointer text-sm">Edit profile</p>
                    <hr className="my-2 border-t border-gray-300" />
                    <p onClick={() => logout()} className="cursor-pointer text-sm">Logout</p>
                    </div>
                </div>
                </div>
                <div className="bg-[#282c34] rounded-full flex items-center gap-2 px-3 py-2 mt-5">
                    <img src={assets.search_icon} alt="Search" className="w-3" />
                    <input onChange={(e)=>setInput(e.target.value)} type="text" className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1 " placeholder="Search user " />
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {filteredUsers.map((user, index) => (
                <div
                    className={`relative flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[#282c34] ${selectedUser && selectedUser._id === user._id ? 'bg-[#282c34]' : ''}`}
                    key={user._id || index}
                    onClick={() => { 
                        console.log("Clicking user:", user); // Debug log
                        console.log("setSelectedUser function:", setSelectedUser); // Debug log
                        handleUserClick(user);
                    }}
                >
                    <img src={user?.profilePic || assets.avatar_icon} alt="" className="w-[35px] aspect-[1/1] rounded-full" />
                    <div className="flex flex-col leading-5">
                    <p className="text-sm">{user.fullName}</p>
                    {
                        onlineUsers.includes(user._id)
                        ? <span className="text-xs text-green-400">Online</span>  // Changed to green
                        : <span className="text-xs text-gray-400">Offline</span>
                    }
                    </div>
                    {unseenMessages[user._id] > 0 && <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50'>{unseenMessages[user._id]}</p>}
                </div>
                ))}
            </div>
        </div>
    )
}
export default Sidebar;
