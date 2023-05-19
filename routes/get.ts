import { Router } from "express"
import { db } from "../db/db"
import { json } from "body-parser"
const app = Router()
app.use(json())

interface Data{
    name:string,
    surname:string,
    phone:string,
    pcopy:string
}

interface PeopleArray {
    [index: number]: Data;
  }


app.get('/',async(req,res)=>{  
    const users = await db<PeopleArray>('customers')
    res.send(users)
})
// Bu asosiy menyudagi barcha foydalanuvchilarni ro'yhat shaklida olib beradi

app.get('/:user_id',async(req,res)=>{
    const userData = await db('customers').where('id',req.params.user_id)
    userData[0]['contracts'] = await db('contracts').where('user_id',req.params.user_id)
    userData[0]['kafil'] = await db('guarantors').where('user_id',req.params.user_id)
    userData[0]['payments']  = await db('payments').where('user_id',req.params.user_id).orderBy('date')
    res.send(userData[0])
})



// app.get('/:user_id/kafillar/',async(req,res)=>{
//         const kafilarr = await db<kafilArray>('guarantors').where('user_id',req.params.user_id)
//         res.send(kafilarr)
// })

// Bu funksiya foydalanucchi ichidagi kafillar tugmasi bosilganda usha foydalanuvchi bilan bogliq barcha kafillar royhatini olib beradi.
// app.get('/:user_id/kafillar/:kafil_id',async(req,res)=>{
//     const{user_id,kafil_id} = req.params
//     const kafil = await db('guarantors').where({user_id,id:kafil_id})
//         res.send(kafil[0])
// })

// Aynan bitta kafilni idsi bo'yicha chiqarib beradi

        

//  async function getCont(req:any,res:any){
//     const contracts = await db<contractsArray>('contracts')
//     }

export default app