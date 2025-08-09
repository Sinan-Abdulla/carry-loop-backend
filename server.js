const express = require('express');
const cors = require(`cors`)
const dotenv = require ('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();


app = express();
app.use(express.json());
app.use(cors());



const userRoute = require("./src/routes/userRoutes");




app.use ("/", userRoute);


const PORT = process.env.PORT || 3000;

connectDB();

app.get ('/', (req, res) => {
    res.send('Hello Carryloop!')
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
});

