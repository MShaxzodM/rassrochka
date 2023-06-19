import bodyParser from "body-parser";
import cron from "node-cron";
import { Auth } from "./auth";
import express from "express";
import POST from "./routes/post";
import GET from "./routes/get";
import cors from "cors";
import { db } from "./db/db";
import DEL from "./routes/delete";
import {
    fineCalculator,
    warnUsers,
    checkUserStatus,
} from "./cron/cron-Calculator";
const app = express();
app.use(cors({ origin: "*" }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Replace with the actual origin you want to allow
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get("/favicon.ico", (req, res) => {
    res.send("favicon");
});
import getStatistics from "./routes/getStatistics";
app.use("/statistics", Auth, getStatistics);
// app.use("/uploads",Auth, express.static("uploads"));
app.use("/clients", GET);
app.use("/post", POST);
app.use("/del", DEL);
app.post("/auth", Auth, (req: any, res) => {
    res.send("Siz muvaffaqiyatli royhatdan otdingiz");
});
app.get("/restaurants", Auth, async (req, res) => {
    const resData = await db("restaurants");
    res.send(resData);
});
app.put("/sms", Auth, async (req, res) => {
    const warn: any = req.body.warn
        ? { warn: req.body.warn }
        : db("sms").select("warn").first();
    const error: any = req.body.err
        ? { error: req.body.err }
        : db("sms").select("err").first();
    await db("sms").update({ warn: warn.warn, error: error.error });
    res.send("updates smses success");
});

cron.schedule("1 0 9 2,3,4 * *", () => {
    warnUsers();
});
cron.schedule("1 0 0 5 * *", () => {
    checkUserStatus();
});

cron.schedule("1 0 0 * * *", () => {
    fineCalculator();
});
app.listen(3000, () => console.log("app running on port 3000"));
