import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function setupAdmin() {
  const targetEmail = (process.env.ADMIN_EMAIL || 'riyaladwa9@gmail.com').toLowerCase().trim();
  const inputPassword = process.argv[2] || process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loop_n_love';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    let user = await User.findOne({ email: targetEmail });

    if (user) {
      user.role = 'admin';
      if (inputPassword) {
        user.password = inputPassword; // User model pre-save hook will hash with bcrypt
        console.log(`Setting new secure administrator password for: ${targetEmail}`);
      } else {
        console.log(`Preserving existing account password for: ${targetEmail}`);
      }
      await user.save();
      console.log(`✓ Successfully updated ${targetEmail} to authorized 'admin' role!`);
    } else {
      const initialPassword = inputPassword || 'AdminPass@2026!';
      user = await User.create({
        name: 'Riya Ladwa',
        email: targetEmail,
        phone: '9876543210',
        password: initialPassword,
        role: 'admin'
      });
      console.log(`✓ Created new administrator account for ${targetEmail}`);
    }

    console.log('✨ Administrator setup completed securely.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error setting up administrator:', err);
    process.exit(1);
  }
}

setupAdmin();
