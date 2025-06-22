import  { useContext, useState } from "react";
import assets from '../assets/assets';
import { AuthContext } from "../../context/Auth";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
// State to store the full name input value
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");   
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);   
  
 const {login} = useContext(AuthContext);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    
    const credentials = {
        email,
        password,
        ...(currState === "Sign up" && { fullName, bio })
    };
    
    login(currState === "Sign up" ? "signup" : "login", credentials);
}

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
    setIsDataSubmitted(false);
};

  return (
	<div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
	  
	  <form onSubmit={onSubmitHandler} className='border-2 bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
        {currState}
        <img src={assets.arrow_icon} alt="" className='w-5 cursor-pointer'/>
        </h2>
        {currState === "Sign up" &&  !isDataSubmitted &&(
            <input
                onChange={(e)=>setFullName(e.target.value)} value={fullName}
                type="text"
                className='p-2 border border-gray-500 rounded-md focus:outline-none'
                placeholder="Full Name"
                required
                
            />
        )}
        {!isDataSubmitted && (
            <>
                <input onChange={(e)=>setEmail(e.target.value)} value={email}
                type="email" placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus: outline-none focus:ring-2 focus:ring-indigo-500'/>
                <input onChange={(e)=>setPassword(e.target.value)} value={password} 
                type="password" placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
            </>
        )}  

        {currState === "Sign up" && !isDataSubmitted && (
            <textarea onChange={(e)=>setBio(e.target.value)} value={bio} 
            rows={4} placeholder='provide a short bio' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' required></textarea>
        )}  

        <button type="submit" className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-300">
            {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
            <input type="checkbox" />
            <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className='flex flex-col gap-2'>
            {currState === "Sign up" ? (
                <p className='text-sm text-gray-600'>Already have an account? <span
                onClick={() => {
                    setCurrState("Login");
                    resetForm();
                }}  className='font-medium text-violet-500 cursor-pointer'>Login here</
                span></p>
                
            ):(
                <p className='text-sm text-gray-600'>Create an account <span
                onClick={() => {
                    setCurrState("Sign up");
                    resetForm();
                }}  className='font-medium text-violet-500 cursor-pointer'>Click here</
                span></p>
            )}
        </div>


	  </form>
	</div>
  );
};

export default LoginPage;