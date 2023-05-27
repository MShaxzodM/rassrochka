import bodyParser from "body-parser";
import { Auth } from "./auth";
import express from "express";
import POST from "./routes/post";
import GET from "./routes/get";
import cors from "cors";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/", GET);
app.use("/post", POST);
app.post("/auth", Auth, (req: any, res) => {
    res.send("Siz muvaffaqiyatli royhatdan otdingiz");
});

app.listen(3000, () => console.log("app running on port 3000"));
