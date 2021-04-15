var logoutButton = document.querySelector("#logout-button");
var loginButton = document.querySelector("#login-button");

var userInfo = document.querySelector("#user-info");

$(document).ready(() => {
    var cookie = document.cookie;
    if (!localStorage.getItem('country')) {
        localStorage.setItem('country', 'India');
    }
    if (cookie === '') {
        logoutButton.setAttribute('hidden', 'true');
        userInfo.setAttribute('hidden', 'true');
        loginButton.removeAttribute('hidden');
    } else {
        loginButton.setAttribute('hidden', 'true');
        logoutButton.removeAttribute('hidden');
        userInfo.removeAttribute('hidden');
    }
});

$('#select-country').change(function(){
    var country = $(this).val();
    localStorage.setItem('country', country);
})

logoutButton.addEventListener('click', async (event) => {
    event.preventDefault();
    var baseURL = "http://localhost.org:3000/" + localStorage.getItem('country') + '/logout';
    const response = await fetch(baseURL, {
        method: "GET",
        credentials: "include"
    });
    const json = await response.json();
    if (response.status === 200) {
        document.cookie = 'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.reload();
    } else {
        console.log("Error while calling logout");
    }
});