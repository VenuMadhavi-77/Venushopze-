const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Product = require('./models/Product');
const Review = require('./models/Review');
const Order = require('./models/Order');
const Cart = require('./models/Cart');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/venushopze';

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected!');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Create standard users
    console.log('Creating users...');
    const admin = await User.create({
      name: 'Venus Admin',
      email: 'admin@venus.com',
      password: 'adminpassword123',
      role: 'admin'
    });

    const seller = await User.create({
      name: 'Electro Hub India',
      email: 'seller@venus.com',
      password: 'sellerpassword123',
      role: 'seller'
    });

    const user = await User.create({
      name: 'Rohan Sharma',
      email: 'user@venus.com',
      password: 'userpassword123',
      role: 'user'
    });

    console.log(`Users created!
    - Admin: admin@venus.com (adminpassword123)
    - Seller: seller@venus.com (sellerpassword123)
    - User: user@venus.com (userpassword123)`);

    // 2. Create products
    console.log('Creating electronic products...');
    const productsData = [
      {
        name: 'boAt Rockerz 450 Wireless Headphone',
        description: 'Experience immersive, high-quality audio with the boAt Rockerz 450. Featuring a massive 15-hour playback backup, 40mm dynamic drivers, and comfortable padded earcups for extended listening sessions. Perfect for work, study, and travel.',
        price: 1499,
        originalPrice: 3990,
        category: 'Audio',
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&auto=format&fit=crop&q=80'
        ],
        seller: seller._id,
        specs: {
          'Battery Life': '15 Hours',
          'Driver Size': '40mm',
          'Bluetooth Version': 'v5.0',
          'Charging Time': '3 Hours'
        },
        ratings: { average: 4.4, count: 5 }
      },
      {
        name: 'Noise ColorFit Pulse Smartwatch',
        description: 'Track your fitness goals with the Noise ColorFit Pulse. Features a vibrant 1.4-inch full-touch color display, 24/7 heart rate monitoring, blood oxygen (SpO2) tracker, 8 sports modes, and up to 10-day battery life. Sleek, lightweight, and IP68 waterproof.',
        price: 1999,
        originalPrice: 4999,
        category: 'Wearables',
        stock: 35,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
        ],
        seller: seller._id,
        specs: {
          'Display Size': '1.4 Inches',
          'Waterproof Rating': 'IP68',
          'Battery Life': 'Up to 10 Days',
          'Sensors': 'Heart Rate, SpO2'
        },
        ratings: { average: 4.1, count: 4 }
      },
      {
        name: 'OnePlus Nord CE 3 Lite 5G',
        description: 'Upgrade to lightning-fast 5G connectivity with the OnePlus Nord CE 3 Lite. Equipped with a stunning 108MP primary camera, Snapdragon 695 chipset, a buttery-smooth 120Hz refresh rate display, and 67W SUPERVOOC fast charging to power up your day instantly.',
        price: 19999,
        originalPrice: 21999,
        category: 'Smartphones',
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
        ],
        seller: seller._id,
        specs: {
          'Processor': 'Snapdragon 695',
          'RAM': '8 GB',
          'Storage': '128 GB',
          'Camera': '108MP + 2MP + 2MP',
          'Battery': '5000 mAh'
        },
        ratings: { average: 4.5, count: 6 }
      },
      {
        name: 'Logitech MX Master 3S Professional Mouse',
        description: 'The ultimate ergonomic mouse designed for creators and coders. Experience ultra-quiet clicks, MagSpeed electromagnetic scrolling for scrolling 1000 lines in a second, and an 8K DPI track-on-glass sensor. Work seamlessly across multiple computers.',
        price: 8995,
        originalPrice: 10995,
        category: 'Accessories',
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1628149455678-16f37bc392f4?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?w=800&auto=format&fit=crop&q=80'
        ],
        seller: seller._id,
        specs: {
          'DPI': '8000',
          'Connectivity': 'Bluetooth / Logi Bolt',
          'Weight': '141 g',
          'Battery': 'Rechargeable Li-Po (70 days)'
        },
        ratings: { average: 4.8, count: 3 }
      },
      {
        name: 'ASUS ROG Zephyrus G14 Gaming Laptop',
        description: 'Crush your rendering and gaming sessions with the ASUS ROG Zephyrus G14. Packed with a powerful AMD Ryzen 7 processor, NVIDIA GeForce RTX 3050 graphics card, 16GB RAM, and a super-fast 512GB SSD. Beautiful 14-inch FHD 144Hz display in a lightweight chassis.',
        price: 74990,
        originalPrice: 98990,
        category: 'Computing',
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80'
        ],
        seller: seller._id,
        specs: {
          'Processor': 'AMD Ryzen 7 5800HS',
          'Graphics': 'NVIDIA RTX 3050 4GB',
          'RAM': '16 GB DDR4',
          'Storage': '512 GB NVMe SSD',
          'Refresh Rate': '144Hz'
        },
        ratings: { average: 4.6, count: 5 }
      },
      {
        name: 'JBL Flip 6 Waterproof Bluetooth Speaker',
        description: 'Get powerful JBL Original Pro Sound with the JBL Flip 6. Featuring a 2-way speaker system, racetrack-shaped woofer, separate tweeter, and dual pumping bass radiators. IP67 waterproof and dustproof design, with up to 12 hours of playtime.',
        price: 9999,
        originalPrice: 14999,
        category: 'Audio',
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
        ],
        seller: seller._id,
        specs: {
          'Output Power': '20W RMS',
          'Waterproof Rating': 'IP67',
          'Playtime': '12 Hours',
          'Charging Port': 'USB Type-C'
        },
        ratings: { average: 4.5, count: 3 }
      },
      {
        name: 'Apple iPad Air (5th Gen) 10.9-inch',
        description: 'Supercharged by the groundbreaking Apple M1 chip, the iPad Air delivers incredible performance. Features a beautiful 10.9-inch Liquid Retina display, 12MP Ultra Wide front camera with Center Stage, support for Apple Pencil (2nd Gen) and Magic Keyboard, and all-day battery life.',
        price: 54900,
        originalPrice: 59900,
        category: 'Computing',
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80'
        ],
        seller: seller._id,
        specs: {
          'Processor': 'Apple M1 Chip',
          'Screen Size': '10.9 Inches',
          'Storage': '64 GB',
          'OS': 'iPadOS 16'
        },
        ratings: { average: 4.7, count: 4 }
      },
      {
        name: 'Sony WH-1000XM5 Noise Cancelling Headphone',
        description: 'Experience Sony\'s best ever noise cancelling. With two processors controlling 8 microphones, Auto NC Optimizer, and a specially designed driver unit, the WH-1000XM5 headphones rewrite the rules for distraction-free listening. Enjoy up to 30 hours of battery life.',
        price: 26990,
        originalPrice: 34990,
        category: 'Audio',
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
        ],
        seller: seller._id,
        specs: {
          'Battery Life': 'Up to 30 Hours',
          'Active Noise Cancelling': 'Industry Leading',
          'Bluetooth Version': 'v5.2',
          'Quick Charge': '3 min for 3 hours'
        },
        ratings: { average: 4.9, count: 8 }
      },
      {
        name: 'Samsung Galaxy S24 Ultra 5G',
        description: 'The ultimate flagship smartphone from Samsung. Featuring a massive 6.8-inch QHD+ Dynamic AMOLED 2X display, Snapdragon 8 Gen 3 processor, a groundbreaking 200MP quad-camera setup, and the integrated S Pen. Titanium gray finish with 12GB RAM and 256GB storage.',
        price: 109999,
        originalPrice: 129999,
        category: 'Smartphones',
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
        ],
        seller: seller._id,
        specs: {
          'Processor': 'Snapdragon 8 Gen 3',
          'RAM': '12 GB',
          'Storage': '256 GB',
          'Display': '6.8" QHD+ AMOLED',
          'Primary Camera': '200 MP'
        },
        ratings: { average: 4.8, count: 5 }
      },
      {
        name: 'Sony PlayStation 5 (PS5) Slim',
        description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games. Slim digital edition with 1TB SSD.',
        price: 44990,
        originalPrice: 54990,
        category: 'Accessories',
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
        ],
        seller: seller._id,
        specs: {
          'Storage': '1 TB SSD',
          'Resolution': 'Up to 4K 120Hz',
          'HDR Support': 'Yes',
          'Processor': 'Custom AMD Zen 2'
        },
        ratings: { average: 4.7, count: 9 }
      },
      {
        name: 'Keychron K2 Mechanical Keyboard',
        description: 'A tactile, wireless mechanical keyboard designed for Mac and Windows. Features a 75% compact layout, hot-swappable Gateron G Pro Brown switches, a robust aluminum frame, and customizable RGB backlighting. Bluetooth wireless or wired USB-C mode.',
        price: 6999,
        originalPrice: 9999,
        category: 'Accessories',
        stock: 30,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
        ],
        seller: seller._id,
        specs: {
          'Switch Type': 'Gateron G Pro Brown',
          'Layout': '75% Compact',
          'Backlight': 'RGB',
          'Connectivity': 'Bluetooth / Wired'
        },
        ratings: { average: 4.6, count: 4 }
      }
    ];

    const insertedProducts = await Product.insertMany(productsData);
    console.log(`Inserted ${insertedProducts.length} electronic products.`);

    // 3. Create reviews
    console.log('Seeding reviews...');
    const sampleReviews = [
      {
        user: user._id,
        userName: user.name,
        product: insertedProducts[0]._id, // boAt Rockerz 450
        rating: 5,
        comment: 'Super awesome headphones! The battery lasts forever. Sound quality is brilliant for the price!'
      },
      {
        user: user._id,
        userName: user.name,
        product: insertedProducts[1]._id, // Noise watch
        rating: 4,
        comment: 'Great value for money. Screen is bright, but sleep tracker takes a while to calibrate.'
      },
      {
        user: user._id,
        userName: user.name,
        product: insertedProducts[2]._id, // OnePlus Nord
        rating: 5,
        comment: 'Excellent phone! Charges insanely fast and the camera details in daylight are fantastic.'
      },
      {
        user: user._id,
        userName: user.name,
        product: insertedProducts[3]._id, // Logitech Mouse
        rating: 5,
        comment: 'Outstanding ergonomics. The scroll wheel feels magical. Must-have for developers.'
      },
      {
        user: user._id,
        userName: user.name,
        product: insertedProducts[4]._id, // ASUS laptop
        rating: 5,
        comment: 'Compact powerhouse. Handles gaming and editing flawlessly. Screen is gorgeous.'
      }
    ];

    await Review.insertMany(sampleReviews);
    console.log('Sample reviews inserted successfully!');

    console.log('Seeding database complete. Exiting!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

seedData();
