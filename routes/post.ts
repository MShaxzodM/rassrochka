import { Router } from "express";
import { db } from "../db/db";
import { json } from "body-parser";
import { Auth } from "../auth";
import imgRouter from "./postimages";
import cors from "cors";
const app = Router();

// app.use(cors());
// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//     res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     next();
// });
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
    console.log(userData);
    const remaind_sum = userData[0].remaind_sum - data.payment;
    await db("customers")
        .update({ remaind_sum: remaind_sum })
        .where("id", req.params.user_id);
    const pay_table = await db("pay_table").where("user_id", user_id);
    pay_table.map(async (table) => {
        const { id, remaind } = table;
        if (remaind_sum <= remaind) {
            await db("pay_table").update({ status: true }).where("id", id);
            await db("customers")
                .update({ status: "succes" })
                .where("id", user_id);
        } else return true;
    });
    await db.insert(data).into("payments");

    res.sendStatus(200);
});

app.post("/restaurants", async (req, res) => {
    await db.insert(req.body).into("restaurants");
    res.sendStatus(200);
});

export default app;
// bu 2023-06-08 2023-06-05
