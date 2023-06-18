import { Router } from "express";
import { db } from "../db/db";
import { json } from "body-parser";
import { Auth } from "../auth";
import imgRouter from "./postimages";
import cors from "cors";
const app = Router();

app.use("/", imgRouter);
app.use(json());
interface Payments {
    user_id: number | string;
    payment: number;
    date: string;
    type: "cash" | "card";
}

app.post("/:user_id/payment", async (req, res) => {
    let data: Payments = req.body;
    const user_id = req.params.user_id;
    data.user_id = req.params.user_id;
    const userData = await db
        .select("remaind_sum")
        .from("customers")
        .where("id", user_id);
    const remaind_sum = userData[0].remaind_sum - data.payment;
    await db("customers")
        .update({ remaind_sum: remaind_sum })
        .where("id", req.params.user_id);
    const pay_table = await db("pay_table").where("user_id", user_id);
    pay_table.map(async (table) => {
        const { id, remaind } = table;
        if (remaind_sum <= remaind) {
            await db("pay_table")
                .update({ status: true, remaind: remaind_sum })
                .where("id", id);
            await db("customers")
                .update({ status: "success" })
                .where("id", user_id);
        } else return true;
    });

    const common = await db("pay_table")
        .select("id", "remaind", "summ")
        .where({ status: false, user_id: user_id })
        .orderBy("id")
        .first();
    console.log(common);
    const { id, remaind } = common;
    console.log(remaind_sum - remaind);
    await db("pay_table")
        .update({
            summ: remaind_sum - remaind,
        })
        .where("id", id);
    await db.insert(data).into("payments");

    res.sendStatus(200);
});

app.post("/restaurants", async (req, res) => {
    await db.insert(req.body).into("restaurants");
    res.sendStatus(200);
});

export default app;
// bu 2023-06-08 2023-06-05
