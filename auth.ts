import { db } from './db/db'
import {sign,verify} from 'jsonwebtoken'
function CheckUser(req:any){
    let {username,email,password} = req.body
    username = username?username:"no"
    email = email?email:"no"
    db.select().from('users').where({username,password}).orWhere({email,password}).then((data)=>req.admin=true)
}

function Auth(req:any,res:any,next:any){
    const token = req.headers['x-auth-token']
    if (token){
        req.body= verify(token,'sirli')
        CheckUser(req)
        if(req.admin=true){
            res.send("token bilan ochildi")
            next()
        }else{
            "Muddati o'tgan token"
        }
    }
    else{
        CheckUser(req)
        if(req.admin=true){
            const token = sign(req.body,'sirli')
            res.header('x-auth-token',token).send('token Qabullandi')
            next()
        }else{
            res.send('Not authorized')
        }
    }
}

export {Auth}