// take the application and run it ->is the use of server.js file

import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";

import connectDB from "./config/db.js";
const PORT=process.env.PORT || 3000;

const startServer = async () => {   
    try{
        // await is for waiting for the connection to be established before starting the server
        await connectDB();
        app.listen(PORT,()=>{
            console.log(`Server listening on the port ${PORT}`);
        });
    }
    catch(error){
        console.error("Error starting the server:", error.message);
        process.exit(1);
    }
};

startServer();


