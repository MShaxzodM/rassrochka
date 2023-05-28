var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    first_name: "Shaxzod",
    last_name: "Masharipov",
    phone: "22222555234",
    total_sum: 60000000,
    first_payment: 5000000,
    months: 6,
    date: "2023-05-24T07:00:00.000Z",
    restaurant_id: 1,
    procent: 4,
    fine_procent: 0.1,
    address: "beruniy",
    password_sk: "ksldk43",
    password_address: "32beeee",
    kepil1_first_name: "Hamdam",
    kepil1_last_name: "abdalov",
    kepil1_phone: "32224",
    kepil1_address: "mmmkkji",
    kepil1_password_sk: "2343",
    kepil1_password_address: "beruniy",
    kepil2_first_name: "Ibrat",
    kepil2_last_name: "abdalov",
    kepil2_phone: "21343222233",
    kepil2_address: "sdhc",
    kepil2_password_sk: "32523",
    kepil2_password_address: "beruniy",
});

var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
};

fetch("http://localhost:3000/post", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
