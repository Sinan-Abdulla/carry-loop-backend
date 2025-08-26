const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

// ✅ FIX: Proper CORS setup (must be before routes)
app.use(cors({
    origin: "http://localhost:5173", // Your React frontend URL
    credentials: true                // Allow cookies
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
const userRoute = require("./src/routes/userRoutes");
const profileRouter = require('./src/routes/profile');
const productRouter = require('./src/routes/productRoutes');
const cartRouter = require('./src/routes/cartRoutes');
const checkoutRouter = require('./src/routes/chekoutRoutes');
const orderRouter = require('./src/routes/orderRoutes');
const uploadRouter = require('./src/routes/uploadRoutes');
const subscribeRouter = require('./src/routes/subscribeRoutes');
const adminRouter = require('./src/routes/adminRoute');
const productAdminRouter = require('./src/routes/productAdminRoute');
const adminOrders = require('./src/routes/adminOrdersRoutes');

app.use("/", userRoute);
app.use("/", profileRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/order", orderRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/subscribe", subscribeRouter);

// admin routes
app.use("/api/admin", adminRouter);
app.use("/api/admin", productAdminRouter);
app.use("/api/admin", adminOrders);

const PORT = process.env.PORT || 3000;

connectDB();

app.get('/', (req, res) => {
    res.send('Hello Carryloop!')
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});
