const http = require('http')
const port = process.env.PORT || 5000

const express = require('express')
const app = express()
const morgan = require('morgan')
const methodOverride = require('method-override')

app.locals.siteName = "Test App"
app.use(morgan("dev"))
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(methodOverride('_method'))

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
    res.render('index')
})


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
    console.log('a user connected')

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
})


server.listen(port)