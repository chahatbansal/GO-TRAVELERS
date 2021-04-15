var flightSearchForm = document.querySelector("#flight-search");
var returnDatePicker = document.querySelector("#returnDatePicker");
var startFlights = [];
var returnFlights = [];
var numberOfPassengers = 0;
var selectedFlight;

$(document).ready(function(){
    $('input[type=radio]').click(function(){
        if (this.id == "roundtrip") {
            returnDatePicker.removeAttribute('hidden');
        } else if (this.id == "one-way") {
            returnDatePicker.setAttribute('hidden', 'true');
        }
    });
});

$('#myModal').on('show.bs.modal', function (event) {
    var heading = document.querySelector("#flight-id");
    heading.textContent = `Booking flight ${selectedFlight.flightId}: ${selectedFlight.source} - ${selectedFlight.destination}`;
    var extraPersonDetails = document.querySelector("#extra-person-placeholder");
    var innerHTML = '';
    for (var i = 0; i < numberOfPassengers ; i++) {
        innerHTML += `
        <div class="form-group">
            <label for="traveller-name-${i}" class="col-form-label">Traveller ${i+1} Full Name:</label>
            <input type="text" class="form-control" id="traveller-name-${i}" name="traveller-name-${i}" placeholder="Traveller ${i+1} Name">
        </div>
        <div class="form-group">
            <label for="traveller-phone-${i}" class="col-form-label">Traveller ${i+1} Phone Number:</label>
            <input class="form-control" id="traveller-phone-${i}" name="traveller-phone-${i}" placeholder="Traveller ${i+1} phone number"></input>
        </div>
           `
    }
    extraPersonDetails.innerHTML = innerHTML;
})

async function book() {
    var travellers = [];
    var form = document.querySelector("#booking-form");
    for (var i=0;i<numberOfPassengers;i++) {
        var name = form.elements['traveller-name-'+i].value;
        var phoneNo = form.elements['traveller-phone-'+i].value;
        travellers.push({
            name,
            phoneNo
        });
    }

    console.log(travellers);

    var baseURL = "http://localhost.org:3000/" + localStorage.getItem('country') + "/reserve/" + selectedFlight._id;
    const response = await fetch(baseURL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({persons: travellers})
    });
    const res = await response.text();
    if (response.status === 200) {
        $('#myModal').modal('hide');
        alert(res);
    } else {
        console.log(res);
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function bookflight(flightId, type) {
    var allFlights = type === 'startFlight' ? startFlights : returnFlights;
    selectedFlight = allFlights.find(x => x.flightId === flightId);
    $('#myModal').modal('show');
}

function showOneWayFlights(flights) {
    var flightTable = document.querySelector("#departure-flight-placeholder");
    var oneWayTable = document.querySelector("#one-way-flights");
    var innerHtml = '';
    flights.forEach(flight => {
        innerHtml+= `
        <tr>
            <th scope="row">${flight.flightId}</th>
            <td>${flight.departure_airport} - ${new Date(flight.departure).toLocaleString()}</td>
            <td>${flight.arrival_airport} - ${new Date(flight.arrival).toLocaleString()}</td>
            <td>${flight.stops === 0 ? 'Nonstop' : `${flight.stops} stops`}</td>
            <td><Button class="btn btn-primary" onclick=bookflight("${flight.flightId}","startFlight")>Book</Button></td>
        </tr>`
    });
    flightTable.innerHTML = innerHtml;
    oneWayTable.removeAttribute('hidden');
}

function showReturnFlights(flights) {
    var flightTable = document.querySelector("#returning-flight-placeholder");
    var returnTable = document.querySelector("#return-flights");
    var innerHtml = '';
    flights.forEach(flight => {
        innerHtml+= `
        <tr>
            <th scope="row">${flight.flightId}</th>
            <td>${flight.departure_airport} - ${new Date(flight.departure).toLocaleString()}</td>
            <td>${flight.arrival_airport} - ${new Date(flight.arrival).toLocaleString()}</td>
            <td>${flight.stops === 0 ? 'Nonstop' : `${flight.stops} stops`}</td>
            <td><Button class="btn btn-primary" onclick=bookflight("${flight.flightId}","returnFlight")>Book</Button></td>
        </tr>`
    });
    flightTable.innerHTML = innerHtml;
    returnTable.removeAttribute('hidden');
}

flightSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    var source = flightSearchForm.elements['source'].value;
    var destination = flightSearchForm.elements['destination'].value;
    var departure = new Date(flightSearchForm.elements['departure'].value);
    numberOfPassengers = flightSearchForm.elements['persons'].value;
    var oneWayFlight = flightSearchForm.elements['flight-type'].value == 'one-way';
    departure = formatDate(departure);
    var baseURL = "http://localhost.org:3000/" + localStorage.getItem('country') +"/flights";
    var queryParams = "?source="+source+"&destination="+destination+"&startDate="+departure;
    if (!oneWayFlight) {
        var returnDate = new Date(flightSearchForm.elements['return'].value);
        returnDate = formatDate(returnDate);
        queryParams = queryParams + "&returnDate="+returnDate;
    }

    fetch(baseURL+queryParams,{
        credentials: "include",
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        startFlights = data.startFlights;
        showOneWayFlights(data.startFlights);
        if (!oneWayFlight) {
            returnFlights = data.returnFlights;
            showReturnFlights(data.returnFlights);
        }
    });
});
