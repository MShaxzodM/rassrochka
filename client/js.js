var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    first_name: "user3",
    last_name: "3lastname",
    phone: "123456",
    total_sum: 40000000,
    first_payment: 5000000,
    months: 4,
    date: "2023-06-03",
    restaurant_id: 1,
    procent: 4,
    fine_procent: 0.1,
    address: "beruniy",
    password_sk: "ksldk43",
    password_address: "32beeee",
    kepil1_first_name: "kepil1",
    kepil1_last_name: "kepil1_lastname",
    kepil1_phone: "32224",
    kepil1_address: "mmmkkji",
    kepil1_password_sk: "2343",
    kepil1_password_address: "beruniy",
    kepil2_first_name: "kwpil2",
    kepil2_last_name: "kepil2_lastname",
    kepil2_phone: "21343222233",
    kepil2_address: "sdhc",
    kepil2_password_sk: "32523",
    kepil2_password_address: "beruniy",
    work: "itpark",
    card_number: "2190843789",
    card_date: "23/6",
    kepil1_work: "from home",
    kepil2_work: "data",
});

var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
};

fetch("http://95.130.227.89:3000/post", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
