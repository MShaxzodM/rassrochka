import axios from "axios";
import FormData from "form-data";
import { db } from "../../db/db";
const data = new FormData();
data.append("email", "lexoice1997@gmail.com");
data.append("password", "n0Z16f52wQy4GDobcR6rHcXjpoTNjYOOKpLHDD3T");
async function postTokenSms() {
    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://notify.eskiz.uz/api/auth/login",
        headers: {
            ...data.getHeaders(),
        },
        data: data,
    };

    axios
        .request(config)
        .then(async (response) => {
            const token = response.data.data.token;
            await db("sms").update({ token });
        })
        .catch((error) => {
            console.log(error);
        });
}

async function getUsers() {
    const token = await db("sms").select("token").first();
    let balance = "";
    let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://notify.eskiz.uz/api/auth/user",
        headers: {
            Authorization: `Bearer ${token.token}`,
        },
    };

    await axios
        .request(config)
        .then((response) => {
            balance = response.data.balance;
        })
        .catch((error) => {
            console.log(error);
        });
    return balance;
}
async function sendSms(msg: string, phone: string) {
    const token = await db("sms").select("token").first();
    const FormData = require("form-data");
    let data = new FormData();
    data.append("mobile_phone", phone);
    data.append("message", msg);
    data.append("from", "4546");
    data.append("callback_url", "http://0000.uz/test.php");

    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://notify.eskiz.uz/api/message/sms/send",
        headers: {
            Authorization: `Bearer ${token.token}`,
            ...data.getHeaders(),
        },
        data: data,
    };

    axios
        .request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
}
export { postTokenSms, getUsers, sendSms };
