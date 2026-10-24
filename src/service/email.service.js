import nodemailer from "nodemailer";
import config from "../config/config";

const transporter  = nodemailer.createTransport({
    service : "gmail",
    auth : {
        type : "OAuth2",
        user : config.GOOGLE_USER,
        clientId : config.GOOGLE_CLIENT_ID,
        clientSecret : config.GOOGLE_CLIENT_SECRET,
        refreshToken : config.GOOGLE_REFRESH_TOKEN 
    }
})

transporter.verify((error,success)=>{
    if(error){
        console.log('Error connecting to email server : ',error)
    }else { 
        console.log('Email server is ready to take message ')
    }
})

const sendEmail = async (to,subject, text,html)=>{
    try {
        const info =  await transporter.sendMail({
            from : config.GOOGLE_USER,
            to,
            subject,
            text,
            html
        })
    }catch (error){
        console.log(error)
    }
}

export  {transporter,sendEmail}