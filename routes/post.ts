import { Router } from "express";
import { db } from "../db/db";
import { json } from "body-parser";
import { Auth } from "../auth";
import imgRouter from "./postimages";
const app = Router();
app.use("/", imgRouter);
app.use(json());
interface Payments {
    user_id: number | string;
    payment: number;
    date: string;
    type: "cash" | "card";
}

app.post("/:user_id/payment", Auth, async (req, res) => {
    let data: Payments = req.body;
    data.user_id = req.params.user_id;
    await db.insert(data).into("payments");

    res.sendStatus(200);
});

app.post("/restaurants", async (req, res) => {
    await db.insert(req.body).into("restaurants");
    res.sendStatus(200);
});

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

async function testCron() {
    const day = new Date();
    const users = await db("contracts")
        .whereRaw("date::text LIKE ?", `%-%-${day.getDate()}%`)
        .select(
            "id",
            "user_id",
            "loan",
            "peniya",
            "every_month",
            db.raw("EXTRACT(MONTH FROM date) AS month")
        );
    console.log(users);
    users.forEach(async (user) => {
        const { user_id, id, month, every_month, loan, peniya } = user;

        const tolangani = await db("payments")
            .where({ user_id })
            .select("paid");

        if (sum(tolangani) - (day.getMonth() + 1 - month) * every_month < 0) {
            const newpeniya = loan * 0.04 + peniya;
            await db("contracts")
                .where({ id })
                .update({ qarzdorlik: true, peniya: newpeniya });
            await db
                .insert({ user_id, peniya: loan * 0.04, date: day })
                .into("payments");
        }
    });
}

async function cron2(today: Date) {
    const users = await db("contracts")
        .whereRaw("date::text LIKE ?", `%-%-${today.getDate()}%`)
        .select(
            "id",
            "user_id",
            "loan",
            "peniya",
            "every_month",
            db.raw("EXTRACT(MONTH FROM date) AS month")
        );
    console.log(users);
    users.forEach(async (user) => {
        const { user_id, id, month, every_month, loan, peniya } = user;

        const tolangani = await db("payments")
            .where({ user_id })
            .select("paid");

        if (sum(tolangani) - (today.getMonth() + 1 - month) * every_month < 0) {
            console.log(
                `${today.toISOString}  kuni kredit muddati tugaydu kreditni qoplang`
            );
        }
    });
}

// testCron()
// const today = new Date()
// cron2(today)
var cron = require("node-cron");

cron.schedule("1 0 0 * * *", () => {
    const day = new Date();
});
export default app;
