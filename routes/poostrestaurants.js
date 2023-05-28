var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    name: "Sultan Saray",
});

var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
};

fetch("http://localhost:3000/post/restaurants", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
