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

async function Auth(req: any, res: any, next: any) {
    const toke = req.headers["authorization"];
    if (toke) {
        const token = toke && toke.split(" ")[1];
        verify(token, "sirli", (err: any) => {
            if (err) res.send("Yaroqsiz token");
            else next();
        });
    } else {
        await CheckUser(req, res);
        if (req.admin) {
            const token = sign(req.body, "sirli", { expiresIn: "1d" });
            res.send({ token: token });
        } else {
            res.send("Not authorized");
        }
    }
}

export { Auth };
