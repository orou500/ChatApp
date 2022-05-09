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

let users = []

// const messages = {
//     general: [],
//     programmers: [],
//     support: [],
//     menu: [],
//     cloud: [],
//     accountancy: [],
// }

io.on('connection', (socket) => {
    socket.on('join server', (username) => {
        const user = {
            username,
            id: socket.id,
        }
        users.push(user)
        io.emit("new user", users)
    })

    socket.on('chat message', (message, userId) => {
        let fromUserName = users.find(u => u.id === socket.id);
        fromUserName = fromUserName.username
        socket.to(userId).emit('new message', {message: message, from: fromUserName, fromSocket: socket.id})
    })

    // socket.on('join room', (roomName, cb) => {
    //     socket.join(roomName)
    //     cb(messages[roomName])
    // })

    // socket.on('send message', ({content, to, sender, chatName, isChannel}) => {
    //     if(isChannel){
    //         const payload = {
    //             content,
    //             chatName,
    //             sender,
    //         }
    //         socket.to(to).emit('new message', payload)
    //     } else {
    //         const payload = {
    //             content,
    //             chatName: sender,
    //             sender,
    //         }
    //         socket.to(to).emit('new message', payload)
    //     }
    //     if(messages[chatName]) {
    //         messages[chatName].push({
    //             sender,
    //             content,
    //         })
    //     }
    // })

    socket.on('disconnect', () => {
        users = users.filter(u => u.id !== socket.id)
        io.emit('new user', users)
    })

})


server.listen(port)


