const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
const Products = require('./src/data/products');
const products = require('./src/data/products');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
    try {
        // Clear old data
        await User.deleteMany();
        await Product.deleteMany();

        // Create an admin user
        const createdUser = await User.create({
            firstName: "Admin",
            lastName: "User",
            email: "admin@example.com",
            password: "123456",
            role: "admin"
          });
          

        // Assign user ID to each product
        const sampleProducts = products.map((product) => {
            return { ...product, user: createdUser._id };
        });

        // Insert products
        await Product.insertMany(sampleProducts);

        console.log("Product data seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding the data:", error);
        process.exit(1);
    }
};

// Run the seeder
seedData();