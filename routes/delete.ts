import { Router } from "express";
import { db } from "../db/db";
import { deleteFile } from "../aws/s3";
const del = Router();

del.delete("/:id", async (req, res) => {
    const id = req.params.id;

    const images = await db("images").select("filename").where("user_id", id);
    images.map(async (image) => {
        await deleteFile(image.filename);
    });
    await db("payments").where("user_id", id).del();
    await db("pay_table").where("user_id", id).del();
    await db("images").where("user_id", id).del();
    await db("customers").where("id", id).del();
    res.send("Object deleted successfully");
});

export default del;
