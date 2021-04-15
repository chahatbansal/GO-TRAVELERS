# Flight Reservation System
### Overview
The flight reservation system is a web platform that provides the facility to search and book tickets online. It helps to manage the ticket booking records as well as the booking records and the details of the customers going to travel.

This project is following microservice-architecture and build with the help of NodeJs. Each request is first sent to the gateway which forwards it based on the request country, it then reaches the country load balancer which redirects to the nearest registered microservice.
### Booking process

A customer can view all the available flights. Customers can search the flight according to the source and destination. Customers can book a ticket after login into the application, for the first-time customer have to register in the system. 
### Tools and Technology
- *Front-End*  Html, CSS, JS.
- *Back-end:* NodeJs ExpressJs.
- *Database* MongoDB.

### Steps to run the backend server

#### Gateway
- Navigate to Gateway folder inside the project using cd command
- Run `npm install`
- Run `npm start`

#### Load Balancer
- Navigate to India folder inside the project using cd command
- Run `npm install`
- Run `npm start`

#### Microservices
- Navigate to Delhi and Kolkata folder inside the project using cd command
- Run `npm install`
- Run `npm start`

### Microservice Endpoint Details

#### GET `/flights`
- Get list of flights based on query params provided
- Source, Destination, StartDate, ReturnDate are the params where Return date is optional and first three are required
- Can be accessed by all users

#### GET `/flight/:id`
- Get details regarding a single flight
- Can be accessed by admin user and registered vendor for third party access

#### POST `/flight/add`
- Add new flights to the database
- Can be accessed only by admin user

#### POST `/login`
- This endpoint is used for login
- Cookies are set for session management
- Can be accessed by all users

#### POST `/signup`
- Create new user
- Can be accessed by all users

#### GET `/logout`
- Used for logging users out and destroying session

#### POST `/reset-password`
- Used for initiating password
- Generates a password reset token  with expiry date

#### POST `/new-password`
- Used for password reset
- Requires valid reset password token to reset

#### POST `/reserve/:id`
- Used for booking flights
- A person can book flight for more than one traveller at once
- Can be used by all type of users

#### GET `/userDetails`
- Returns details of logged in user
- Automatically determines logged in user using session  cookies

### Architecture Diagram
![image](https://user-images.githubusercontent.com/67470541/113941003-05dfee80-981c-11eb-8843-55798365c558.png)

### Screenshots and Video

#### UI in Action

![Reservation System](https://user-images.githubusercontent.com/67470541/113944517-43477a80-9822-11eb-839a-32c58ff03af6.gif)


#### Gateway in Action

![image](https://user-images.githubusercontent.com/67470541/113943538-8b659d80-9820-11eb-93e6-06dbebfa9503.png)


#### Load Balancer in Action

![image](https://user-images.githubusercontent.com/67470541/113943499-75f07380-9820-11eb-9579-c18d9eb65b47.png)

