import { Router } from "express";
import { db } from "../db/db";

const app = Router();

interface Stats {
    date: string;
    value: number;
    category: "prixod" | "rasxod";
}

app.get("/", async (req, res) => {
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
});

app.get("/count", async (req, res) => {
    const month = req.query.month ? req.query.month : "%";
    const count = await db("customers")
        .select(db.raw("TO_CHAR(date, 'YYYY-MM') AS for_date"))
        .whereRaw("date::text LIKE ?", `%-${month}-%`)
        .count("* as users")
        .groupByRaw("TO_CHAR(date, 'YYYY-MM')");
    res.send(count);
});
app.get("/restaurants", async (req, res) => {
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
});
app.get("/all", async (req, res) => {
    let cent: {
        active_users?: number;
        ended_users?: number;
        total_rasxod?: number;
        total_prixod?: number;
        restaurants?: number;
    } = {};
    const rasxoddata: any = await db("customers").sum("total_sum").first();
    const prixoddata: any = await db("customers")
        .sum(
            db.raw(
                "(total_sum-first_payment)*(procent*months+100)/100-remaind_sum + first_payment"
            )
        )
        .first();

    const rest: any = await db("restaurants").count().first();
    const usr: any = await db("customers").count().first();
    const usrend: any = await db("customers")
        .count()
        .where("status", "ended")
        .first();
    cent.total_rasxod = rasxoddata.sum;
    cent.total_prixod = prixoddata.sum;
    console.log(rest);
    cent.active_users = usr.count - usrend.count;
    cent.ended_users = usrend.count;
    cent.restaurants = rest.count;
    res.send(cent);
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
