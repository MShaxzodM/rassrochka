import multer from "multer";
import { db } from "../db/db";
import { Router } from "express";
const imgRouter = Router();
const itsaLilArray = ["file", "pcopy", "kepil1_pcopy", "kepil2_pcopy"];

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

const array = ["pcopy", "file", "kepil1_pcopy", "kepil2_pcopy"];
const upload = multer({ storage: storage });
imgRouter.post(
    "/",
    upload.fields([
        { name: "file" },
        { name: "pcopy" },
        { name: "kepil1_pcopy" },
        { name: "kepil2_pcopy" },
    ]),
    async (req: any, res: any) => {
        await postUser(req, res);
        const user_id = req.params.user_id;
        array.map((el) => {
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
        });

        res.sendStatus(200);
    }
);

async function postUser(req: any, res: any) {
    const date = new Date();
    req.body.remaind_sum =
        (req.body.total_sum * (100 + req.body.procent)) / 100 -
        req.body.first_payment;
    req.body.fine = 0;
    if (req.body) {
        const data = await db
            .insert(req.body)
            .into("customers")
            .returning("id");
        req.params.user_id = data[0].id * 1;
    } else {
        res.send("Maydonlar to'liq to'ldirilmagan");
    }
}
export default imgRouter;
