const express = require('express');
const app= express();
const axios = require('axios');
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')
const localStratergy = require('passport-local')
const User = require('./models/users');
const Flights = require('./models/flight')
const Booking = require('./models/booking');
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const flash = require('connect-flash')
var cookieParser = require('cookie-parser')
const cors = require('cors')

const PORT= 3004
const HOST = "localhost";

const transporter = nodemailer.createTransport(sendgrid({
    auth:{
        api_key:'API_KEY'
    }
}))
mongoose.connect('mongodb+srv://flights:9582533456@cluster0.n33by.mongodb.net/Reservations',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connection Done");
});

mongoose.set('useFindAndModify', false);
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: 'http://localhost.org:8080',
    credentials: true
}));

const sessionConfig ={
    secret:'secret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:false,
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        domain: undefined,
        sameSite: false
    }
}

app.use(cookieParser())
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStratergy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/health-check',(req,res)=>{
    res.send("Okay working!")
})

app.get('/flights',async (req,res)=>{
    let { source, destination, startDate, returnDate} = req.query;

    startDate = new Date(startDate);
    startDate.setHours(0,0,0,0);
    let startDateLimit = new Date(startDate);
    startDateLimit.setDate(startDateLimit.getDate()+1);

    const startFlights = await Flights.find({
        source: source, 
        destination: destination,
        departure: {
            $gte: startDate,
            $lt: startDateLimit
        }
    });

    let returnFlights = undefined;
    if (returnDate) {
        returnDate = new Date(returnDate);
        returnDate.setHours(0,0,0,0);
        let returnDateLimit = new Date(returnDate);
        returnDateLimit.setDate(returnDateLimit.getDate()+1);

        returnFlights = await Flights.find({
            source: destination, 
            destination: source,
            departure: {
                $gte: returnDate,
                $lt: returnDateLimit
            }
        });
    }
    res.send({
        startFlights,
        returnFlights
    });
})

app.get('/flight/:id',async(req,res)=>{
    if (req.user && (req.user.role === 'admin' || req.user.role === 'vendor')) {
        const flight = await Flights.findById(req.params.id);
        try{
            res.send(flight);
        }catch(e){
            res.status(404).json('Not found');
        }
    } else {
        res.status(401).send("You don't have neccessary permissions to access this endpoint");
    }
})

app.post('/flight/add', async (req,res) => {
    if (req.user && req.user.role === 'admin') {
        console.log(req.user);
        const data = req.body;
        const newFlight = new Flights({
            flightId: data.flightId,
            source: data.source,
            departure_airport: data.departure_airport,
            arrival_airport: data.arrival_airport,
            destination: data.destination,
            price: data.price,
            departure: new Date(data.departure),
            arrival: new Date(data.arrival),
            totalSeats: data.totalSeats,
            availableSeats: data.totalSeats,
            stops: data.stops,
        });

        newFlight.save((err) => {
            if (err) {
                console.log(err);
                res.status(500).send('Could not add flight');
            } else {
                res.status(201).send('Flight created');
            }
        })
    } else {
        res.status(401).send("You don't have neccessary permissions to access this endpoint");
    }
});

app.post('/login',passport.authenticate('local',({failureFlash:true,failureRedirect:'/login'})),async(req,res)=>{
    try{
    res.json(req.session);
    }catch(e){
        res.json("Invalid username or password")
    }
})

app.get('/logout',(req,res)=>{
    req.logout();
    res.json(req.session);
})

app.post('/signup',async(req,res)=>{
    try{
        const {email , username , password, role}=req.body;
        const user = new User({email,username, role});
        const newUser = await User.register(user,password);
        req.login(newUser, err=>{
            if(err)
                return next(err);
         res.send("User created");
         })
    }catch(e){
        console.log(e.message);
    }   
})

app.post('/reset-password',async(req,res)=>{
    crypto.randomBytes(32,async(err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token = buffer.toString('hex')
        await User.findOne({email:req.body.email}).then(user=>{
            if(!user){ 
                return res.status(422).json({error:"User doesn't exist.Verify the given email address"});
            }
            user.resetToken = token;
            console.log(token);
            user.expireToken = Date.now() + 3600000
            user.save().then(result=>{
                transporter.sendMail({
                    to: user.email,
                    from: 'oholivia876@gmail.com', 
                    subject: 'Reset password',
                    html: `
                            <h2>Password Reset</h2>
                            <p><strong>Click this <a href="https://www.google.com">link</a> to reset your password </strong></p>
                         `,
                }).then(() => {
                    console.log('Email sent')
                  })
                  .catch((error) => {
                    console.error(error)
                  })
            })
            res.json({message:"Check your email"})
        })

    })
})

app.post('/new-password',(req,res)=>{
    const newPassword = req.body.password;
    const sentToken = req.body.resetToken;
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({message:"Try again,Session expired"})
        }
        user.resetToken =undefined;
        user.expireToken= undefined;
        user.setPassword(newPassword, ()=>{
                user.save();
                res.status(200).json({message: 'password reset successful'});
        });
    }).catch(err=>{
        res.json(err)
    })
})
app.post('/reserve/:id',async(req,res)=>{
    const data = req.body;
    if(req.user)
    {
        const flight = await Flights.findById(req.params.id);
        const user = await User.findById(req.user._id);
        const ticket = new Booking ({})
        const persons = data.persons;
        ticket.person = [];
        persons.forEach(person => {
            ticket.person.push({
                name: person.name,
                phoneNo: person.phoneNo,
            })
        });
        ticket.flight=flight;
        ticket.user = user;
        const query = {
            _id: flight._id,
        };
        let availableSeats = flight.availableSeats;
        availableSeats -= persons.length;
        const updateFlight = Flights.findOneAndUpdate(query, {availableSeats});
        updateFlight
        .then(() => {
            ticket.save((err)=>{
                if (err) {
                    console.log(err);
                    res.status(500).send('Sorry,Error occurred ! Reservation unsuccessfull');
                } else {
                    res.status(201).send('Succesfully booked your flight');
                }
            });
        })
        .catch((e) => {
            res.status(500).send('Sorry,Error occurred ! Reservation unsuccessfull');
        })
    }else{
        res.send("You need to login first")
    }
    
})

app.get('/userDetails', async (req,res) => {
    if (req.user) {
        let user = await User.findById(req.user._id);
        const bookings = await Booking.find({ user: req.user._id }).populate('flight');

        user = {
            email: user.email,
            username: user.username,
        };

        const response = {user, bookings};
        res.send(response);
    }else {
        res.status(401).send("User not logged in");
    }
})

app.listen(PORT,()=>{
    axios({
        method:'POST',
        url : 'http://localhost:3002/register',
        headers :{'Content-Type': 'application/json'},
        data: {
            pathName :"Kolkata",
            protocol:"http",
            coordinates: [22.5726, 88.3639],
            host :HOST,
            port : PORT,
        }
    }).then((res)=>{
        console.log(res.data);
    }).catch(err=>{
        console.log(err.message);
    })
    console.log(' Delhi server started on port 3003');
})



