import { Router } from "express";
import { db } from "../db/db";
import { json } from "body-parser";
const app = Router();
app.use(json());
import { avoidTMZ } from "./getStatistics";
import { getObjectSignedUrl } from "../aws/s3";
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

app.patch("/:user_id/archive", async (req, res) => {
    try {
        await db("customers")
            .update({ status: "ended", remaind_sum: 0 })
            .where("id", req.params.user_id);
        res.send("Updated successfully");
    } catch {
        res.sendStatus(500);
    }
});

function sum(arr: Array<Arr>) {
    let sum = 0; // initialize sum
    for (let i = 0; i < arr.length; i++) sum += arr[i].paid;

    return sum;
}
app.get("/", async (req, res) => {
    try {
        const search: any = req.query.search ? req.query.search : "%";
        let status: any = req.query.status
            ? [req.query.status, ""]
            : ["success", "error"];
        const archive: any = req.query.archive ? "ended" : "%";
        status = req.query.archive ? ["32", "43"] : status;
        let users: any;
        const offset: any = req.query.page ? req.query.page : 1;
        const limit: any = req.query.take ? req.query.take : 10;

        users = (await db("customers")
            .select(
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
            )
            .where(function () {
                this.where("status", archive)
                    .orWhere("status", status[0])
                    .orWhere("status", status[1]);
            })
            .andWhere(function () {
                this.whereRaw(
                    "lower(first_name) LIKE ?",
                    `${search.toLowerCase()}%`
                )
                    .orWhereRaw(
                        "lower(last_name) LIKE ?",
                        `${search.toLowerCase()}%`
                    )
                    .orWhereLike("phone", `%${search}%`);
            })
            .limit(limit)
            .offset((offset - 1) * limit)
            .orderBy("date")
            .catch((err) =>
                res.send("Clientlar bazasida xatolik")
            )) as Array<Data>;

        await users.map((user: any) => {
            user.date = avoidTMZ(user.date);
        });
        interface Users {
            count: string | number;
            users: any;
        }

        let Users: Users = { count: 0, users };
        const counter = await db("customers")
            .where(function () {
                this.where("status", archive)
                    .orWhere("status", status[0])
                    .orWhere("status", status[1]);
            })
            .andWhere(function () {
                this.whereRaw(
                    "lower(first_name) LIKE ?",
                    `${search.toLowerCase()}%`
                )
                    .orWhereRaw(
                        "lower(last_name) LIKE ?",
                        `${search.toLowerCase()}%`
                    )
                    .orWhereLike("phone", `%${search}%`);
            })
            .count();
        Users.count = counter[0].count;

        res.send(Users);
    } catch {
        res.sendStatus(404);
    }
});
// Bu asosiy menyudagi barcha foydalanuvchilarni ro'yhat shaklida olib beradi

app.get("/:user_id", async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const userData = await db("customers").where("id", user_id);
        if (userData.length > 0) {
            const id = userData[0] ? userData[0].restaurant_id : false;
            const restaurant = await db
                .select("name")
                .from("restaurants")
                .where({ id })
                .orderBy("date");
            userData[0]["restaurant"] = restaurant[0].name;
            userData[0]["payments"] = await db("payments")
                .where({ user_id })
                .orderBy("date")
                .catch((er) =>
                    res.send(
                        "Malumotlar bazasida xatolik, kiritilgan malumotlarni tekshiring"
                    )
                );
            if (userData[0].payments[0]) {
                userData[0].payments.map((t: any) => {
                    t.date = avoidTMZ(t.date);
                });
            }
            userData[0]["fines"] = await db("fines")
                .where({ user_id })
                .orderBy("date")
                .catch((er) =>
                    res.send(
                        "Malumotlar bazasida xatolik, kiritilgan malumotlarni tekshiring"
                    )
                );
            if (userData[0].fines[0]) {
                userData[0].fines.map((t: any) => {
                    t.date = avoidTMZ(t.date);
                });
            }

            userData[0]["pay_table"] = await db("pay_table")
                .where("user_id", req.params.user_id)
                .orderBy("paydate")
                .catch((err) => res.send("pay_table bazasida xatolik"));
            userData[0].pay_table.map((t: any) => {
                t.paydate = avoidTMZ(t.paydate);
            });
            userData[0].date = avoidTMZ(userData[0].date);
            res.send(userData[0]);
        } else {
            res.status(404).send("There is no user with this id");
        }
    } catch {
        res.sendStatus(404);
    }
});
app.get("/:user_id/images", (req, res) => {
    const user_id: any = req.params.user_id;
    db.select("filename")
        .from("images")
        .where({ user_id, name: "images" })
        .then(async (images) => {
            if (images[0]) {
                for (let image of images) {
                    image.imageUrl = await getObjectSignedUrl(image.filename);
                }
                res.send(images);
            }

            return Promise.reject(new Error("Image does not exist"));
        })
        .catch((err) => res.status(404));
});
app.get("/:user_id/:name", async (req, res) => {
    const user_id: any = req.params.user_id;
    const name = req.params.name;
    const file = await db
        .select("filename")
        .from("images")
        .where({ user_id, name })
        .first()
        .catch((err) => res.status(404));
    if (file) {
        const url: any = await getObjectSignedUrl(file.filename);
        const data = { url: url };
        res.send(data);
    }
    res.status(404);
});

export default app;
