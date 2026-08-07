// import Navbar from "../components/layout/Navbar";
// import Footer from "../components/layout/Footer";

// function AdminNotifications() {
//   return (
//     <>
//       <Navbar />

//       <div style={{ padding: "30px" }}>
//         <h1>Notifications</h1>
//         <p>Create and Send Notifications.</p>
//       </div>

//       <Footer />
//     </>
//   );
// }

// export default AdminNotifications;

// import { useEffect, useState } from "react";

// import {

// createNotification,

// getNotifications

// }

// from "../services/adminNotifications";

// function AdminNotifications(){

// const [notifications,setNotifications]=useState([]);

// const [form,setForm]=useState({

// title:"",

// message:"",

// priority:"High"

// });

// const load=async()=>{

// const data=await getNotifications();

// setNotifications(data);

// };

// useEffect(()=>{

// load();

// },[]);

// const send=async()=>{

// await createNotification(form);

// setForm({

// title:"",

// message:"",

// priority:"High"

// });

// load();

// };

// return(

// <div className="page">

// <h1>📢 Admin Notifications</h1>

// <input

// placeholder="Title"

// value={form.title}

// onChange={(e)=>setForm({

// ...form,

// title:e.target.value

// })}

// />

// <textarea

// placeholder="Message"

// value={form.message}

// onChange={(e)=>setForm({

// ...form,

// message:e.target.value

// })}

// />

// <select

// value={form.priority}

// onChange={(e)=>setForm({

// ...form,

// priority:e.target.value

// })}

// >

// <option>High</option>

// <option>Medium</option>

// <option>Low</option>

// </select>

// <button onClick={send}>

// Send Notification

// </button>

// <hr/>

// {

// notifications.map((n)=>(

// <div key={n._id}>

// <h3>{n.title}</h3>

// <p>{n.message}</p>

// <b>{n.priority}</b>

// </div>

// ))

// }

// </div>

// );

// }

// export default AdminNotifications;

import { useState } from "react";
import { sendNotification } from "../services/adminNotifications";

function AdminNotifications() {

    const [title, setTitle] = useState("");

    const [message, setMessage] = useState("");

    const [priority, setPriority] = useState("Low");

    const handleSend = async () => {

        await sendNotification({

            title,

            message,

            priority

        });

        alert("Notification Sent");

        setTitle("");

        setMessage("");

    };

    return (

        <div className="admin-page">

            <h1>📢 Send Notification</h1>

            <input
                placeholder="Title"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
            />

            <textarea
                placeholder="Message"
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
            />

            <select
                value={priority}
                onChange={(e)=>setPriority(e.target.value)}
            >

                <option>High</option>

                <option>Medium</option>

                <option>Low</option>

            </select>

            <button onClick={handleSend}>

                Send Notification

            </button>

        </div>

    );

}

export default AdminNotifications;