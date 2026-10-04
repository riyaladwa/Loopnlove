/**
 * Loop n Love - Initial Bouquet Catalogue Data
 * Extracted directly from Bouquet(3).pdf
 * Verified photographs and prices mapped exactly as provided.
 *
 * NOTE: As per strict brand requirements:
 * - Temporary catalogue identifiers: Bouquet 01 to Bouquet 13
 * - Authentic prices in INR (₹) matching the PDF order
 * - Real product photographs extracted from the PDF
 * - No AI generated images, no invented prices, no fake reviews
 */

export const INITIAL_PRODUCTS = [
  {
    id: 'bouquet-01',
    name: 'Bouquet 01',
    category: 'Bouquets',
    price: 199,
    image: 'assets/product-images/bouquet_01.jpg',
    images: ['assets/product-images/bouquet_01.jpg'],
    description: 'Handcrafted single crochet flower bouquet in a rich royal blue shade, wrapped in crisp white paper with a matching satin ribbon. Perfect as a delicate keepsake gift.',
    inStock: true,
    stockQuantity: 10,
    featured: true,
    isNewArrival: false,
    pdfPage: 1,
    customizable: true
  },
  {
    id: 'bouquet-02',
    name: 'Bouquet 02',
    category: 'Bouquets',
    price: 399,
    image: 'assets/product-images/bouquet_02.jpg',
    images: ['assets/product-images/bouquet_02.jpg'],
    description: 'Charming pastel pink crochet roses with bud accents, wrapped in rustic mesh burlap and finished with a soft blush ribbon and heart tag.',
    inStock: true,
    stockQuantity: 8,
    featured: true,
    isNewArrival: false,
    pdfPage: 1,
    customizable: true
  },
  {
    id: 'bouquet-03',
    name: 'Bouquet 03',
    category: 'Bouquets',
    price: 399,
    image: 'assets/product-images/bouquet_03.jpg',
    images: ['assets/product-images/bouquet_03.jpg'],
    description: 'Trio of handmade soft pink crochet roses wrapped in natural jute burlap, accented with a sky blue ribbon and a miniature crochet heart keepsake.',
    inStock: true,
    stockQuantity: 8,
    featured: false,
    isNewArrival: true,
    pdfPage: 2,
    customizable: true
  },
  {
    id: 'bouquet-04',
    name: 'Bouquet 04',
    category: 'Bouquets',
    price: 299,
    image: 'assets/product-images/bouquet_04.jpg',
    images: ['assets/product-images/bouquet_04.jpg'],
    description: 'Handmade cream rose paired with a vibrant red crochet heart topper, wrapped in two-tone white and red paper with a bold satin ribbon.',
    inStock: true,
    stockQuantity: 12,
    featured: false,
    isNewArrival: false,
    pdfPage: 3,
    customizable: true
  },
  {
    id: 'bouquet-05',
    name: 'Bouquet 05',
    category: 'Bouquets',
    price: 699,
    image: 'assets/product-images/bouquet_05.jpg',
    images: ['assets/product-images/bouquet_05.jpg'],
    description: 'Vibrant red crochet roses and deep green leaves arranged in an elegant black-and-gold luxury wrap, tied with a golden satin ribbon.',
    inStock: true,
    stockQuantity: 6,
    featured: true,
    isNewArrival: false,
    pdfPage: 3,
    customizable: true
  },
  {
    id: 'bouquet-06',
    name: 'Bouquet 06',
    category: 'Bouquets',
    price: 999,
    image: 'assets/product-images/bouquet_06.jpg',
    images: ['assets/product-images/bouquet_06.jpg'],
    description: 'Generous bouquet of deep red crochet roses nestled closely in matte black packaging and tied with a clean white bow. A grand romantic statement.',
    inStock: true,
    stockQuantity: 5,
    featured: true,
    isNewArrival: false,
    pdfPage: 4,
    customizable: true
  },
  {
    id: 'bouquet-07',
    name: 'Bouquet 07',
    category: 'Bouquets',
    price: 899,
    image: 'assets/product-images/bouquet_07.jpg',
    images: ['assets/product-images/bouquet_07.jpg'],
    description: 'Deluxe red crochet roses accented with delicate floral filler, wrapped in translucent black layered paper with satin ribbon. An exquisite handcrafted centerpiece.',
    inStock: true,
    stockQuantity: 5,
    featured: true,
    isNewArrival: true,
    pdfPage: 4,
    customizable: true
  },
  {
    id: 'bouquet-08',
    name: 'Bouquet 08',
    category: 'Bouquets',
    price: 399,
    image: 'assets/product-images/bouquet_08.jpg',
    images: ['assets/product-images/bouquet_08.jpg'],
    description: 'Trio of cheerful handmade crochet daisies with bright yellow centers and fresh green leaves, wrapped in warm kraft paper with a pastel pink bow.',
    inStock: true,
    stockQuantity: 10,
    featured: false,
    isNewArrival: true,
    pdfPage: 5,
    customizable: true
  },
  {
    id: 'bouquet-09',
    name: 'Bouquet 09',
    category: 'Bouquets',
    price: 499,
    image: 'assets/product-images/bouquet_09.jpg',
    images: ['assets/product-images/bouquet_09.jpg'],
    description: 'Sweet bouquet featuring 4 puffy pink crochet hearts and mini daisies wrapped in soft translucent pink paper with branded satin ribbons.',
    inStock: true,
    stockQuantity: 8,
    featured: false,
    isNewArrival: true,
    pdfPage: 5,
    customizable: true
  },
  {
    id: 'bouquet-10',
    name: 'Bouquet 10',
    category: 'Bouquets',
    price: 599,
    image: 'assets/product-images/bouquet_10.jpg',
    images: ['assets/product-images/bouquet_10.jpg'],
    description: 'Handmade crochet sunflower with friendly crochet bumblebee, daisies, and buds in a soft blush pink wrap tied with a pure white ribbon.',
    inStock: true,
    stockQuantity: 7,
    featured: true,
    isNewArrival: true,
    pdfPage: 6,
    customizable: true
  },
  {
    id: 'bouquet-11',
    name: 'Bouquet 11',
    category: 'Bouquets',
    price: 449,
    image: 'assets/product-images/bouquet_11.jpg',
    images: ['assets/product-images/bouquet_11.jpg'],
    description: 'Trio of graceful lavender crochet tulips accented with small white florets, wrapped in matching purple paper with a silky ribbon.',
    inStock: true,
    stockQuantity: 9,
    featured: false,
    isNewArrival: false,
    pdfPage: 6,
    customizable: true
  },
  {
    id: 'bouquet-12',
    name: 'Bouquet 12',
    category: 'Bouquets',
    price: 449,
    image: 'assets/product-images/bouquet_12.jpg',
    images: ['assets/product-images/bouquet_12.jpg'],
    description: 'Sunny yellow crochet tulips with white blossom accents, wrapped in delicate layered neutral paper with a silver-white bow.',
    inStock: true,
    stockQuantity: 8,
    featured: false,
    isNewArrival: false,
    pdfPage: 7,
    customizable: true
  },
  {
    id: 'bouquet-13',
    name: 'Bouquet 13',
    category: 'Bouquets',
    price: 149,
    image: 'assets/product-images/bouquet_13.jpg',
    images: ['assets/product-images/bouquet_13.jpg'],
    description: 'Single stem handcrafted pink crochet tulip with leafy stem, wrapped in soft rose-pink paper and tied with a gold ribbon. A sweet, thoughtful gesture.',
    inStock: true,
    stockQuantity: 15,
    featured: false,
    isNewArrival: true,
    pdfPage: 7,
    customizable: true
  }
];

export const CATEGORIES = [
  { name: 'Bouquets', count: 13, available: true },
  { name: 'Crochet Flowers', count: 0, available: false },
  { name: 'Bows and Accessories', count: 0, available: false },
  { name: 'Keychains', count: 0, available: false },
  { name: 'Crochet Bags', count: 0, available: false },
  { name: 'Custom Gifts', count: 0, available: false }
];
