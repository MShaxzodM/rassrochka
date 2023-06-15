import multer from "multer";
import { db } from "../db/db";
import { Router } from "express";
import { json, urlencoded } from "body-parser";
import multerS3 from "multer-s3";
import { config } from "dotenv";
config();
import { S3Client } from "@aws-sdk/client-s3";
import { deleteFile } from "../aws/s3";
const imgRouter = Router();
imgRouter.use(json());
imgRouter.use(urlencoded({ extended: true }));

const array = ["pcopy", "file", "images"];
interface pay_table {
    paydate: string;
    user_id: number;
    summ: number;
    remaind: number;
    status: boolean;
}
const region = "eu-north-1";
const accessKeyId = process.env.ACCESS_KEY_ID as string;
const secretAccessKey = process.env.SECRET_KEY as string;
const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "rassrochka",
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req: any, file, cb) {
            const extension = file.originalname.split(".").pop();
            cb(
                null,
                req.body.first_name +
                    "-" +
                    req.body.last_name +
                    "-" +
                    file.fieldname +
                    "-" +
                    Date.now().toString() +
                    "." +
                    extension
            );
        },
    }),
});
imgRouter.post(
    "/",
    // upload.fields([{ name: "file" }, { name: "pcopy" }, { name: "images" }]),
    async (req: any, res: any) => {
        try {
            await postUser(req, res);
            // const user_id = req.params.user_id;
            // array.map((el: any) => {
            //     if (el == "images") {
            //         req.files.images.map((namei: any) => {
            //             const { location, key, fieldname } = namei;
            //             db.insert({
            //                 user_id,
            //                 name: fieldname,
            //                 filename: key,
            //                 path: location,
            //             })
            //                 .into("images")
            //                 .catch(() => {
            //                     return false;
            //                 });
            //         });
            //     } else {
            //         const { location, key, fieldname } = req.files[el][0];
            //         db.insert({
            //             user_id,
            //             name: fieldname,
            //             filename: key,
            //             path: location,
            //         })
            //             .into("images")
            //             .catch((err) => {
            //                 return false;
            //             });
            //     }
            // });

            res.sendStatus(200);
        } catch {
            // array.map(async (el: any) => {
            //     try {
            //         if (el == "images") {
            //             req.files.images.map((namei: any) => {
            //                 const { key } = namei;
            //                 deleteFile(key);
            //             });
            //         } else if (el == "pcopy" || "file") {
            //             const { key } = req.files[el][0];
            //             deleteFile(key);
            //         }
            //     } catch {
            //         return false;
            //     }
            // });
            res.sendStatus(400);
        }
    }
);
async function postUser(req: any, res: any) {
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
        const { months, remaind_sum } = req.body;
        for (let i: number = 1; i <= months; i++) {
            const date = new Date(req.body.date);
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
    }
}
export default imgRouter;
