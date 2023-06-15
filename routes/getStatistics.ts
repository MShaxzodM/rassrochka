import { Router } from "express";
import { db } from "../db/db";
const app = Router();

interface Stats {
    date: string;
    value: number;
    category: "prixod" | "rasxod";
}

app.get("/", async (req, res) => {
    try {
        const month = req.query.month ? req.query.month : "%";
        const rasxoddata = (await db("customers")
            .select(db.raw("SUM(total_sum) AS value"), "date")
            .whereRaw("date::text LIKE ?", `%-${month}-%`)
            .groupBy("date")
            .orderBy("date")) as Array<Stats>;
        rasxoddata.map((data) => {
            data["category"] = "rasxod";
        });

        const prixoddata = (await db("customers")
            .select(
                db.raw(
                    "SUM((total_sum-first_payment)*(procent*months+100)/100-remaind_sum + first_payment) AS value"
                ),
                "date"
            )
            .whereRaw("date::text LIKE ?", `%-${month}-%`)
            .groupBy("date")
            .orderBy("date")) as Array<Stats>;
        prixoddata.map((data) => {
            data["category"] = "prixod";
        });
        const stats = rasxoddata.flatMap((value, index) => [
            value,
            prixoddata[index],
        ]);
        stats.map((stat) => {
            stat.date = avoidTMZ(stat.date);
        });

        res.send(stats);
    } catch {
        res.send(404);
    }
});

app.get("/count", async (req, res) => {
    try {
        const month = req.query.month ? req.query.month : "%";
        const count = await db("customers")
            .select(db.raw("TO_CHAR(date, 'YYYY-MM') AS for_date"))
            .whereRaw("date::text LIKE ?", `%-${month}-%`)
            .count("* as users")
            .groupByRaw("TO_CHAR(date, 'YYYY-MM')");
        res.send(count);
    } catch {
        res.sendStatus(404);
    }
});
app.get("/restaurants", async (req, res) => {
    try {
        const month = req.query.month ? req.query.month : "%";
        const rest: any = await db("restaurants");
        const data = await Promise.all(
            rest.map(async (restaurant: any) => {
                const { id, name } = restaurant;
                const data: any = { restaurant: name, users: 0 };
                const count = await db("customers")
                    .select(db.raw("TO_CHAR(date, 'YYYY-MM') AS for_date"))
                    .where("restaurant_id", id)
                    .andWhereRaw("date::text LIKE ?", `%-${month}-%`)
                    .count("* as users")
                    .groupByRaw("TO_CHAR(date, 'YYYY-MM')");
                count.map((count) => {
                    data.date = count.for_date;
                    data.users = count.users;
                    return data;
                });
                return data;
            })
        );
        res.send(data);
    } catch {
        res.sendStatus(404);
    }
});
app.get("/all", async (req, res) => {
    try {
        const month = req.query.month ? req.query.month : "%";
        console.log(month);
        let cent: {
            active_users?: number;
            ended_users?: number;
            total_rasxod?: number;
            total_prixod?: number;
            restaurants?: number;
            sms?: number;
            month?: any;
        } = {};
        const rasxoddata: any = await db("customers")
            .whereRaw("date::text LIKE ?", `%-${month}-%`)
            .sum("total_sum")
            .first();

        const prixoddata: any = await db("customers")
            .whereRaw("date::text LIKE ?", `%-${month}-%`)
            .sum(
                db.raw(
                    "(total_sum-first_payment)*(procent*months+100)/100-remaind_sum + first_payment"
                )
            )
            .first();

        const rest: any = await db("restaurants").count().first();
        const usr: any = await db("customers")
            .whereRaw("date::text LIKE ?", `%-${month}-%`)
            .count()
            .first();
        const usrend: any = await db("customers")
            .whereRaw("date::text LIKE ?", `%-${month}-%`)
            .count()
            .where("status", "ended")
            .first();
        const sms: any = await db("sms_table")
            .whereRaw("date::text LIKE ?", `%-${month}-%`)
            .count()
            .first();
        cent.total_rasxod = rasxoddata.sum;
        cent.total_prixod = prixoddata.sum;
        cent.active_users = usr.count - usrend.count;
        cent.ended_users = usrend.count;
        cent.restaurants = rest.count;
        cent.sms = sms.count;
        cent.month = month;
        res.send(cent);
    } catch {
        res.sendStatus(404);
    }
});

app.get("/table", async (req, res) => {
    try {
        let data: any[] = [];
        for (let i = 1; i <= 12; i++) {
            const month = i < 10 ? `0${i}` : i;
            let cent: {
                active_users?: number;
                ended_users?: number;
                total_rasxod?: number;
                total_prixod?: number;
                restaurants?: number;
                sms?: number;
                month?: any;
            } = {};
            const rasxoddata: any = await db("customers")
                .whereRaw("date::text LIKE ?", `%-${month}-%`)
                .sum("total_sum")
                .first();

            const prixoddata: any = await db("customers")
                .whereRaw("date::text LIKE ?", `%-${month}-%`)
                .sum(
                    db.raw(
                        "(total_sum-first_payment)*(procent*months+100)/100-remaind_sum + first_payment"
                    )
                )
                .first();

            const rest: any = await db("restaurants").count().first();
            const usr: any = await db("customers")
                .whereRaw("date::text LIKE ?", `%-${month}-%`)
                .count()
                .first();
            const usrend: any = await db("customers")
                .whereRaw("date::text LIKE ?", `%-${month}-%`)
                .count()
                .where("status", "ended")
                .first();
            const sms: any = await db("sms_table")
                .whereRaw("date::text LIKE ?", `%-${month}-%`)
                .count()
                .first();
            cent.total_rasxod = rasxoddata.sum;
            cent.total_prixod = prixoddata.sum;
            cent.active_users = usr.count - usrend.count;
            cent.ended_users = usrend.count;
            cent.restaurants = rest.count;
            cent.sms = sms.count;
            cent.month = i;
            data = [...data, cent];
        }

        res.send(data);
    } catch {
        res.sendStatus(404);
    }
});

app.get("/sms", async (req, res) => {
    try {
        const limit: any = req.query.take ? req.query.take : 15;
        const offset: any = req.query.page ? req.query.page : 1;
        const search = req.query.month ? req.query.month : "%";
        const smsStat = await db("sms_table")
            .join("customers", "sms_table.user_id", "customers.id")
            .select(
                "customers.phone",
                "customers.first_name",
                "sms_table.user_id",
                "sms_table.msg",
                "sms_table.date"
            )
            .whereRaw("sms_table.date::text LIKE ?", `%-${search}-%`)
            .limit(limit)
            .offset((offset - 1) * limit);
        smsStat.map((stat) => {
            stat.date = avoidTMZ(stat.date);
        });
        interface Users {
            count: string | number;
            sms_table: any;
        }
        const counter: any = await db("sms_table").count().first();
        let response: Users = { count: counter.count, sms_table: smsStat };
        res.send(response);
    } catch {
        res.send("cant get statistics of sms messages because of server error");
    }
});

function avoidTMZ(data: any) {
    const date = new Date(data);
    const offset = date.getTimezoneOffset();
    date.setTime(date.getTime() - offset * 60 * 1000); // Adjust the date by subtracting the offset
    const formattedDate = date.toISOString().split("T")[0];
    return formattedDate;
}
export { avoidTMZ };
export default app;
