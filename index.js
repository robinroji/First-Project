const express= require('express')
const session = require('express-session');
const flash = require('connect-flash');
const nocache = require('nocache')
const mongoose = require('mongoose')
const morgan = require('morgan');

require('dotenv').config()
const PORT = process.env.PORT

const app = express()

const user_route = require('./Routes/userRoutes')
const admin_route = require('./Routes/adminRoute');
const cat_router = require('./Routes/categoryRoute');
const product_route = require('./Routes/productRoute')
sss


const admin_auth = require('./middleware/admin_auth')

mongoose.connect(process.env.MONGO_URL)


app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(flash());
app.use(nocache())
// app.use(morgan('dev'))

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // For passport.js errors
    next();
  });



app.use('/',user_route);
app.use('/admin',admin_route)
app.use('/category',cat_router)
app.use('/product',product_route)

 
app.listen(PORT,()=>{
    console.log('server is running ')
})


