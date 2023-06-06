import multer from "multer";
import { db } from "../db/db";
import { Router } from "express";
import { json, urlencoded } from "body-parser";
import multerS3 from "multer-s3";
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { uploadFile, deleteFile, getObjectSignedUrl } from "../aws/s3";
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
const bucketName = "rassrochka";
const region = "eu-north-1";
const accessKeyId = "AKIAZHDDHTPPSBJSCOW7";
const secretAccessKey = "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";
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
        key: function (req, file, cb) {
            const extension = file.originalname.split(".").pop();
            cb(null, Date.now().toString() + "." + extension);
        },
    }),
});
// const generateFileName = (bytes = 32) =>
//     crypto.randomBytes(bytes).toString("hex");
imgRouter.post(
    "/",
    upload.fields([{ name: "file" }, { name: "pcopy" }, { name: "images" }]),
    async (req: any, res: any) => {
        // await uploadFile(
        //     fileBuffer,
        //     "istockphoto-1322277517-612x612.jpg",
        //     file.mimetype
        // );
        await postUser(req, res);
        const user_id = req.params.user_id;
        array.map((el: any) => {
            if (el == "images") {
                req.files.images.map((namei: any) => {
                    const { location, key, fieldname } = namei;
                    db.insert({
                        user_id,
                        name: fieldname,
                        filename: key,
                        path: location,
                    })
                        .into("images")
                        .catch((err) => {
                            console.log(err);
                        });
                });
            } else {
                const { location, key, fieldname } = req.files[el][0];
                db.insert({
                    user_id,
                    name: fieldname,
                    filename: key,
                    path: location,
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
    req.body.remaind_sum = req.body.total_sum - req.body.first_payment;
    req.body.remaind_sum =
        req.body.remaind_sum +
        ((req.body.remaind_sum * req.body.procent) / 100) * req.body.months;
    req.body.fine = 0;
    if (req.body) {
        const data = await db
            .insert(req.body)
            .into("customers")
            .returning("id")
            .catch((err) => res.send("error"));

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

            await db
                .insert(dataset)
                .into("pay_table")
                .catch((err) => res.send("postgres error"));
        }
        return true;
    } else {
        res.send("Maydonlar to'liq to'ldirilmagan");
    }
}
export default imgRouter;

// kiritish paytida status = success, har oy 5 kuni error beradi ya'ni  qarzdrlik bolsa.
// tugagan paytda Ended boladi
