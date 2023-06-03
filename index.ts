import bodyParser from "body-parser";
import { Auth } from "./auth";
import express from "express";
import POST from "./routes/post";
import GET from "./routes/get";
import cors from "cors";
import { db } from "./db/db";
import { postTokenSms, getUsers, sendSms } from "./cron/sms/auth";
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
app.use("/statistics", getStatistics);
app.use("/uploads", express.static("uploads"));
app.use("/clients", GET);
app.use("/post", POST);
app.post("/auth", Auth, (req: any, res) => {
    res.send("Siz muvaffaqiyatli royhatdan otdingiz");
});
app.get("/restaurants", async (req, res) => {
    const resData = await db("restaurants");
    res.send(resData);
});
// sendSms();
// getUsers();
// postTokenSms();
app.listen(3000, () => console.log("app running on port 3000"));
