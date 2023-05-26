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
app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});
app.get("/restaurants", async (req, res) => {
    const resData = await db("restaurants");
    res.send(resData);
});
app.get("/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    console.log(req.params.user_id);
    const userData = await db("customers").where("id", user_id);
    userData[0]["payments"] = await db("payments")
        .where({ user_id })
        .orderBy("date");

    userData[0]["pay_table"] = await db("pay_table").where(
        "user_id",
        req.params.user_id
    );
    res.send(userData[0]);
});

app.get("/:user_id/:name", (req, res) => {
    const user_id: any = req.params.user_id;
    const name = req.params.name;
    console.log(req.params);
    db.select("*")
        .from("images")
        .where({ user_id, name })
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
