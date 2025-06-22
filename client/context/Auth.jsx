/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import toast from "react-hot-toast";
import { createContext,useEffect, useState } from "react";
import { io } from "socket.io-client";


const backendUrl = import.meta.env.VITE_BACKEND_URL;
// This is the backend URL for the application, which is set using environment variables.
axios.defaults.baseURL = backendUrl;
// This sets the default base URL for axios requests to the backend URL.


export const AuthContext = createContext();

export const AuthProvider =({children})=> {

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    
    
    //check if user is authenticated and if yes then set the user data and connect the socket

    const checkAuth = async () => {
        try {
            const {data} = await axios.get('/api/auth/check');
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);

            }
        }catch(error){
            toast.error(error.message)
        }
    }

    // login function to handle user authentication and socket connection

    const login = async (state, credentials)=>{
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
            } else {
                toast.error(data.message);  // Changed from toast.success to toast.error
            }
        } catch (error) {
            console.error("Login error:", error);  // Add logging
            toast.error(error.response?.data?.message || error.message);
        }
    }

    // logout function to handle user logout and disconnect the socket
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        
        if (socket) {  // Add this check
            socket.disconnect();
            setSocket(null);  // Add this
        }
        
        toast.success("Logged out successfully");
    }

    //update profile function to handle user profile update 
    const updateProfile = async (body)=>{
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if(data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully")
            } else {
                toast.error(data.message || "Profile update failed");  // Add this
            }
        } catch (error) {
            console.error("Update profile error:", error);  // Add logging
            toast.error(error.response?.data?.message || error.message);  // Better error handling
        }
    }


    //connect socket function to handle socket connection and online users update

    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
            userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds)=>{
            setOnlineUsers (userIds);
        })
    }
    



    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            
        }
        checkAuth();
    }, [])

    // Make sure your value object includes axios
    const value = {
        authUser,
        onlineUsers,
        socket,
        axios,          // Make sure this is included!
        login,
        logout,
        updateProfile,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}