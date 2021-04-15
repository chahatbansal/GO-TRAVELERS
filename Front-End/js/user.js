var userPage = document.querySelector("#user-info-page");
var loadingMessage = document.querySelector("#loading-message");
var username = document.querySelector("#username");
var userEmail = document.querySelector("#user-email");
var userHeading = document.querySelector("#user-heading");

function populateBookings(bookings) {
    var flightTable = document.querySelector("#user-booking-placeholder");
    var innerHtml = '';
    bookings.forEach(booking => {
        const flight = booking.flight;
        innerHtml+= `
        <tr>
            <th scope="row">${flight.flightId}</th>
            <td>${flight.departure_airport} - ${new Date(flight.departure).toLocaleString()}</td>
            <td>${flight.arrival_airport} - ${new Date(flight.arrival).toLocaleString()}</td>
            <td>${(booking.person).length}</td>
        </tr>`
    });
    flightTable.innerHTML = innerHtml;
}


$(document).ready(() => {
    var baseURL = "http://localhost.org:3000/" + localStorage.getItem('country') + "/userDetails";

    fetch(baseURL,{
        credentials: "include",
    })
    .then(response => {
        if (response.status === 200) {
            return response.json();
        }
        throw new Error(response.text());
    })
    .then(data => {
        const user = data.user;
        username.textContent = user.username;
        userHeading.textContent = user.username;
        userEmail.textContent = user.email;
        populateBookings(data.bookings);
        loadingMessage.setAttribute('hidden', 'true');
        userPage.removeAttribute('hidden');
    })
    .catch(error => {
        console.log(error);
        document.cookie = 'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = "/login.html";
    });
});