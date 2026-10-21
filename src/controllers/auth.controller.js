import userModel from "../model/user.model.js"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import config from "../config/config.js"

const Register = async (req, res) => {  
    const { name, email, password } = req.body;

    const isAlreadyRegistered = await userModel.findOne({ 
        $or : [
            { username : name },
            { email : email }
        ]
     });

     if(isAlreadyRegistered){
        res.status(409).json({message : "User already exists"})
        return
     }

const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")

     const user = await userModel.create({
        username : name,
        email : email,
        password : hashedPassword,
     })

     const token = jwt.sign({id : user._id,},config.JWT_SECRET,{expiresIn : "1d"})
     res.status(201).json({message : "User registered successfully",user : user,token : token})

    }

const getMe = async(req,res)=>{
    const token = req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({message : "Unauthorized"})
    }

    const decoded = jwt.verify(token,config.JWT_SECRET)
    const user = await userModel.findById(decoded.id)
    res.status(200).json({user: user})
}
 
export { Register, getMe }

