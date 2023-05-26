import { Router } from "express";
import { db } from "../db/db";
import { json } from "body-parser";
const app = Router();
app.use(json());
import { Auth } from "../auth";
import path from "path";
interface Data {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    total_sum: number;
    first_payment: number;
    months: number;
    date: string;
    remaind_sum: number;
    fine_sum: number;
}

interface Arr {
    paid: number;
}

function sum(arr: Array<Arr>) {
    let sum = 0; // initialize sum

    // Iterate through all elements
    // and add them to sum
    for (let i = 0; i < arr.length; i++) sum += arr[i].paid;

    return sum;
}
app.get("/", async (req, res) => {
    let users = (await db("customers").select(
        "id",
        "first_name",
        "last_name",
        "phone",
        "total_sum",
        "first_payment",
        "months",
        "date",
        "status",
        "remaind_sum",
        "fine"
    )) as Array<Data>;
    // const Datasetd = await Promise.all(
    //     users.map(async (user) => {

    //         return user;
    //     })
    // );
    res.send(users);
});
// Bu asosiy menyudagi barcha foydalanuvchilarni ro'yhat shaklida olib beradi

app.get("/:user_id", async (req, res) => {
    const userData = await db("customers").where("id", req.params.user_id);
    userData[0]["payments"] = await db("payments")
        .where("user_id", req.params.user_id)
        .orderBy("date");
    res.send(userData[0]);
});

app.get("/:user_id/:name", Auth, (req, res) => {
    const user_id = 3;
    db.select("*")
        .from("images")
        .where({ user_id })
        .then((images) => {
            if (images[0]) {
                const dirname = path.resolve();
                const fullfilepath = path.join(dirname, images[0].path);
                return res.sendFile(fullfilepath);
            }
            return Promise.reject(new Error("Image does not exist"));
        })
        .catch((err) =>
            res.status(404).json({
                success: false,
                message: "not found",
                stack: err.stack,
            })
        );
});

export default app;
