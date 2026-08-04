import mongoose from "mongoose";
import chalk from "chalk";
export const connectDb=async () => {

    try{
        const connection=await mongoose.connect(process.env.MONGO_URI);
        console.log(chalk.yellowBright.bold(`database connected ${connection.connection.host}`));
    }
    catch(error){
        console.log(error); 
        process.exit(1);
    }
    
}