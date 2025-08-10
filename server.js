const express = require('express');
const cors = require(`cors`)
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const cookieparser = require("cookie-parser");

dotenv.config();


app = express();
app.use(express.json());
app.use(cookieparser());
app.use(cors());



const userRoute = require("./src/routes/userRoutes");
const profileRouter = require('./src/routes/profile');




app.use("/", userRoute);
app.use("/", profileRouter);


const PORT = process.env.PORT || 3000;

connectDB();

app.get('/', (req, res) => {
    res.send('Hello Carryloop!')
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});

