import { db } from "./db/db";
import { sign, verify } from "jsonwebtoken";
async function CheckUser(req: any, res: any) {
    let { username, email, password } = req.body;
    username = username ? username : null;
    email = email ? email : null;
    password = password ? password : null;
    const checked = await db
        .select()
        .from("users")
        .where({ username, password })
        .orWhere({ email, password });
    if (checked[0] != null) {
        req.admin = true;
    } else {
        req.admin = false;
    }
}

<<<<<<< HEAD
async function Auth(req: any, res: any, next: any) {
    const token = req.headers["x-auth-token"];
    if (token) {
        verify(token, "sirli", (err: any) => {
            if (err) res.send("Yaroqsiz token");
=======
async function Auth(req:any,res:any,next:any){
    const token = req.headers['x-auth-token']
    if (token){
        const check = verify(token,'sirli',(err:any)=>{
            if (err) res.send('Yaroqsiz token')
>>>>>>> da592cdd1758a7592f9ed824f7ecaca296761dfb
            else next();
        });
    } else {
        await CheckUser(req, res);
        if (req.admin) {
            const token = sign(req.body, "sirli");
            res.header("x-auth-token", token).sendStatus(200);
        } else {
            res.send("Not authorized");
        }
    }
}

export { Auth };
