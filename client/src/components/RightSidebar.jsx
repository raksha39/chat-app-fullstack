import React from 'react';
import assets, { imagesDummyData } from '../assets/assets';

const RightSidebar = ({selectedUser}) => {
    return selectedUser && (
        <div className={`bg-[#8185B2]/10 text-white w-[30%] relative overflow-y-scroll ${selectedUser ? 'max-md:hidden' : ''}`}>
            <div className='pt-16 pb-10 flex flex-col items-center gap-4'>
                <img src={selectedUser?.profilepic || assets.avatar_icon} alt="" className='w-20 aspect-[1/1] rounded-full ' />
                <div className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
                    <span className='w-2 h-2 rounded-full bg-green-500 inline-block'></span>
                    <h1>{selectedUser?.fullName}</h1>
                </div>
                <p className='px-10 mx-auto'>{selectedUser.bio || ''}</p>
            </div>

            <hr className='border-[#151313] my-4'/>
            <div className='px-5 text-xs'>
                <p>Media</p>
                <div className='mt-2 max-h-[100px] overflow-y-scroll  grid grid-cols-2 gap-4 opacity-80 '>
                    {imagesDummyData.map((url, index) => (
                        <div key={index} onClick={() => window.open(url, '_blank', 'noopener,noreferrer')} >
                            <img src={url} alt={`Media ${index}`} className='w-full h-auto rounded-md' />
                        </div>
                        
                    ))}
                </div>
            </div>
            <button className='absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded full cursor pointer'>Logout</button>
        </div>
    )
}
export default RightSidebar;