import { User, Category, Supplier, Item, Movement } from '@prisma/client';

export const testUsers: Partial<User>[] = [
  {
    email: 'admin@test.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    isActive: true
  },
  {
    email: 'manager@test.com',
    username: 'manager',
    firstName: 'Manager',
    lastName: 'User',
    role: 'MANAGER',
    isActive: true
  },
  {
    email: 'user@test.com',
    username: 'user',
    firstName: 'Regular',
    lastName: 'User',
    role: 'USER',
    isActive: true
  }
];

export const testCategories: Partial<Category>[] = [
  {
    name: 'Electronics',
    description: 'Electronic devices and components',
    isActive: true
  },
  {
    name: 'Clothing',
    description: 'Apparel and accessories',
    isActive: true
  },
  {
    name: 'Books',
    description: 'Books and publications',
    isActive: true
  }
];

export const testSuppliers: Partial<Supplier>[] = [
  {
    name: 'TechCorp',
    contactName: 'John Smith',
    email: 'john@techcorp.com',
    phone: '555-0101',
    address: '123 Tech Street, Silicon Valley, CA',
    isActive: true
  },
  {
    name: 'Fashion Inc',
    contactName: 'Jane Doe',
    email: 'jane@fashion.com',
    phone: '555-0102',
    address: '456 Fashion Ave, New York, NY',
    isActive: true
  },
  {
    name: 'BookWorld',
    contactName: 'Bob Johnson',
    email: 'bob@bookworld.com',
    phone: '555-0103',
    address: '789 Book Lane, Boston, MA',
    isActive: true
  }
];

export const testItems: Partial<Item>[] = [
  {
    name: 'Laptop Computer',
    description: 'High-performance laptop for business use',
    sku: 'LAPTOP-001',
    barcode: '123456789012',
    price: 1299.99,
    cost: 899.99,
    quantity: 50,
    minQuantity: 5,
    maxQuantity: 200,
    unit: 'pcs',
    isActive: true
  },
  {
    name: 'Cotton T-Shirt',
    description: 'Comfortable cotton t-shirt',
    sku: 'TSHIRT-001',
    barcode: '123456789013',
    price: 19.99,
    cost: 12.99,
    quantity: 200,
    minQuantity: 20,
    maxQuantity: 1000,
    unit: 'pcs',
    isActive: true
  },
  {
    name: 'Programming Book',
    description: 'Learn TypeScript programming',
    sku: 'BOOK-001',
    barcode: '123456789014',
    price: 49.99,
    cost: 29.99,
    quantity: 100,
    minQuantity: 10,
    maxQuantity: 500,
    unit: 'pcs',
    isActive: true
  }
];

export const testMovements: Partial<Movement>[] = [
  {
    type: 'IN',
    quantity: 10,
    reason: 'Initial stock',
    reference: 'INIT-001',
    notes: 'Initial inventory setup',
  },
  {
    type: 'OUT',
    quantity: 5,
    reason: 'Sale',
    reference: 'SALE-001',
    notes: 'Customer purchase',
  },
  {
    type: 'ADJUSTMENT',
    quantity: -2,
    reason: 'Damaged goods',
    reference: 'ADJ-001',
    notes: 'Items damaged during transport',
  }
];

export const invalidTestData = {
  user: {
    email: 'invalid-email',
    username: 'ab', // too short
    firstName: '',
    lastName: '',
    role: 'INVALID_ROLE'
  },
  category: {
    name: '', // empty name
    description: 'A'.repeat(1001) // too long description
  },
  supplier: {
    name: '',
    email: 'invalid-email',
    phone: '123' // too short
  },
  item: {
    name: '',
    sku: '',
    price: -10, // negative price
    cost: -5, // negative cost
    quantity: -1 // negative quantity
  },
  movement: {
    type: 'INVALID_TYPE',
    quantity: 0, // zero quantity
    reason: ''
  }
};
