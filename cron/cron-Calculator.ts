import cron from "node-cron";
import { db } from "../db/db";
import { postTokenSms, sendSms } from "./sms/auth";
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

async function checkUserStatus() {
    const day = new Date();
    const users = await db("pay_table")
        .whereRaw("paydate::text LIKE ?", `%-${day.getMonth()}-%`)
        .andWhere("status", false)
        .select("user_id");
    users.forEach(async (user) => {
        const { user_id } = user;
        await db("customers").where({ user_id }).update("status", "error");
    });
}

async function warnUsers() {
    postTokenSms();
    const users = await db("customers")
        .where("status", "error" || "success")
        .select("id", "total_sum", "fine", "fine_procent", "phone");
    const msg = await db("sms").select("warn").first();
    users.forEach(async (user) => {
        let { id, phone } = user;
        await sendSms(msg.warn, phone);
        await db("sms_table").insert({ user_id: id, msg: msg.warn });
    });
}

async function fineCalculator() {
    postTokenSms();
    const users = await db("customers")
        .where("status", "error")
        .select("id", "total_sum", "fine", "fine_procent", "phone");
    users.forEach(async (user) => {
        let { id, total_sum, fine, fine_procent, phone } = user;
        const msg = await db("sms").select("error").first();
        await sendSms(msg.error, phone);
        await db("sms_table").insert({ user_id: id, msg: msg.error });
        fine = fine + (total_sum * fine_procent) / 100;
        console.log(typeof fine);
        db("customers").where(id).update(fine);
    });
}

cron.schedule("1 0 0 * * *", () => {
    const day = new Date();
});
