/* eslint-disable no-console */
import {Server} from "http";
import app from "./app";
import mongoose from "mongoose";
import { envVars } from "./app/config/env";





let server : Server;



const startServer = async() =>{
   try {
     await mongoose.connect(envVars.DB_URL)
    console.log("connected to db!!");

   server =  app.listen(envVars.PORT,()=>{
        console.log(`server is listening on port ${envVars.PORT}`);
    })
    
   } catch (error) {
    console.log(error);
   }

}

startServer()

process.on("unhandledRejection", (err)=>{
    console.log("unhandled rejection detected.... server shutting down", err);

    if(server){
        server.close(()=>{
            process.exit(1)
        });
        
    }
    process.exit(1)
})


process.on("uncaughtException", (err)=>{
    console.log("uncaught exception detected....server is shutting down...", err);

    if(server){
        server.close(()=>{
            process.exit(1)
        })
    }
    process.exit(1)
})

process.on("SIGTERM", ()=>{
    console.log("sigterm signal received..server is shutting down...");

    if(server){
        server.close(()=>{
            process.exit(1)
        })
    }
    process.exit(1)
})


// Promise.reject(new Error("i forgot to catch this promise")) // unhandled rejection error

// throw new Error("i forgot to handle local server prb with try catch") //uncaught rejection error


// unhandled rejection error =  related to Promise 
// uncaught rejection error = related to local server problem that did not handle with try catch
// signal terminate  sigterm =related to server hosting owner (hosting)

