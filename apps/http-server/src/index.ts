import express, { Request, Response } from "express";
import cors from "cors";
import { CreateUserSchema,SinginSchema } from '@repo/common/types';
import {prismaClient} from '@repo/db/client';
import {JWT_SECRET} from "@repo/backend-common/config"
import bcrypt from "bcrypt"
import Jwt from "jsonwebtoken"

const app = express();

app.use(cors())
app.use(express.json())

app.get('/',(req:Request, res:Response) => {

    res.json({
        message : "healthy"
    })
})

app.post('/signup',async(req:Request, res:Response) => {
    const parsedData = CreateUserSchema.safeParse(req.body);

    if(!parsedData.success){
        res.json({
            message :"Invalid input"
        })
        return
    }

    try{
        const hashedPassword = bcrypt.hash(parsedData.data.password,5)

        const user = await prismaClient.user.create({
            data:{
                email : parsedData.data.email,
                username : parsedData.data.username,
                password : hashedPassword,
            }
        })

        res.json({
            message : "user signed up!",
            user : user.id
        })

    }
    catch(e){

        res.status(500).json({
            error : "server error..."
        })
    }
})

app.post('/signin',(req:Request, res:Response) => {
    const parsedData = SinginSchema.safeParse(req.body);

    if(!parsedData.success){
        res.json({
            message :"Invalid input"
        })
        return
    }

    try{

        const user = prismaClient.user.findFirst({
            where :{
                email : parsedData.data.email,
                password : parsedData.data.password
            }
        })

        if(!user){
            res.json({
                message : "user not signed up"
            })
            return;
        }

        const token = Jwt.sign({
            userId : user?.id
        }, JWT_SECRET || "")

        res.json({
            message : "user signed in",
            token : token
        })
    }
    catch(e){

        res.status(500).json({
            error : "server error"
        })
    }

})

app.post('/room',(req:Request, res:Response) => {

    res.json({
        message : "created room"
    })
})



app.listen(3001,() => {
    console.log('server runnning at port 3000')
})
