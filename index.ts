import bodyParser from "body-parser";
import { Auth } from "./auth";
import express from "express";
import POST from "./routes/post";
import GET from "./routes/get";
import cors from "cors";
import { db } from "./db/db";
const app = express();
// app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/clients", GET);
app.use("/post", POST);
app.post("/auth", Auth, (req: any, res) => {
    res.send("Siz muvaffaqiyatli royhatdan otdingiz");
});
app.get("/restaurants", async (req, res) => {
    const resData = await db("restaurants");
    res.send(resData);
});

app.listen(3000, () => console.log("app running on port 3000"));
