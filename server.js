const http = require('http')
const port = process.env.PORT || 5000

const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const cookieSession = require('cookie-session')
const authRoutes = require('./api/routes/authRoutes')
const Keys = require('./services/Keys')
const passport = require('passport')
const passportSetup = require('./services/passport-setup')

// MongoDB connect
mongoose.connect(`mongodb+srv://${Keys.mongoDB.MONGO_USERNAME}:${Keys.mongoDB.MONGO_PASSWORD}@league-api.sshyh.mongodb.net/test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


mongoose.connection.on('connected', () => {
    console.log('mongoDB Connected!')
});

app.locals.siteName = "Test App"
app.use(morgan("dev"))
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(methodOverride('_method'))
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [Keys.session.cookieKey]
}))

//initialize passport
app.use(passport.initialize())
app.use(passport.session())


//set headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    if(req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET")
        return res.status(200).json({})
    }
    next()
})


//register view engine
app.set('view engine', 'ejs')

//view routes
app.get('/',(req, res) => {
    res.render('index', {user: req.user})
})

app.use(authRoutes)

//handling errors
app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    res.render('404')
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

const server = http.createServer(app);
io = require('socket.io')(server);


io.on('connection', (socket) => {
    const users = {}

    socket.on('user-name', (name) => {
        users[socket.id] = name
        io.emit('connection', name + ' connected')
    })

    socket.on('disconnect', () => {
        console.log(socket.id +' disconnected')
    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', {message: msg, name: users[socket.id]})
    })

})


server.listen(port)