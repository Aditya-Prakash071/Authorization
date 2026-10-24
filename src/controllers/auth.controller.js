import userModel from "../model/user.model.js"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import config from "../config/config.js"
import sessionModel from "../model/session.model.js"

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


    //  const refreshToken = jwt.sign({id : user._id,},config.JWT_SECRET,{expiresIn : "7d"})
    //  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    //  const session = await sessionModel.create({
    //     userId : user._id,
    //     refreshTokenHash : refreshTokenHash,
    //     ip : req.ip,
    //     userAgent : req.headers["user-agent"]
    //  })
    //  const accessToken = jwt.sign({id : user._id,sessionId : session._id},config.JWT_SECRET,{expiresIn : "15m"})
     
    //  res.cookie("refreshToken",refreshToken,{
    //     httpOnly : true,
    //     secure : true,
    //     sameSite : "strict",
    //     maxAge : 7 * 24 * 60 * 60 * 1000
    //  })

    await sendEmail()

      res.status(201).json({message : "User registered successfully",user : user,verified : user.verified})
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

const refreshToken = async(req,res)=>{
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken){
        return res.status(401).json({message : "Unauthorized"})
    }
    const decode = jwt.verify(refreshToken,config.JWT_SECRET)

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session = await sessionModel.findOne({
        refreshTokenHash : refreshTokenHash,
        revoked : false
    })

    if(!session){
        return res.status(401).json({message : "Session not found"})
    }
    const newRefreshToken = jwt.sign({id : decode.id},config.JWT_SECRET,{expiresIn : "7d"})

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex")
    session.refreshTokenHash = newRefreshTokenHash
    await session.save()    

    const accessToken = jwt.sign({id : decode.id},config.JWT_SECRET,{expiresIn : "15m"})
    res.cookie("refreshToken",newRefreshToken,{
        httpOnly : true,
        secure : true,
        sameSite : "strict",
        maxAge : 7 * 24 * 60 * 60 * 1000
     }) 
    res.status(200).json({accessToken : accessToken})
}

const logOut = async(req,res)=>{
    const  refreshToken = req.cookies.refreshToken
    if(!refreshToken){
        return res.status(401).json({message : "Refresh token not found"})
    }
    const  refreshTokenHash  = crypto.createHash("sha256").update(refreshToken).digest("hex")
    const session = await sessionModel.findOne({refreshTokenHash : refreshTokenHash,revoked : false})
    if(!session){
        return res.status(401).json({message : "Session not found"})
    }
    session.revoked = true
    await session.save()
    res.clearCookie("refreshToken")

    res.status(200).json({
        message : "Logged out successfully"
    })
}

const logOutAll = async(req,res)=>{
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken){
        return res.status(401).json({message : "Refresh token not found"})
    }
    const decode = jwt.verify(refreshToken, config.JWT_SECRET)

    await sessionModel.updateMany({
       userId : decode.id,
       revoked : false
    },{
        revoked : true 
    })

    res.clearCookie("refreshToken")

    res.status(200).json({
        message : "Logged out from all sessions successfully"
    })
}

const login = async(req,res)=>{
    const {email,password} = req.body
    const user = await userModel.findOne({email : email})
    if(!user){
        return res.status(401).json({message : "User Not Found"})
    }
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")
    if(user.password  !== hashedPassword){
        return res.status(401).json({message : "Invalid Password"})
    }

    const refreshToken = jwt.sign({
        id : user._id
    },config.JWT_SECRET,{expiresIn : "7d"})

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session = await sessionModel.create({
        userId : user._id,
        refreshTokenHash : refreshTokenHash,
        ip : req.ip,
        userAgent : req.headers["user-agent"]
    })

    const accessToken = jwt.sign({
        id : user._id,
        sessionId : session._id
    },config.JWT_SECRET,{expiresIn : "15m"})

    res.cookie("refreshToken",refreshToken,{
        httpOnly : true,
        secure : true,
        sameSite : "strict",
        maxAge : 7 *24 *60* 60 *1000
    }) 

    res.status(200).json({
        message : "Logged in successFully",
        user : user,
        accessToken : accessToken
    })
}



export { Register, getMe, refreshToken, logOut ,logOutAll,login}

