import React from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import {ChatContext} from "../../context/chatContext";
import { useContext } from "react";

const HomePage = () => {
    const {selectedUser} = useContext(ChatContext);

    return (
        <div className="border w-full h-screen sm:px-[15%] sm:py-[5%] ">
            <div className={ `backdrop-blur-xl border-gray-300 border-2 rounded-lg flex flex-row h-full  ${selectedUser ? 'md:grid-cols-[1fr_1.5fr]' : 'md:grid-cols-[1fr]'}` }>
                <Sidebar />
                <ChatContainer/>
                <RightSidebar/>
            </div>
        </div>
    )
}
export default HomePage;