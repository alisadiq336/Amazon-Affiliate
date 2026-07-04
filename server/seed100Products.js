const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Load env variables
dotenv.config();

const categoriesData = [
  { name: 'Electronics & Gadgets', slug: 'electronics-gadgets' },
  { name: 'Laptops & Computers', slug: 'laptops-computers' },
  { name: 'Audio & Sound Systems', slug: 'audio-sound-systems' },
  { name: 'Smart Home Devices', slug: 'smart-home-devices' },
  { name: 'Cameras & Photography', slug: 'cameras-photography' },
  { name: 'Kitchen & Dining', slug: 'kitchen-dining' },
  { name: 'Fitness & Health Wearables', slug: 'fitness-health-wearables' },
  { name: 'Office & Productivity', slug: 'office-productivity' },
  { name: 'Gaming Gear & Accessories', slug: 'gaming-gear-accessories' },
  { name: 'Travel & Outdoor Equipment', slug: 'travel-outdoor-equipment' }
];

const productsTemplate = {
  'Electronics & Gadgets': [
    { name: 'Samsung Galaxy S23 Ultra 5G', brand: 'Samsung', price: 1199.99, rating: 4.8, reviews: 1240, discount: 10, img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BT9CXXXX' },
    { name: 'iPhone 14 Pro Max Unlocked', brand: 'Apple', price: 1099.00, rating: 4.9, reviews: 3102, discount: 0, img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BDHXXXXX' },
    { name: 'Google Pixel 7 Pro Android Phone', brand: 'Google', price: 899.00, rating: 4.7, reviews: 850, discount: 15, img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BCQXXXXX' },
    { name: 'OnePlus 11 5G Dual-SIM', brand: 'OnePlus', price: 699.00, rating: 4.6, reviews: 420, discount: 5, img: 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BPXXXXXX' },
    { name: 'Kindle Paperwhite 16GB Edition', brand: 'Amazon', price: 139.99, rating: 4.8, reviews: 5410, discount: 12, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09TMXXXXX' },
    { name: 'iPad Air 10.9-inch (M1 Chip)', brand: 'Apple', price: 599.00, rating: 4.9, reviews: 1890, discount: 8, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09VXXXXXX' },
    { name: 'Anker Prime 20000mAh Power Bank', brand: 'Anker', price: 129.99, rating: 4.7, reviews: 290, discount: 10, img: 'https://images.unsplash.com/photo-1609592424085-f5b24479b1bf?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0C9XXXXXX' },
    { name: 'Belkin 3-in-1 Magsafe Charger Stand', brand: 'Belkin', price: 149.99, rating: 4.6, reviews: 750, discount: 0, img: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B08LXXXXXX' },
    { name: 'Roku Streaming Stick 4K HDR', brand: 'Roku', price: 49.99, rating: 4.7, reviews: 12100, discount: 20, img: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09BXXXXXX' },
    { name: 'Fitbit Charge 6 Fitness Tracker', brand: 'Fitbit', price: 159.95, rating: 4.5, reviews: 340, discount: 15, img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0CGXXXXXX' }
  ],
  'Laptops & Computers': [
    { name: 'MacBook Air 13-inch M2', brand: 'Apple', price: 1099.00, rating: 4.9, reviews: 2450, discount: 10, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0B3XXXXXX' },
    { name: 'Dell XPS 13 9315 Laptop', brand: 'Dell', price: 999.00, rating: 4.5, reviews: 310, discount: 15, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0B5XXXXXX' },
    { name: 'Lenovo ThinkPad X1 Carbon Gen 11', brand: 'Lenovo', price: 1649.00, rating: 4.7, reviews: 180, discount: 5, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0C3XXXXXX' },
    { name: 'ASUS ROG Zephyrus G14 Gaming', brand: 'ASUS', price: 1429.00, rating: 4.6, reviews: 490, discount: 8, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BVXXXXXX' },
    { name: 'HP Spectre x360 2-in-1', brand: 'HP', price: 1249.99, rating: 4.6, reviews: 240, discount: 10, img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09TXXXXXX' },
    { name: 'Acer Swift Go 14 Thin Laptop', brand: 'Acer', price: 799.99, rating: 4.4, reviews: 150, discount: 20, img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BTXXXXXX' },
    { name: 'SAMSUNG 34-inch Odyssey G8 OLED', brand: 'Samsung', price: 999.99, rating: 4.7, reviews: 420, discount: 15, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BQX7XXXX' },
    { name: 'Logitech MX Master 3S Mouse', brand: 'Logitech', price: 99.99, rating: 4.8, reviews: 4120, discount: 0, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0B2XXXXXX' },
    { name: 'Keychron K2 Mechanical Keyboard', brand: 'Keychron', price: 79.99, rating: 4.7, reviews: 1890, discount: 5, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07QXXXXXX' },
    { name: 'Anker 577 Thunderbolt Docking Station', brand: 'Anker', price: 249.99, rating: 4.5, reviews: 310, discount: 10, img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B087XXXXXX' }
  ],
  'Audio & Sound Systems': [
    { name: 'Sony WH-1000XM5 Noise Canceling', brand: 'Sony', price: 398.00, rating: 4.8, reviews: 4890, discount: 15, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09XXXXXXX' },
    { name: 'Bose QuietComfort Ultra Headphones', brand: 'Bose', price: 429.00, rating: 4.9, reviews: 920, discount: 0, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0CFXXXXXX' },
    { name: 'Apple AirPods Pro (2nd Gen) USB-C', brand: 'Apple', price: 249.00, rating: 4.9, reviews: 11200, discount: 20, img: 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0CHXXXXXX' },
    { name: 'Sennheiser Momentum True Wireless 4', brand: 'Sennheiser', price: 299.95, rating: 4.6, reviews: 150, discount: 10, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0CNXXXXXX' },
    { name: 'Sonos Move 2 Portable Speaker', brand: 'Sonos', price: 449.00, rating: 4.8, reviews: 340, discount: 0, img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0CGXXXXXX' },
    { name: 'JBL Flip 6 Waterproof Speaker', brand: 'JBL', price: 129.95, rating: 4.8, reviews: 9450, discount: 23, img: 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09HXXXXXX' },
    { name: 'Audio-Technica LP120X Turntable', brand: 'Audio-Technica', price: 349.00, rating: 4.7, reviews: 2980, discount: 5, img: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07NXXXXXX' },
    { name: 'Marshall Stanmore III Bluetooth', brand: 'Marshall', price: 379.99, rating: 4.7, reviews: 540, discount: 10, img: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0B3XXXXXX' },
    { name: 'Sony HT-A7000 7.1.2ch Soundbar', brand: 'Sony', price: 998.00, rating: 4.5, reviews: 410, discount: 20, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B098XXXXXX' },
    { name: 'Focusrite Scarlett 2i2 USB Interface', brand: 'Focusrite', price: 199.99, rating: 4.8, reviews: 8100, discount: 10, img: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0C4XXXXXX' }
  ],
  'Smart Home Devices': [
    { name: 'Google Nest Learning Thermostat 3rd Gen', brand: 'Google', price: 249.00, rating: 4.7, reviews: 18200, discount: 20, img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B013XXXXXX' },
    { name: 'Ring Video Doorbell Plus', brand: 'Ring', price: 149.99, rating: 4.6, reviews: 4120, discount: 15, img: 'https://images.unsplash.com/photo-1558002038-04f22756778f?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BTXXXXXX' },
    { name: 'Philips Hue White & Color Ambiance Starter', brand: 'Philips Hue', price: 179.99, rating: 4.8, reviews: 5900, discount: 10, img: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07DXXXXXX' },
    { name: 'Ecobee Smart Thermostat Premium', brand: 'Ecobee', price: 249.99, rating: 4.7, reviews: 1450, discount: 0, img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09VXXXXXX' },
    { name: 'Lutron Caseta Smart Switch Starter Kit', brand: 'Lutron', price: 99.95, rating: 4.8, reviews: 2980, discount: 5, img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B00KXXXXXX' },
    { name: 'Yale Assure Lock 2 Keyless Lock', brand: 'Yale', price: 179.99, rating: 4.5, reviews: 890, discount: 12, img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BDXXXXXX' },
    { name: 'August Wi-Fi Smart Lock (4th Gen)', brand: 'August', price: 229.99, rating: 4.4, reviews: 3950, discount: 20, img: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B082XXXXXX' },
    { name: 'Amazon Echo Show 8 (3rd Gen)', brand: 'Amazon', price: 149.99, rating: 4.7, reviews: 2410, discount: 30, img: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0C3XXXXXX' },
    { name: 'Apple HomePod (2nd Gen) Smart Speaker', brand: 'Apple', price: 299.00, rating: 4.8, reviews: 780, discount: 0, img: 'https://images.unsplash.com/photo-1512446813927-4a78788c1de4?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BSXXXXXX' },
    { name: 'TP-Link Kasa Smart Plug Power Strip', brand: 'TP-Link', price: 29.99, rating: 4.7, reviews: 14500, discount: 25, img: 'https://images.unsplash.com/photo-1595248353163-a2a353163-a2a353163-a2a353163-a2a353163?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07GXXXXXX' }
  ],
  'Cameras & Photography': [
    { name: 'Sony Alpha 7 IV Full-Frame Camera', brand: 'Sony', price: 2498.00, rating: 4.9, reviews: 890, discount: 5, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09JXXXXXX' },
    { name: 'Fujifilm X-T5 Mirrorless Digital Camera', brand: 'Fujifilm', price: 1699.00, rating: 4.8, reviews: 420, discount: 0, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BLXXXXXX' },
    { name: 'Canon EOS R6 Mark II Camera body', brand: 'Canon', price: 2299.00, rating: 4.9, reviews: 310, discount: 10, img: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BPXXXXXX' },
    { name: 'GoPro HERO12 Black Action Camera', brand: 'GoPro', price: 399.99, rating: 4.7, reviews: 1420, discount: 15, img: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0CGXXXXXX' },
    { name: 'DJI Mini 4 Pro Fly More Combo', brand: 'DJI', price: 1099.00, rating: 4.9, reviews: 680, discount: 0, img: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0CHXXXXXX' },
    { name: 'Insta360 X3 Pocket 360 Action Camera', brand: 'Insta360', price: 449.99, rating: 4.6, reviews: 1120, discount: 11, img: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0B9XXXXXX' },
    { name: 'DJI Osmo Pocket 3 Creator Combo', brand: 'DJI', price: 669.00, rating: 4.9, reviews: 540, discount: 0, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0CHXXXXXX' },
    { name: 'Peak Design Travel Backpack 45L', brand: 'Peak Design', price: 299.95, rating: 4.8, reviews: 720, discount: 5, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07GXXXXXX' },
    { name: 'SanDisk 256GB Extreme PRO SDXC Card', brand: 'SanDisk', price: 42.99, rating: 4.8, reviews: 15400, discount: 20, img: 'https://images.unsplash.com/photo-1590291771960-5f5024479b1bf?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07HXXXXXX' },
    { name: 'Manfrotto Element Traveler Tripod Carbon', brand: 'Manfrotto', price: 189.99, rating: 4.6, reviews: 310, discount: 10, img: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B01MXXXXXX' }
  ],
  'Kitchen & Dining': [
    { name: 'Instant Pot Duo Crisp 11-in-1 cooker', brand: 'Instant Pot', price: 199.99, rating: 4.8, reviews: 18900, discount: 25, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07WXXXXXX' },
    { name: 'Ninja AF101 Air Fryer 4-Quart capacity', brand: 'Ninja', price: 129.99, rating: 4.8, reviews: 43200, discount: 30, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07FXXXXXX' },
    { name: 'Breville Barista Express Espresso Machine', brand: 'Breville', price: 749.95, rating: 4.7, reviews: 18900, discount: 0, img: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B00CXXXXXX' },
    { name: 'KitchenAid Artisan Series Stand Mixer', brand: 'KitchenAid', price: 449.99, rating: 4.9, reviews: 15400, discount: 12, img: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B000XXXXXX' },
    { name: 'Vitamix E310 Explorian Blender', brand: 'Vitamix', price: 349.95, rating: 4.8, reviews: 7850, discount: 15, img: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B075XXXXXX' },
    { name: 'Cosori Gooseneck Electric Kettle', brand: 'Cosori', price: 69.99, rating: 4.8, reviews: 19800, discount: 15, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07TXXXXXX' },
    { name: 'Zojirushi Neuro Fuzzy Rice Cooker', brand: 'Zojirushi', price: 232.00, rating: 4.8, reviews: 9800, discount: 5, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B000XXXXXX' },
    { name: 'Anova Precision Cooker Nano Sous Vide', brand: 'Anova', price: 149.00, rating: 4.7, reviews: 5410, discount: 34, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07CXXXXXX' },
    { name: 'Zwilling J.A. Henckels 15-pc Knife Set', brand: 'Zwilling', price: 169.99, rating: 4.7, reviews: 8100, discount: 10, img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B000XXXXXX' },
    { name: 'SodaStream Terra Sparkling Water Maker', brand: 'SodaStream', price: 99.99, rating: 4.5, reviews: 3410, discount: 20, img: 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09BXXXXXX' }
  ],
  'Fitness & Health Wearables': [
    { name: 'Apple Watch Series 9 GPS 45mm', brand: 'Apple', price: 429.00, rating: 4.8, reviews: 2900, discount: 12, img: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0CHXXXXXX' },
    { name: 'Garmin Venu 3 GPS Smartwatch', brand: 'Garmin', price: 449.99, rating: 4.7, reviews: 850, discount: 0, img: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0CGXXXXXX' },
    { name: 'Oura Ring Gen3 Horizon Smart Ring', brand: 'Oura', price: 349.00, rating: 4.6, reviews: 620, discount: 0, img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09KXXXXXX' },
    { name: 'Garmin Fenix 7 Pro Solar Multisport', brand: 'Garmin', price: 799.99, rating: 4.8, reviews: 490, discount: 10, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BYXXXXXX' },
    { name: 'WHOOP 4.0 Activity & Health Tracker', brand: 'Whoop', price: 239.00, rating: 4.4, reviews: 1120, discount: 0, img: 'https://images.unsplash.com/photo-1510017808638-a889728f86f7?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09GXXXXXX' },
    { name: 'SAMSUNG Galaxy Watch 6 44mm LTE', brand: 'Samsung', price: 329.99, rating: 4.6, reviews: 1450, discount: 15, img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0C7XXXXXX' },
    { name: 'Theragun Pro G5 Percussive Massager', brand: 'Therabody', price: 599.00, rating: 4.8, reviews: 189, discount: 16, img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BDXXXXXX' },
    { name: 'Withings Body Comp Smart Scale', brand: 'Withings', price: 199.95, rating: 4.5, reviews: 540, discount: 10, img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0BFXXXXXX' },
    { name: 'Bowflex SelectTech 552 Dumbbells', brand: 'Bowflex', price: 429.00, rating: 4.8, reviews: 18400, discount: 15, img: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B001XXXXXX' },
    { name: 'Fitbit Inspire 3 Slim Fitness Tracker', brand: 'Fitbit', price: 99.95, rating: 4.5, reviews: 5410, discount: 20, img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0B9XXXXXX' }
  ],
  'Office & Productivity': [
    { name: 'Herman Miller Aeron Ergonomic Chair', brand: 'Herman Miller', price: 1495.00, rating: 4.8, reviews: 1210, discount: 0, img: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B01NXXXXXX' },
    { name: 'Everlasting Comfort Memory Foam Cushion', brand: 'Everlasting Comfort', price: 39.95, rating: 4.4, reviews: 92400, discount: 15, img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B01EXXXXXX' },
    { name: 'Epson EcoTank ET-2800 Inkjet Printer', brand: 'Epson', price: 279.99, rating: 4.5, reviews: 12400, discount: 10, img: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09DXXXXXX' },
    { name: 'Vari Desk Converter Stand Up Desk', brand: 'Vari', price: 425.00, rating: 4.8, reviews: 5410, discount: 5, img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B00HXXXXXX' },
    { name: 'Sony Digital Paper DPT-RP1/B tablet', brand: 'Sony', price: 599.99, rating: 4.3, reviews: 290, discount: 20, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B072XXXXXX' },
    { name: 'Logitech Brio 4K Ultra HD Webcam', brand: 'Logitech', price: 199.99, rating: 4.6, reviews: 8900, discount: 20, img: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B01NXXXXXX' },
    { name: 'Dimmable LED Desk Lamp with USB Port', brand: 'Taotronics', price: 39.99, rating: 4.7, reviews: 18450, discount: 15, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B00VXXXXXX' },
    { name: 'Anker USB C Hub 7-in-1 Adapter', brand: 'Anker', price: 34.99, rating: 4.6, reviews: 29800, discount: 10, img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07XXXXXXX' },
    { name: 'WD 5TB My Passport External Hard Drive', brand: 'Western Digital', price: 119.99, rating: 4.7, reviews: 43200, discount: 12, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B07VXXXXXX' },
    { name: 'Moleskine Classic Notebook Hard Cover', brand: 'Moleskine', price: 22.95, rating: 4.8, reviews: 15900, discount: 0, img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B002XXXXXX' }
  ],
  'Gaming Gear & Accessories': [
    { name: 'PlayStation 5 Console Slim edition', brand: 'Sony', price: 499.99, rating: 4.9, reviews: 12400, discount: 5, img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0CLXXXXXX' },
    { name: 'Xbox Series X Console 1TB', brand: 'Microsoft', price: 499.99, rating: 4.8, reviews: 8900, discount: 10, img: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B08HXXXXXX' },
    { name: 'Nintendo Switch - OLED Model', brand: 'Nintendo', price: 349.99, rating: 4.9, reviews: 19800, discount: 0, img: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B098XXXXXX' },
    { name: 'ASUS ROG Ally 7-inch Gaming Handheld', brand: 'ASUS', price: 699.99, rating: 4.5, reviews: 1250, discount: 14, img: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0C6XXXXXX' },
    { name: 'SteelSeries Arctis Nova Pro Wireless', brand: 'SteelSeries', price: 349.99, rating: 4.7, reviews: 1850, discount: 10, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09ZXXXXXX' },
    { name: 'Razer DeathAdder V3 Pro Mouse', brand: 'Razer', price: 149.99, rating: 4.7, reviews: 920, discount: 12, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0B5XXXXXX' },
    { name: 'Secretlab TITAN Evo Gaming Chair', brand: 'Secretlab', price: 549.00, rating: 4.8, reviews: 3100, discount: 0, img: 'https://images.unsplash.com/photo-1598550476439-6847785fce6e?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B095XXXXXX' },
    { name: 'Elgato Stream Deck MK.2 Controller', brand: 'Elgato', price: 149.99, rating: 4.8, reviews: 4890, discount: 15, img: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B097XXXXXX' },
    { name: 'Meta Quest 3 128GB VR Headset', brand: 'Meta', price: 499.00, rating: 4.7, reviews: 1420, discount: 0, img: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B0C8XXXXXX' },
    { name: 'Elgato Wave:3 Premium USB Microphone', brand: 'Elgato', price: 149.99, rating: 4.7, reviews: 3950, discount: 10, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B088XXXXXX' }
  ],
  'Travel & Outdoor Equipment': [
    { name: 'Samsonite Omni PC Hardside Expandable', brand: 'Samsonite', price: 159.00, rating: 4.6, reviews: 24800, discount: 15, img: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B013XXXXXX' },
    { name: 'YETI Tundra 45 Hard Cooler box', brand: 'YETI', price: 325.00, rating: 4.8, reviews: 5120, discount: 0, img: 'https://images.unsplash.com/photo-1609592424085-f5b24479b1bf?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B004XXXXXX' },
    { name: 'Osprey Atmos AG 65 Backpacking Pack', brand: 'Osprey', price: 339.95, rating: 4.8, reviews: 890, discount: 10, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09JXXXXXX' },
    { name: 'Coleman Sundome Camping Dome Tent', brand: 'Coleman', price: 89.99, rating: 4.7, reviews: 45200, discount: 20, img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B004XXXXXX' },
    { name: 'YETI Rambler 30 oz Vacuum Tumbler', brand: 'YETI', price: 38.00, rating: 4.8, reviews: 89600, discount: 0, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B01NXXXXXX' },
    { name: 'Garmin InReach Mini 2 Satellite Communicator', brand: 'Garmin', price: 399.99, rating: 4.7, reviews: 1410, discount: 5, img: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09MXXXXXX' },
    { name: 'Therm-a-Rest NeoAir XLite Sleeping Pad', brand: 'Therm-a-Rest', price: 199.95, rating: 4.6, reviews: 540, discount: 10, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B082XXXXXX' },
    { name: 'LifeStraw Personal Water Filter 3-Pack', brand: 'LifeStraw', price: 49.95, rating: 4.8, reviews: 92400, discount: 20, img: 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B006XXXXXX' },
    { name: 'BioLite CampStove 2+ Wood Cooking Stove', brand: 'BioLite', price: 149.95, rating: 4.6, reviews: 680, discount: 10, img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B08YXXXXXX' },
    { name: 'Black Diamond Storm 500-R Headlamp', brand: 'Black Diamond', price: 74.95, rating: 4.5, reviews: 310, discount: 15, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=60', link: 'https://www.amazon.com/dp/B09MXXXXXX' }
  ]
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB database.');

    // 1. Clean existing products and categories
    console.log('Cleaning existing catalog collection...');
    await Product.deleteMany({});
    await Category.deleteMany({});

    // 2. Create categories and save their mappings
    console.log('Seeding categories...');
    const catMap = new Map();
    for (const cat of categoriesData) {
      const newCat = await Category.create({ name: cat.name, slug: cat.slug });
      catMap.set(cat.name, newCat._id);
      console.log(`  - Category created: ${cat.name}`);
    }

    // 3. Assemble and seed products list (100 items!)
    console.log('Generating 100 products list...');
    const productsToInsert = [];

    Object.entries(productsTemplate).forEach(([catName, prods]) => {
      const catId = catMap.get(catName);
      
      prods.forEach((p, idx) => {
        const itemNum = idx + 1;
        const images = [{
          url: p.img,
          publicId: 'seeder_100_batch'
        }];

        const specs = {
          Model: `${p.brand}-${itemNum}00`,
          Warranty: '1 Year Limited Manufacturer Warranty',
          Origin: 'Imported',
          Stock: 'In Stock'
        };

        productsToInsert.push({
          name: p.name,
          brand: p.brand,
          category: catId,
          price: p.price,
          description: `Premium hands-on laboratory tested ${p.name}. We rated this model highly based on material build, cost efficiency, and performance thresholds under test loads.`,
          longDescription: `### In-Depth Laboratory Test Review\nOur team tested the ${p.name} over a 30-day trial period, running technical benchmarks to analyze durability and speed. Out of all models in the same price range, this item stood out as our top choice.\n\n### Why We Recommend It\n- **Reliability**: Sustained high-intensity workloads without drop-offs.\n- **Premium Build**: Feels sleek and durable.\n- **Value for Money**: Features usually reserved for higher brackets.\n\n### Specifications Verdict\nThe specs sheet holds up to scrutiny. Highly recommended for daily use.`,
          affiliateLink: p.link,
          images,
          rating: p.rating,
          reviewsCount: p.reviews,
          discountPercent: p.discount,
          isEditorsPick: idx % 3 === 0,
          isBestSeller: idx % 4 === 0,
          isTrending: idx % 5 === 0,
          specifications: specs
        });
      });
    });

    console.log(`Inserting ${productsToInsert.length} products to database...`);
    await Product.insertMany(productsToInsert);
    
    console.log('\n--- Seeding 100 Products Finished ---');
    console.log(`Successfully created ${categoriesData.length} categories.`);
    console.log(`Successfully imported ${productsToInsert.length} e-commerce products.`);
    
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Fatal seeder error:', err);
    process.exit(1);
  }
};

seedDatabase();
