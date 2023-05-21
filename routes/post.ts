import { Router } from "express"
import { db } from "../db/db"
import { json } from "body-parser"
<<<<<<< HEAD
const path = require('path');
const multer = require('multer');
const morgan = require('morgan')
=======
import fs from 'fs'
import multer from 'multer'
const upload = multer({ dest: 'uploads/' })
>>>>>>> 53ac9bff1f652f09a7866f73337960b873af1579
const app = Router()
app.use(json())
app.post('/',async(req,res)=>{  
    postUser(req,res)
    res.sendStatus(200)
})

<<<<<<< HEAD
// app.use(morgan('dev'))
const storage = multer.diskStorage({
    destination: (req:any, file:any, cb:any) => {
      // Specify the directory where you want to store the uploaded files
      cb(null, 'uploads/');
    },
    filename: (req:any, file:any, cb:any) => {
        // Generate a custom filename based on your requirements
        const originalname = file.originalname;
        const extension = originalname.substring(originalname.lastIndexOf('.'));
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + extension;
        cb(null, filename);
      },
  });
  const upload = multer({ storage: storage });

app.post('/todesodi',upload.array('images',3), async (req:any, res) => {	
    console.log(req.files)
    const images = req.files
    const user_id = '3'
    images.map((image:any)=>{
        const {path,filename} = image;
        db.insert({
            user_id,
            filename,
            path,
          })
            .into('images')
            .catch(err =>{
               console.log(err)
            }
             
            );
    })
    res.sendStatus(200)
  }) 






interface User{
    id:number,
    first_name: string;
    last_name: string;
    phone: string;
    kepil_first_name: string;
    kepil_last_name: string;
    kepil_phone: string;
    images: [file:Object];
    total_sum: number;
    first_payment: number;
    months: number;
    date: string;
}

=======
interface User{
    first_name: string;
    last_name: string;
    phone: string;
    kepil_first_name: string;
    kepil_last_name: string;
    kepil_phone: string;
    images: [file:Object];
    total_sum: number;
    first_payment: number;
    months: number;
    date: string;
}

>>>>>>> 53ac9bff1f652f09a7866f73337960b873af1579
async function postUser(req:any,res:any){
    const date = new Date()
    const {images} = req.body
    console.log(images)
    delete req.body.images 
    if(req.body){
        const data = await db.insert(req.body).into('customers').returning('id')
        req.params.user_id = data[0].id*1

    }else{
        res.send("Maydonlar to'liq to'ldirilmagan")
    }
}

interface Payments{
    user_id:number |string ,
    payment:number,
    date:string,
    type:'cash' | 'card'
}

app.post('/:user_id/payment',async(req,res)=>{
    let data:Payments = req.body
    data.user_id = req.params.user_id
    await db.insert(data).into('payments')
<<<<<<< HEAD
    res.sendStatus(200)
=======
>>>>>>> 53ac9bff1f652f09a7866f73337960b873af1579
})







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



// testCron()
// const today = new Date()
// cron2(today)
var cron = require('node-cron');

cron.schedule('1 0 0 * * *', () => {
    const day= new Date()
});
export default app