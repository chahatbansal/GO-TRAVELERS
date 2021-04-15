var registerForm = document.querySelector("#register-form");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    var username = registerForm.elements['username'].value;
    var password = registerForm.elements['password'].value;
    var email = registerForm.elements['email'].value;
    var role = 'customer';

    var baseURL = "http://localhost:3000/" + localStorage.getItem('country') + "/signup";

    const response = await fetch(baseURL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({email,username, password, role})
    });
    const json = await response.json();
    if (response.status === 200) {
        window.location.href = "/login.html";
    } else {
        console.log("Incorrect username or password");
    }
})