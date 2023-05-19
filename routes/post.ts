import { Router } from "express"
import { db } from "../db/db"
import { json } from "body-parser"
const app = Router()
app.use(json())
app.post('/',async(req,res)=>{  
    await postCmr(req,res)
    await postGrn(req,res)
    await postCont(req,res)
    res.sendStatus(200)
})
app.post('/:user_id/kafil',async(req,res)=>{
    await postGrn(req,res)
    res.sendStatus(200)
})

app.post('/:user_id/contracts',async(req,res)=>{
    await postCont(req,res)
    res.sendStatus(200)
})



 async function postCmr(req:any,res:any){
    const date = new Date()
    let {name,surname,phone,pcopy} = req.body    
    if(name&&surname&&phone&&pcopy){
        const data = await db.insert({name,surname,phone,pcopy,date}).into('customers').returning('id')
        req.params.user_id = data[0].id*1

    }else{
        res.send("Maydonlar to'liq to'ldirilmagan")
 }}
 async function postGrn(req:any,res:any){
    const date = new Date()
    const {name,surname,phone,pcopy} = req.body.kafil   
    const{user_id} = req.params
    if(name&&surname&&phone&&pcopy){
        await db.insert({user_id,name,surname,phone,pcopy,date}).into('guarantors')
    }else{
        res.send("Maydonlar to'liq to'ldirilmagan")
 }}
 async function postCont(req:any,res:any){
    const date = new Date()
    const {pdf,loan,term,every_month} = req.body.contracts
    const{user_id} = req.params
    if(pdf&&loan&&term&&every_month){
       await db.insert({user_id,pdf,loan,date,term,every_month}).into('contracts')
        
    }else{
        res.send("Maydonlar to'liq to'ldirilmagan")
 }}

interface Arr{
    paid:number
}

function sum(arr:Array<Arr>) { 
    let sum = 0; // initialize sum 

    // Iterate through all elements 
    // and add them to sum 
    for (let i = 0; i < arr.length; i++) 
        sum += arr[i].paid; 

    return sum; 
} 


async function testCron(){
    const day = new Date()
    const users = await db('contracts').whereRaw("date::text LIKE ?",`%-%-${day.getDate()}%`).select('id','user_id','loan','peniya','every_month',db.raw('EXTRACT(MONTH FROM date) AS month'))
    console.log(users)
    users.forEach(async(user)=>{
        
        const {user_id,id,month,every_month,loan,peniya} = user

        
        const tolangani = await db('payments').where({user_id}).select('paid')
        
        if((sum(tolangani)-(day.getMonth()+1-month)*every_month)<0){
            const newpeniya = loan*0.04 + peniya
            await db('contracts').where({id}).update({qarzdorlik:true,peniya:newpeniya})
            await db.insert({user_id,peniya:loan*0.04,date:day}).into('payments')
        }
    })
    

}


async function cron2(today:Date) {
    const users = await db('contracts').whereRaw("date::text LIKE ?",`%-%-${today.getDate()}%`).select('id','user_id','loan','peniya','every_month',db.raw('EXTRACT(MONTH FROM date) AS month'))
    console.log(users)
    users.forEach(async(user)=>{
        
        const {user_id,id,month,every_month,loan,peniya} = user

        
        const tolangani = await db('payments').where({user_id}).select('paid')
        
        if((sum(tolangani)-(today.getMonth()+1-month)*every_month)<0){
           
                console.log(`${today.toISOString}  kuni kredit muddati tugaydu kreditni qoplang`)
            
            
        }
    })
    
}



testCron()
const today = new Date()
cron2(today)
var cron = require('node-cron');

cron.schedule('1 0 0 * * *', () => {
    const day= new Date()
});
export default app