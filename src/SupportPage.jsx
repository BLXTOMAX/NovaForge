import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, User, MessageSquare } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export default function SupportPage() {

const [name,setName] = useState("")
const [email,setEmail] = useState("")
const [message,setMessage] = useState("")
const [sent,setSent] = useState(false)

const sendMessage = async () => {

await fetch(`${apiUrl}/support`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name,
email,
message
})
})

setSent(true)
}

return(

<div className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-6">

<motion.div
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.6}}
className="w-full max-w-2xl rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-xl p-10"
>

<h1 className="text-4xl font-bold mb-6 text-center">
Support
</h1>

<p className="text-center text-white/60 mb-8">
Une question ? Un problème ? Contacte-nous.
</p>

<div className="space-y-5">

<div className="relative">
<User className="absolute left-4 top-4 text-white/40"/>
<input
placeholder="Nom"
value={name}
onChange={(e)=>setName(e.target.value)}
className="w-full h-12 pl-12 rounded-xl bg-white/10 border border-white/10"
/>
</div>

<div className="relative">
<Mail className="absolute left-4 top-4 text-white/40"/>
<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full h-12 pl-12 rounded-xl bg-white/10 border border-white/10"
/>
</div>

<div className="relative">
<MessageSquare className="absolute left-4 top-4 text-white/40"/>
<textarea
placeholder="Message"
value={message}
onChange={(e)=>setMessage(e.target.value)}
className="w-full h-32 pl-12 pt-3 rounded-xl bg-white/10 border border-white/10"
/>
</div>

<button
onClick={sendMessage}
className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 font-semibold"
>
Envoyer le message
</button>

{sent && (
<p className="text-green-400 text-center mt-4">
Message envoyé avec succès
</p>
)}

</div>

</motion.div>

</div>
)
}
