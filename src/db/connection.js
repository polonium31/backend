import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const CONNECT_DB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! Hosted on ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB Connection FAILED", error);
    process.exit(1);
  }
};

export default CONNECT_DB;
