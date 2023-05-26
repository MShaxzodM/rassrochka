import multer from "multer";
import { db } from "../db/db";
import { Router } from "express";
const imgRouter = Router();

const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        // Specify the directory where you want to store the uploaded files
        cb(null, "uploads/");
    },
    filename: (req: any, file: any, cb: any) => {
        // Generate a custom filename based on your requirements
        const originalname = file.originalname;
        const extension = originalname.substring(originalname.lastIndexOf("."));
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = uniqueSuffix + extension;
        cb(null, filename);
    },
});

const array = ["pcopy", "file", "images"];
const upload = multer({ storage: storage });
interface pay_table {
    paydate: string;
    user_id: number;
    summ: number;
    remaind: number;
    status: boolean;
}

imgRouter.post(
    "/",
    upload.fields([{ name: "file" }, { name: "pcopy" }, { name: "images" }]),
    async (req: any, res: any) => {
        await postUser(req, res);
        const user_id = req.params.user_id;
        array.map((el: any) => {
            if (el == "images") {
                req.files.images.map((namei: any) => {
                    const { path, filename, fieldname } = namei;
                    db.insert({
                        user_id,
                        name: fieldname,
                        filename,
                        path,
                    })
                        .into("images")
                        .catch((err) => {
                            console.log(err);
                        });
                });
            } else {
                const { path, filename, fieldname } = req.files[el][0];
                db.insert({
                    user_id,
                    name: fieldname,
                    filename,
                    path,
                })
                    .into("images")
                    .catch((err) => {
                        console.log(err);
                    });
            }
        });

        res.sendStatus(200);
    }
);

async function postUser(req: any, res: any) {
    const date = new Date();
    req.body.remaind_sum = req.body.total_sum - req.body.first_payment;
    req.body.remaind_sum =
        req.body.remaind_sum +
        ((req.body.remaind_sum * req.body.procent) / 100) * req.body.months;
    req.body.fine = 0;
    if (req.body) {
        const data = await db
            .insert(req.body)
            .into("customers")
            .returning("id");
        req.params.user_id = data[0].id * 1;
        const { months, procent, total_sum, remaind_sum } = req.body;
        for (let i: number = 1; i <= months; i++) {
            const datemonth = date.getMonth() + 1;
            const paydate = `${date.getFullYear()}-${datemonth + i}-05`;
            const dataset: pay_table = {
                paydate,
                user_id: req.params.user_id,
                summ: 0,
                remaind: 0,
                status: false,
            };
            dataset.summ = Math.ceil(remaind_sum / months / 1000) * 1000;
            dataset.remaind = dataset.summ * months - dataset.summ * i;
            if (dataset.remaind >= remaind_sum) {
                dataset.status = true;
            }

            await db.insert(dataset).into("pay_table");
        }
        return true;
    } else {
        res.send("Maydonlar to'liq to'ldirilmagan");
    }
}
export default imgRouter;
