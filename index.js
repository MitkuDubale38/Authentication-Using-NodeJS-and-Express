const express = require("express");
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//setting up middlewares
app.use(express.json());
//
const port = process.env.port || 3000
dotenv.config({ path: '.env' });

//mongo db connection
const url = process.env.MONGO_URL;
mongoose.set("strictQuery", false);
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(console.log("Connected")).catch((err) => console.log(err));


//routes
app.use('/api', require('./routes/login'));
app.use('/api', require('./routes/signup'));
app.use('/api', require('./routes/resource'));


//starting the server on port 3000
app.listen(port, () => {
    console.log("Server is listening on port 3000");
});