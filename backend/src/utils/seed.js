import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const VERIFIED_SEED_DATA = [
  // ==========================================
  // CROCHET FLOWERS & BOUQUETS (13 ITEMS)
  // ==========================================
  {
    name: 'Bouquet 01',
    identifier: 'bouquet-01',
    category: 'Crochet Flowers & Bouquets',
    price: 199,
    image: 'assets/product-images/bouquet_01.jpg',
    images: ['assets/product-images/bouquet_01.jpg'],
    description: 'Handcrafted single crochet flower bouquet in a rich royal blue shade, wrapped in crisp white paper with a matching blue satin ribbon.',
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
    category: 'Crochet Flowers & Bouquets',
    price: 399,
    image: 'assets/product-images/bouquet_02.jpg',
    images: ['assets/product-images/bouquet_02.jpg'],
    description: 'Charming pastel pink crochet roses with delicate bud accents, wrapped in rustic mesh burlap and finished with a soft blush ribbon and heart tag.',
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
    category: 'Crochet Flowers & Bouquets',
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
    category: 'Crochet Flowers & Bouquets',
    price: 299,
    image: 'assets/product-images/bouquet_04.jpg',
    images: ['assets/product-images/bouquet_04.jpg'],
    description: 'Handmade cream rose paired with a vibrant red crochet heart topper, wrapped in two-tone white and red paper with a bold red satin ribbon.',
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
    category: 'Crochet Flowers & Bouquets',
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
    category: 'Crochet Flowers & Bouquets',
    price: 999,
    image: 'assets/product-images/bouquet_06.jpg',
    images: ['assets/product-images/bouquet_06.jpg'],
    description: 'Generous cluster of deep red crochet roses nestled closely in matte black packaging and tied with a clean white bow. A grand romantic keepsake.',
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
    category: 'Crochet Flowers & Bouquets',
    price: 899,
    image: 'assets/product-images/bouquet_07.jpg',
    images: ['assets/product-images/bouquet_07.jpg'],
    description: 'Deluxe red crochet roses accented with delicate floral filler, wrapped in translucent black layered paper with ribbon. An exquisite handcrafted centerpiece.',
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
    category: 'Crochet Flowers & Bouquets',
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
    category: 'Crochet Flowers & Bouquets',
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
    category: 'Crochet Flowers & Bouquets',
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
    category: 'Crochet Flowers & Bouquets',
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
    category: 'Crochet Flowers & Bouquets',
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
    category: 'Crochet Flowers & Bouquets',
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
  },

  // ==========================================
  // HAIR ACCESSORIES (7 ITEMS)
  // ==========================================
  {
    name: 'Hair Accessory 01',
    identifier: 'hair-01',
    category: 'Hair Accessories',
    price: 249,
    image: 'assets/product-images/hair_01.jpg',
    images: ['assets/product-images/hair_01.jpg'],
    description: 'Delicate handmade crochet flower hair piece featuring layered petals and flowing white crochet garland tassels with pink tips.',
    stockQuantity: 12,
    inStock: true,
    featured: true,
    isNewArrival: true,
    pdfPage: 1,
    customizable: true
  },
  {
    name: 'Hair Accessory 02',
    identifier: 'hair-02',
    category: 'Hair Accessories',
    price: 149,
    image: 'assets/product-images/hair_02.jpg',
    images: ['assets/product-images/hair_02.jpg'],
    description: 'Handcrafted rose crochet hair clip with twin white crochet tassel drops, offering an elegant traditional touch.',
    stockQuantity: 15,
    inStock: true,
    featured: false,
    isNewArrival: false,
    pdfPage: 1,
    customizable: true
  },
  {
    name: 'Hair Accessory 03',
    identifier: 'hair-03',
    category: 'Hair Accessories',
    price: 199,
    image: 'assets/product-images/hair_03.jpg',
    images: ['assets/product-images/hair_03.jpg'],
    description: 'Vintage-inspired crochet floral head bandana / kerchief in soft cream with dainty pastel pink flowers and green leaf accents.',
    stockQuantity: 10,
    inStock: true,
    featured: true,
    isNewArrival: true,
    pdfPage: 2,
    customizable: true
  },
  {
    name: 'Hair Accessory 04',
    identifier: 'hair-04',
    category: 'Hair Accessories',
    price: 99,
    image: 'assets/product-images/hair_04.jpg',
    images: ['assets/product-images/hair_04.jpg'],
    description: 'Classic handcrafted red crochet bow hair clip made with soft milk cotton yarn. Perfect for half-up hairstyles.',
    stockQuantity: 20,
    inStock: true,
    featured: false,
    isNewArrival: false,
    pdfPage: 2,
    customizable: true
  },
  {
    name: 'Hair Accessory 05',
    identifier: 'hair-05',
    category: 'Hair Accessories',
    price: 149,
    image: 'assets/product-images/hair_05.jpg',
    images: ['assets/product-images/hair_05.jpg'],
    description: 'Adorable handcrafted twin strawberry crochet hair tie with white bow detail. Charming and lightweight.',
    stockQuantity: 15,
    inStock: true,
    featured: true,
    isNewArrival: false,
    pdfPage: 3,
    customizable: true
  },
  {
    name: 'Hair Accessory 06',
    identifier: 'hair-06',
    category: 'Hair Accessories',
    price: 99,
    image: 'assets/product-images/hair_06.jpg',
    images: ['assets/product-images/hair_06.jpg'],
    description: 'Cheerful miniature crochet sunflower hair scrunchie / clip with golden yellow petals and warm cocoa center.',
    stockQuantity: 20,
    inStock: true,
    featured: false,
    isNewArrival: true,
    pdfPage: 3,
    customizable: true
  },
  {
    name: 'Hair Accessory 07',
    identifier: 'hair-07',
    category: 'Hair Accessories',
    price: 149,
    image: 'assets/product-images/hair_07.jpg',
    images: ['assets/product-images/hair_07.jpg'],
    description: 'Graceful lily of the valley crochet hair bow tie with delicate bell blossoms and green leaves. Signature boutique piece.',
    stockQuantity: 15,
    inStock: true,
    featured: true,
    isNewArrival: true,
    pdfPage: 4,
    customizable: true
  },
  // ==========================================
  // CROCHET BAGS — DESIGN CONCEPTS (3 ITEMS)
  // (Proposed made-to-order concepts, ₹500–₹600)
  // ==========================================
  {
    name: 'Daisy Bloom Granny-Square Tote (Concept)',
    identifier: 'bag-concept-01',
    category: 'Crochet Bags',
    price: 550,
    image: 'assets/product-images/concept_bag_01.svg',
    images: ['assets/product-images/concept_bag_01.svg'],
    description: 'Design concept for custom made-to-order requests. Classic granny-square tote featuring cream daisy center motifs, sage green borders, and sturdy double-crochet shoulder straps. Final pricing and custom color palette confirmed upon inquiry.',
    stockQuantity: 0,
    inStock: false,
    featured: false,
    isNewArrival: true,
    isConcept: true,
    conceptNote: 'Proposed design concept. Artisan photos will replace illustrations upon stitch completion.',
    customizable: true
  },
  {
    name: 'Pastel Meadow Patchwork Bag (Concept)',
    identifier: 'bag-concept-02',
    category: 'Crochet Bags',
    price: 580,
    image: 'assets/product-images/concept_bag_02.svg',
    images: ['assets/product-images/concept_bag_02.svg'],
    description: 'Design concept for custom made-to-order requests. Multi-tone pastel squares in lavender, blush, buttercup yellow, and mint green with scalloped edge trim and reinforced base. Final pricing confirmed upon consultation.',
    stockQuantity: 0,
    inStock: false,
    featured: false,
    isNewArrival: true,
    isConcept: true,
    conceptNote: 'Proposed design concept. Artisan photos will replace illustrations upon stitch completion.',
    customizable: true
  },
  {
    name: 'Vintage Sunburst Crossbody Bag (Concept)',
    identifier: 'bag-concept-03',
    category: 'Crochet Bags',
    price: 520,
    image: 'assets/product-images/concept_bag_03.svg',
    images: ['assets/product-images/concept_bag_03.svg'],
    description: 'Design concept for custom made-to-order requests. Compact boho crossbody bag constructed from 4 vibrant sunburst granny motifs with wooden button clasp and braided strap. Final pricing confirmed upon consultation.',
    stockQuantity: 0,
    inStock: false,
    featured: false,
    isNewArrival: true,
    isConcept: true,
    conceptNote: 'Proposed design concept. Artisan photos will replace illustrations upon stitch completion.',
    customizable: true
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loop_n_love';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Updating product records safely without dropping orders...');
    
    let updatedCount = 0;
    for (const prod of VERIFIED_SEED_DATA) {
      await Product.findOneAndUpdate(
        { identifier: prod.identifier },
        { $set: prod },
        { upsert: true, new: true }
      );
      updatedCount++;
    }

    console.log(`✓ Successfully updated/upserted ${updatedCount} verified products in MongoDB!`);

    // Ensure authorized owner admin account
    const ownerEmail = 'riyaladwa9@gmail.com';
    let ownerUser = await User.findOne({ email: ownerEmail });
    if (ownerUser) {
      ownerUser.role = 'admin';
      await ownerUser.save();
      console.log(`✓ Store owner account (${ownerEmail}) verified with admin role.`);
    }

    // Ensure secondary admin account if needed
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
      console.log(`✓ Initial Admin created: ${adminEmail}`);
    }

    console.log('✨ Seed and update complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
