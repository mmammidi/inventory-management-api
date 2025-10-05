import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@inventory.com' },
    update: {},
    create: {
      email: 'admin@inventory.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: {
        name: 'Electronics',
        description: 'Electronic devices and components',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Clothing' },
      update: {},
      create: {
        name: 'Clothing',
        description: 'Apparel and accessories',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Books' },
      update: {},
      create: {
        name: 'Books',
        description: 'Books and publications',
      },
    }),
  ]);

  console.log('✅ Categories created:', categories.map(c => c.name));

  // Create sample suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { name: 'TechCorp Inc.' },
      update: {},
      create: {
        name: 'TechCorp Inc.',
        contactName: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1-555-0123',
        address: '123 Tech Street, Silicon Valley, CA',
      },
    }),
    prisma.supplier.upsert({
      where: { name: 'Fashion World' },
      update: {},
      create: {
        name: 'Fashion World',
        contactName: 'Jane Doe',
        email: 'jane@fashionworld.com',
        phone: '+1-555-0456',
        address: '456 Fashion Ave, New York, NY',
      },
    }),
  ]);

  console.log('✅ Suppliers created:', suppliers.map(s => s.name));

  // Create sample items
  const items = await Promise.all([
    prisma.item.upsert({
      where: { sku: 'LAPTOP-001' },
      update: {},
      create: {
        name: 'Gaming Laptop',
        description: 'High-performance gaming laptop',
        sku: 'LAPTOP-001',
        barcode: '1234567890123',
        price: 1299.99,
        cost: 899.99,
        quantity: 10,
        minQuantity: 2,
        maxQuantity: 50,
        unit: 'pcs',
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.item.upsert({
      where: { sku: 'TSHIRT-001' },
      update: {},
      create: {
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt',
        sku: 'TSHIRT-001',
        barcode: '1234567890124',
        price: 19.99,
        cost: 12.99,
        quantity: 100,
        minQuantity: 20,
        maxQuantity: 500,
        unit: 'pcs',
        categoryId: categories[1].id,
        supplierId: suppliers[1].id,
      },
    }),
    prisma.item.upsert({
      where: { sku: 'BOOK-001' },
      update: {},
      create: {
        name: 'Programming Guide',
        description: 'Complete guide to programming',
        sku: 'BOOK-001',
        barcode: '1234567890125',
        price: 49.99,
        cost: 29.99,
        quantity: 25,
        minQuantity: 5,
        maxQuantity: 100,
        unit: 'pcs',
        categoryId: categories[2].id,
      },
    }),
  ]);

  console.log('✅ Items created:', items.map(i => i.name));

  // Create sample movements
  const movements = await Promise.all([
    prisma.movement.create({
      data: {
        type: 'IN',
        quantity: 10,
        reason: 'Initial stock',
        reference: 'PO-2024-001',
        notes: 'Initial inventory setup',
        itemId: items[0].id,
        userId: adminUser.id,
      },
    }),
    prisma.movement.create({
      data: {
        type: 'IN',
        quantity: 100,
        reason: 'Bulk purchase',
        reference: 'PO-2024-002',
        notes: 'Summer collection stock',
        itemId: items[1].id,
        userId: adminUser.id,
      },
    }),
    prisma.movement.create({
      data: {
        type: 'IN',
        quantity: 25,
        reason: 'New book release',
        reference: 'PO-2024-003',
        notes: 'Latest programming guide',
        itemId: items[2].id,
        userId: adminUser.id,
      },
    }),
  ]);

  console.log('✅ Movements created:', movements.length);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

