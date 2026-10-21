import mongoose  from "mongoose";
import config from "./config.js";


const connnectDB = async ()=>{
    await mongoose.connect(config.MONGO_URI)
    console.log("Database connected successfully")
}

export default connnectDB;
