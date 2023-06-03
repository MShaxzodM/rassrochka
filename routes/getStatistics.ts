import { Router } from "express";
import { db } from "../db/db";

const app = Router();

interface Stats {
    date: string;
    value: number;
    category: "prixod" | "rasxod";
}

app.get("/", async (req, res) => {
    const rasxoddata = (await db("customers")
        .select(db.raw("SUM(total_sum) AS value"), "date")
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
    const count = await db("customers")
        .select(db.raw("TO_CHAR(date, 'YYYY-MM') AS for_date"))
        .count("* as users")
        .groupByRaw("TO_CHAR(date, 'YYYY-MM')");
    res.send(count);
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
