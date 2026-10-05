import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const VERIFIED_SEED_DATA = [
  // ==========================================
  // CROCHET FLOWERS & BOUQUETS (13 ITEMS)
  // ==========================================
  {
    name: 'Bouquet 01',
    identifier: 'bouquet-01',
    category: 'Crochet Flowers & Bouquets',
    price: 199,
    image: '/assets/product-images/bouquet_01.jpg',
    images: ['/assets/product-images/bouquet_01.jpg'],
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
    image: '/assets/product-images/bouquet_02.jpg',
    images: ['/assets/product-images/bouquet_02.jpg'],
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
    image: '/assets/product-images/bouquet_03.jpg',
    images: ['/assets/product-images/bouquet_03.jpg'],
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
    image: '/assets/product-images/bouquet_04.jpg',
    images: ['/assets/product-images/bouquet_04.jpg'],
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
    image: '/assets/product-images/bouquet_05.jpg',
    images: ['/assets/product-images/bouquet_05.jpg'],
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
    image: '/assets/product-images/bouquet_06.jpg',
    images: ['/assets/product-images/bouquet_06.jpg'],
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
    image: '/assets/product-images/bouquet_07.jpg',
    images: ['/assets/product-images/bouquet_07.jpg'],
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
    image: '/assets/product-images/bouquet_08.jpg',
    images: ['/assets/product-images/bouquet_08.jpg'],
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
    image: '/assets/product-images/bouquet_09.jpg',
    images: ['/assets/product-images/bouquet_09.jpg'],
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
    image: '/assets/product-images/bouquet_10.jpg',
    images: ['/assets/product-images/bouquet_10.jpg'],
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
    image: '/assets/product-images/bouquet_11.jpg',
    images: ['/assets/product-images/bouquet_11.jpg'],
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
    image: '/assets/product-images/bouquet_12.jpg',
    images: ['/assets/product-images/bouquet_12.jpg'],
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
    image: '/assets/product-images/bouquet_13.jpg',
    images: ['/assets/product-images/bouquet_13.jpg'],
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
    image: '/assets/product-images/hair_01.jpg',
    images: ['/assets/product-images/hair_01.jpg'],
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
    image: '/assets/product-images/hair_02.jpg',
    images: ['/assets/product-images/hair_02.jpg'],
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
    image: '/assets/product-images/hair_03.jpg',
    images: ['/assets/product-images/hair_03.jpg'],
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
    image: '/assets/product-images/hair_04.jpg',
    images: ['/assets/product-images/hair_04.jpg'],
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
    image: '/assets/product-images/hair_05.jpg',
    images: ['/assets/product-images/hair_05.jpg'],
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
    image: '/assets/product-images/hair_06.jpg',
    images: ['/assets/product-images/hair_06.jpg'],
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
    image: '/assets/product-images/hair_07.jpg',
    images: ['/assets/product-images/hair_07.jpg'],
    description: 'Graceful lily of the valley crochet hair bow tie with delicate bell blossoms and green leaves. Signature boutique piece.',
    stockQuantity: 15,
    inStock: true,
    featured: true,
    isNewArrival: true,
    pdfPage: 4,
    customizable: true
  },
  // ==========================================
  // CROCHET BAGS (3 REAL ARTISAN BAGS)
  // ==========================================
  {
    name: 'Sunflower Granny-Square Tote Bag',
    identifier: 'bag-01',
    category: 'Crochet Bags',
    price: 599,
    image: '/assets/product-images/bag_sunflower.jpg',
    images: ['/assets/product-images/bag_sunflower.jpg'],
    description: 'Artisan handcrafted crochet tote bag made of vibrant sunflower granny squares on a natural cream base. Features sturdy comfortable shoulder straps, spacious interior, and authentic boho charm.',
    stockQuantity: 5,
    inStock: true,
    featured: true,
    isNewArrival: true,
    customizable: true
  },
  {
    name: 'Grey Hearts Granny-Square Tote Bag',
    identifier: 'bag-02',
    category: 'Crochet Bags',
    price: 599,
    image: '/assets/product-images/bag_grey_hearts.jpg',
    images: ['/assets/product-images/bag_grey_hearts.jpg'],
    description: 'Elegant handmade crochet tote bag featuring 9 sweet grey heart granny squares set in a crisp white border. Lightweight, durable, and perfect for carrying daily essentials with love.',
    stockQuantity: 6,
    inStock: true,
    featured: true,
    isNewArrival: true,
    customizable: true
  },
  {
    name: 'Pastel Geometric Granny-Square Handbag',
    identifier: 'bag-03',
    category: 'Crochet Bags',
    price: 499,
    image: '/assets/product-images/bag_pastel_fold.jpg',
    images: ['/assets/product-images/bag_pastel_fold.jpg'],
    description: 'Unique origami-fold crochet handbag in delicate pastel green, blush pink, and cream granny squares, complemented by authentic wooden handles and a secure closure.',
    stockQuantity: 4,
    inStock: true,
    featured: false,
    isNewArrival: true,
    customizable: true
  },

  // ==========================================
  // CROCHET KEYCHAINS (10 ITEMS - ₹99 EACH)
  // ==========================================
  {
    name: 'Daisy Flower Crochet Keychain',
    identifier: 'keychain-01',
    category: 'Keychains',
    price: 99,
    image: '/assets/product-images/keychain_daisy.jpg',
    images: ['/assets/product-images/keychain_daisy.jpg'],
    description: 'Delicate white daisy crochet flower with sunny yellow center, matching green leaf charm, and durable keyring.',
    stockQuantity: 15,
    inStock: true,
    featured: true,
    isNewArrival: true,
    customizable: true
  },
  {
    name: 'Twin Cherry Charm Keychain',
    identifier: 'keychain-02',
    category: 'Keychains',
    price: 99,
    image: '/assets/product-images/keychain_cherry.jpg',
    images: ['/assets/product-images/keychain_cherry.jpg'],
    description: 'Charming handmade plump twin red cherries with green stem and leaf, attached to a premium gold keyring.',
    stockQuantity: 12,
    inStock: true,
    featured: true,
    isNewArrival: true,
    customizable: true
  },
  {
    name: 'White Blossom Crochet Keychain',
    identifier: 'keychain-03',
    category: 'Keychains',
    price: 99,
    image: '/assets/product-images/keychain_blossom.jpg',
    images: ['/assets/product-images/keychain_blossom.jpg'],
    description: 'Handcrafted white 5-petal blossom with warm citrus orange center and tender green leaf tag on a silver keyring.',
    stockQuantity: 15,
    inStock: true,
    featured: false,
    isNewArrival: true,
    customizable: true
  },
  {
    name: 'Evil Eye Protection Mandala Keychain',
    identifier: 'keychain-04',
    category: 'Keychains',
    price: 99,
    image: '/assets/product-images/keychain_evil_eye.jpg',
    images: ['/assets/product-images/keychain_evil_eye.jpg'],
    description: 'Handmade protective evil eye talisman crochet motif with turquoise, sunny yellow, and deep green scalloped borders.',
    stockQuantity: 10,
    inStock: true,
    featured: false,
    isNewArrival: true,
    customizable: true
  },
  {
    name: 'Burgundy Velvet Bow Keychain',
    identifier: 'keychain-05',
    category: 'Keychains',
    price: 99,
    image: '/assets/product-images/keychain_burgundy_bow.jpg',
    images: ['/assets/product-images/keychain_burgundy_bow.jpg'],
    description: 'Sophisticated deep burgundy wine textured crochet bow with gold key ring. Adds vintage cottagecore warmth to bags or keys.',
    stockQuantity: 14,
    inStock: true,
    featured: true,
    isNewArrival: true,
    customizable: true
  },
  {
    name: 'Mini Rose Bouquet Bag Charm',
    identifier: 'keychain-06',
    category: 'Keychains',
    price: 99,
    image: '/assets/product-images/keychain_mini_rose_bouquet.jpg',
    images: ['/assets/product-images/keychain_mini_rose_bouquet.jpg'],
    description: 'Detailed miniature bouquet in black textured wrapping with red mini roses and white scalloped border, perfect for backpacks and tote bags.',
    stockQuantity: 10,
    inStock: true,
    featured: true,
    isNewArrival: true,
    customizable: true
  },
  {
    name: 'Sunshine Sunflower Keychain',
    identifier: 'keychain-07',
    category: 'Keychains',
    price: 99,
    image: '/assets/product-images/keychain_sunflower.jpg',
    images: ['/assets/product-images/keychain_sunflower.jpg'],
    description: 'Joyful handcrafted crochet sunflower with chocolate center and bright golden petals. A little ray of daily happiness.',
    stockQuantity: 15,
    inStock: true,
    featured: true,
    isNewArrival: true,
    customizable: true
  },
  {
    name: 'Blue Penguin Amigurumi Keychain',
    identifier: 'keychain-08',
    category: 'Keychains',
    price: 99,
    image: '/assets/product-images/keychain_blue_penguin.jpg',
    images: ['/assets/product-images/keychain_blue_penguin.jpg'],
    description: 'Cute pastel blue baby penguin amigurumi with soft white tummy, yellow beak, and sturdy metal keyring.',
    stockQuantity: 10,
    inStock: true,
    featured: false,
    isNewArrival: true,
    customizable: true
  },
  {
    name: 'Classic Black Penguin Keychain',
    identifier: 'keychain-09',
    category: 'Keychains',
    price: 99,
    image: '/assets/product-images/keychain_black_penguin.jpg',
    images: ['/assets/product-images/keychain_black_penguin.jpg'],
    description: 'Classic black and white baby penguin crochet amigurumi with sunny yellow feet and beak on a durable keyring.',
    stockQuantity: 10,
    inStock: true,
    featured: false,
    isNewArrival: true,
    customizable: true
  },
  {
    name: 'Mini Bouquet Charm Gift Set',
    identifier: 'keychain-10',
    category: 'Keychains',
    price: 99,
    image: '/assets/product-images/keychain_bouquet_gift_set.jpg',
    images: ['/assets/product-images/keychain_bouquet_gift_set.jpg'],
    description: 'Handcrafted mini bouquet charm duo (red rose & pink tulip) lovingly presented with an artisan kraft gift bag and Loop n Love seal.',
    stockQuantity: 8,
    inStock: true,
    featured: false,
    isNewArrival: true,
    customizable: true
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loop_n_love';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // Remove legacy concept bags per user request
    const removedConcepts = await Product.deleteMany({
      $or: [
        { identifier: { $in: ['bag-concept-01', 'bag-concept-02', 'bag-concept-03'] } },
        { isConcept: true }
      ]
    });
    if (removedConcepts.deletedCount > 0) {
      console.log(`✓ Removed ${removedConcepts.deletedCount} legacy concept bags from website database.`);
    }

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
