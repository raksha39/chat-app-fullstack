import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from '../assets/assets';
import { AuthContext } from "../../context/Auth";

const ProfilePage = () => {
    const {authUser, updateProfile} = React.useContext(AuthContext);
    
    // Initialize with current user data
    const [name, setName] = useState(authUser?.fullName || "");
    const [bio, setBio] = useState(authUser?.bio || "");
    const [selectedImg, setSelectedImg] = React.useState(null);
    const navigate = useNavigate();

    // Update form when authUser loads
    useEffect(() => {
        if (authUser) {
            setName(authUser.fullName || "");
            setBio(authUser.bio || "");
        }
    }, [authUser]);

    const handleSubmit = async(e) => {
        e.preventDefault();
        if(!selectedImg){
            await updateProfile({ fullName: name, bio });
            navigate('/');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(selectedImg);
        reader.onload = async () => {
            const base64Image = reader.result; // Get the base64 string without the data URL prefix
            await updateProfile({profilePic:base64Image , fullName : name ,bio})
            navigate('/');
        }
        
    }

    return (
        <div className='min-h-screen bg-cover bg-no-repeat flex items-center
        justify-center'>
            <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
                <h3 className="text-lg">Profile details</h3>
                <label>
                    <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id='avatar' accept=".png , .jpg , .jpeg" hidden />
                    <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} alt=""  
                    className={`w-12 h-12 ${selectedImg && "rounded-full"}`}/>
                    upload profile picture
                </label>

                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder=" Your Name" className="p-2 border border-gray-500 rounded
                -md focus:outline-none focus:ring-2 focus:ring-blue-500"/>

                <textarea onChange={(e)=>setBio (e.target.value)} value={bio}
                        placeholder="Write profile bio" required className="p-2 border
                      border-gray-500 rounded-md focus: outline-none focus:ring-2
                     focus:ring-violet-500" rows={4}>

                </textarea>
                <button type="submit" className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-1g cursor-pointer">Save
                </button>
                </form>
                <img className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && "rounded-full"}`} src={authUser?.profilePic || assets.logo_icon} alt="" />
            </div>
        </div>
    )
}
export default ProfilePage;
