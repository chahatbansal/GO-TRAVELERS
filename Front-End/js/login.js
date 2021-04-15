var loginForm = document.querySelector("#login-form");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    var username = loginForm.elements['username'].value;
    var password = loginForm.elements['password'].value;

    var baseURL = "http://localhost.org:3000/" + localStorage.getItem('country') + "/login";

    const response = await fetch(baseURL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username, password})
    });
    const json = await response.json();
    if (response.status === 200) {
        window.location.href = "/index.html";
    } else {
        console.log("Incorrect username or password");
    }
})