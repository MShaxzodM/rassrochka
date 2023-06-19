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
        .where("status", "error")
        .orWhere("status", "success")
        .select("id", "total_sum", "fine", "fine_procent", "phone");
    const msg = await db("sms").select("warn").first();
    const sms1 = msg.warn.split(":");
    const thi = new Date();
    msg.warn = sms1[0] + thi.getFullYear() + thi.getMonth + "05" + sms1[1];
    users.forEach(async (user) => {
        let { id, phone } = user;
        phone.includes("+998") ? phone.substring(1) : phone;
        await sendSms(msg.warn, phone);
        await db("sms_table").insert({
            user_id: id,
            msg: msg.warn,
            date: new Date(),
        });
    });
}

async function fineCalculator() {
    try {
        const date = new Date();
        const day = date.getDay();
        if (day <= 20) {
            postTokenSms();

            const users = await db("customers")
                .where("status", "error")
                .select("id", "total_sum", "fine", "fine_procent", "phone");
            const thismonth = await db("pay_table")
                .select("summ")
                .where("date", `${date.getFullYear()}-${date.getMonth}-05}`)
                .first();
            users.forEach(async (user) => {
                let { id, total_sum, fine, fine_procent, phone } = user;
                const { summ } = thismonth;
                const msg = await db("sms").select("error").first();
                fine = fine + (summ * fine_procent) / 100;
                db("customers").where(id).update(fine);
                db("fines").insert({
                    user_id: id,
                    fine: (summ * fine_procent) / 100,
                    date,
                });
                msg.error =
                    msg.error +
                    `.Sizga ${
                        (summ * fine_procent) / 100
                    } sum miqdorda peniya qo'shildi`;
                phone.includes("+998") ? phone.substring(1) : phone;
                await sendSms(msg.error, phone);
                await db("sms_table").insert({
                    user_id: id,
                    msg: msg.error,
                    date: new Date(),
                });
            });
        }
    } catch {}
}
export { fineCalculator, warnUsers, checkUserStatus };
