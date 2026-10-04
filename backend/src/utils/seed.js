import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const BOUQUET_SEED_DATA = [
  {
    name: 'Bouquet 01',
    identifier: 'bouquet-01',
    category: 'Bouquets',
    price: 199,
    image: 'assets/product-images/bouquet_01.jpg',
    images: ['assets/product-images/bouquet_01.jpg'],
    description: 'Handcrafted single crochet flower bouquet in a rich royal blue shade, wrapped in crisp white paper with a matching satin ribbon. Perfect as a delicate keepsake gift.',
    stockQuantity: 10,
    inStock: true,
    featured: true,
    isNewArrival: false,
    pdfPage: 1,
    customizable: true
  },
  {
    name: 'Bouquet 02',
    identifier: 'bouquet-02',
    category: 'Bouquets',
    price: 399,
    image: 'assets/product-images/bouquet_02.jpg',
    images: ['assets/product-images/bouquet_02.jpg'],
    description: 'Charming pastel pink crochet roses with bud accents, wrapped in rustic mesh burlap and finished with a soft blush ribbon and heart tag.',
    stockQuantity: 8,
    inStock: true,
    featured: true,
    isNewArrival: false,
    pdfPage: 1,
    customizable: true
  },
  {
    name: 'Bouquet 03',
    identifier: 'bouquet-03',
    category: 'Bouquets',
    price: 399,
    image: 'assets/product-images/bouquet_03.jpg',
    images: ['assets/product-images/bouquet_03.jpg'],
    description: 'Trio of handmade soft pink crochet roses wrapped in natural jute burlap, accented with a sky blue ribbon and a miniature crochet heart keepsake.',
    stockQuantity: 8,
    inStock: true,
    featured: false,
    isNewArrival: true,
    pdfPage: 2,
    customizable: true
  },
  {
    name: 'Bouquet 04',
    identifier: 'bouquet-04',
    category: 'Bouquets',
    price: 299,
    image: 'assets/product-images/bouquet_04.jpg',
    images: ['assets/product-images/bouquet_04.jpg'],
    description: 'Handmade cream rose paired with a vibrant red crochet heart topper, wrapped in two-tone white and red paper with a bold satin ribbon.',
    stockQuantity: 12,
    inStock: true,
    featured: false,
    isNewArrival: false,
    pdfPage: 3,
    customizable: true
  },
  {
    name: 'Bouquet 05',
    identifier: 'bouquet-05',
    category: 'Bouquets',
    price: 699,
    image: 'assets/product-images/bouquet_05.jpg',
    images: ['assets/product-images/bouquet_05.jpg'],
    description: 'Vibrant red crochet roses and deep green leaves arranged in an elegant black-and-gold luxury wrap, tied with a golden satin ribbon.',
    stockQuantity: 6,
    inStock: true,
    featured: true,
    isNewArrival: false,
    pdfPage: 3,
    customizable: true
  },
  {
    name: 'Bouquet 06',
    identifier: 'bouquet-06',
    category: 'Bouquets',
    price: 999,
    image: 'assets/product-images/bouquet_06.jpg',
    images: ['assets/product-images/bouquet_06.jpg'],
    description: 'Generous bouquet of deep red crochet roses nestled closely in matte black packaging and tied with a clean white bow. A grand romantic statement.',
    stockQuantity: 5,
    inStock: true,
    featured: true,
    isNewArrival: false,
    pdfPage: 4,
    customizable: true
  },
  {
    name: 'Bouquet 07',
    identifier: 'bouquet-07',
    category: 'Bouquets',
    price: 899,
    image: 'assets/product-images/bouquet_07.jpg',
    images: ['assets/product-images/bouquet_07.jpg'],
    description: 'Deluxe red crochet roses accented with delicate floral filler, wrapped in translucent black layered paper with satin ribbon. An exquisite handcrafted centerpiece.',
    stockQuantity: 5,
    inStock: true,
    featured: true,
    isNewArrival: true,
    pdfPage: 4,
    customizable: true
  },
  {
    name: 'Bouquet 08',
    identifier: 'bouquet-08',
    category: 'Bouquets',
    price: 399,
    image: 'assets/product-images/bouquet_08.jpg',
    images: ['assets/product-images/bouquet_08.jpg'],
    description: 'Trio of cheerful handmade crochet daisies with bright yellow centers and fresh green leaves, wrapped in warm kraft paper with a pastel pink bow.',
    stockQuantity: 10,
    inStock: true,
    featured: false,
    isNewArrival: true,
    pdfPage: 5,
    customizable: true
  },
  {
    name: 'Bouquet 09',
    identifier: 'bouquet-09',
    category: 'Bouquets',
    price: 499,
    image: 'assets/product-images/bouquet_09.jpg',
    images: ['assets/product-images/bouquet_09.jpg'],
    description: 'Sweet bouquet featuring 4 puffy pink crochet hearts and mini daisies wrapped in soft translucent pink paper with branded satin ribbons.',
    stockQuantity: 8,
    inStock: true,
    featured: false,
    isNewArrival: true,
    pdfPage: 5,
    customizable: true
  },
  {
    name: 'Bouquet 10',
    identifier: 'bouquet-10',
    category: 'Bouquets',
    price: 599,
    image: 'assets/product-images/bouquet_10.jpg',
    images: ['assets/product-images/bouquet_10.jpg'],
    description: 'Handmade crochet sunflower with friendly crochet bumblebee, daisies, and buds in a soft blush pink wrap tied with a pure white ribbon.',
    stockQuantity: 7,
    inStock: true,
    featured: true,
    isNewArrival: true,
    pdfPage: 6,
    customizable: true
  },
  {
    name: 'Bouquet 11',
    identifier: 'bouquet-11',
    category: 'Bouquets',
    price: 449,
    image: 'assets/product-images/bouquet_11.jpg',
    images: ['assets/product-images/bouquet_11.jpg'],
    description: 'Trio of graceful lavender crochet tulips accented with small white florets, wrapped in matching purple paper with a silky ribbon.',
    stockQuantity: 9,
    inStock: true,
    featured: false,
    isNewArrival: false,
    pdfPage: 6,
    customizable: true
  },
  {
    name: 'Bouquet 12',
    identifier: 'bouquet-12',
    category: 'Bouquets',
    price: 449,
    image: 'assets/product-images/bouquet_12.jpg',
    images: ['assets/product-images/bouquet_12.jpg'],
    description: 'Sunny yellow crochet tulips with white blossom accents, wrapped in delicate layered neutral paper with a silver-white bow.',
    stockQuantity: 8,
    inStock: true,
    featured: false,
    isNewArrival: false,
    pdfPage: 7,
    customizable: true
  },
  {
    name: 'Bouquet 13',
    identifier: 'bouquet-13',
    category: 'Bouquets',
    price: 149,
    image: 'assets/product-images/bouquet_13.jpg',
    images: ['assets/product-images/bouquet_13.jpg'],
    description: 'Single stem handcrafted pink crochet tulip with leafy stem, wrapped in soft rose-pink paper and tied with a gold ribbon. A sweet, thoughtful gesture.',
    stockQuantity: 15,
    inStock: true,
    featured: false,
    isNewArrival: true,
    pdfPage: 7,
    customizable: true
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loop_n_love';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing products...');
    await Product.deleteMany({});

    console.log(`Inserting ${BOUQUET_SEED_DATA.length} verified bouquets from Bouquet(3).pdf...`);
    const inserted = await Product.insertMany(BOUQUET_SEED_DATA);
    console.log(`✓ Successfully seeded ${inserted.length} authentic bouquet products!`);

    // Ensure initial admin user exists
    const adminEmail = 'admin@loopnlove.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      console.log('Creating initial store administrator account...');
      await User.create({
        name: 'Loop n Love Owner',
        email: adminEmail,
        phone: '9876543210',
        password: 'AdminPassword123!',
        role: 'admin'
      });
      console.log(`✓ Initial Admin created: ${adminEmail} (Password: AdminPassword123!)`);
    } else {
      console.log(`Administrator account (${adminEmail}) already exists.`);
    }

    console.log('✨ Seed process complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
