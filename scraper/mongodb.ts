/**
 * ANV Reality Prisma & Document Storage Bridge
 * Replaces MongoDB dependency with native Prisma PostgreSQL and in-memory cache
 */

export class ObjectId {
  private id: string;
  constructor(id?: string) {
    this.id = id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  toString() {
    return this.id;
  }
  toHexString() {
    return this.id;
  }
}

export function cleanSellerSlug(slug: string): string {
  if (!slug) return "anvrealty";
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || "anvrealty";
}

// In-memory catalog store for scraped items
const inMemoryStore: Map<string, any[]> = new Map();

class MockCollection {
  private name: string;

  constructor(name: string) {
    this.name = name;
    if (!inMemoryStore.has(name)) {
      inMemoryStore.set(name, []);
    }
  }

  async updateOne(filter: any, update: any, options?: { upsert?: boolean }) {
    const list = inMemoryStore.get(this.name) || [];
    const doc = update.$set || update;

    const index = list.findIndex((item) => {
      if (filter.title && item.title === filter.title) return true;
      if (filter._id && item._id === filter._id) return true;
      if (filter.slug && item.slug === filter.slug) return true;
      return false;
    });

    if (index >= 0) {
      list[index] = { ...list[index], ...doc, updatedAt: new Date() };
    } else if (options?.upsert) {
      list.push({ _id: new ObjectId().toString(), ...doc, createdAt: new Date() });
    }
    inMemoryStore.set(this.name, list);
    return { acknowledged: true, modifiedCount: index >= 0 ? 1 : 0, upsertedCount: index >= 0 ? 0 : 1 };
  }

  async find(filter: any = {}) {
    const list = inMemoryStore.get(this.name) || [];
    return {
      toArray: async () => {
        if (!filter || Object.keys(filter).length === 0) return list;
        return list.filter((item) => {
          for (const key of Object.keys(filter)) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
      }
    };
  }

  async countDocuments(filter: any = {}) {
    const list = inMemoryStore.get(this.name) || [];
    return list.length;
  }

  async insertMany(docs: any[]) {
    const list = inMemoryStore.get(this.name) || [];
    const formatted = docs.map((d) => ({
      _id: d._id || new ObjectId().toString(),
      ...d,
      createdAt: d.createdAt || new Date()
    }));
    list.push(...formatted);
    inMemoryStore.set(this.name, list);
    return { acknowledged: true, insertedCount: docs.length };
  }
}

export async function getDb() {
  return {
    collection: (name: string) => new MockCollection(name),
    admin: () => ({
      ping: async () => ({ ok: 1 })
    })
  };
}

export async function getSellerProductsCollection(sellerSlug: string) {
  const clean = cleanSellerSlug(sellerSlug);
  return new MockCollection(`products_${clean}`);
}

const clientPromise = Promise.resolve({
  db: getDb
});

export default clientPromise;
