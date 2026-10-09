import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

let isTableInitialized = false;

// Ensure search_history table exists in PostgreSQL
async function ensureSearchHistoryTable() {
  if (isTableInitialized) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS search_history (
        id SERIAL PRIMARY KEY,
        query VARCHAR(255) NOT NULL,
        locality VARCHAR(100),
        bhk VARCHAR(100),
        price_range VARCHAR(100),
        intent VARCHAR(50) DEFAULT 'buyer',
        results_count INT DEFAULT 0,
        ip_address VARCHAR(100),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
      CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
    `);

    // Insert initial seed history if table is empty
    const countCheck = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM search_history;`);
    if (countCheck && parseInt(countCheck.count, 10) === 0) {
      const initialSeeds = [
        { q: 'Commercial Office Space', loc: 'Koregaon Park', bhk: 'Commercial Office', intent: 'buyer', count: 5 },
        { q: 'I Want a Buyer for 3 BHK', loc: 'Baner', bhk: '3 BHK', intent: 'seller', count: 0 },
        { q: '3 BHK Apartments in Pune', loc: 'Baner', bhk: '3 BHK', intent: 'buyer', count: 12 },
        { q: 'Baner Luxury Residences', loc: 'Baner', bhk: '3 BHK', intent: 'buyer', count: 8 },
        { q: 'Koregaon Park Buyers', loc: 'Koregaon Park', bhk: 'All', intent: 'seller', count: 4 },
        { q: 'Ready to Move', loc: 'All', bhk: 'All', intent: 'buyer', count: 15 },
        { q: 'Penthouses', loc: 'Balewadi', bhk: '4.5+ BHK Penthouse', intent: 'buyer', count: 3 }
      ];

      for (const s of initialSeeds) {
        await query(
          `INSERT INTO search_history (query, locality, bhk, intent, results_count, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW() - (random() * interval '3 days'))`,
          [s.q, s.loc, s.bhk, s.intent, s.count]
        );
      }
    }

    isTableInitialized = true;
  } catch (err: any) {
    console.error("Failed to initialize search_history table:", err.message);
  }
}

// GET: Returns search history and popular/trending searches
export async function GET(req: NextRequest) {
  try {
    await ensureSearchHistoryTable();
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("q") || "").trim();
    const mode = searchParams.get("mode") || "all"; // 'all' | 'popular'
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // If requested only for popular searches under Hero Search
    if (mode === "popular") {
      const topRows = await query<{ query: string; count: string }>(`
        SELECT TRIM(query) as query, COUNT(*) as count
        FROM search_history
        WHERE TRIM(query) != '' AND LENGTH(TRIM(query)) > 2
        GROUP BY TRIM(query)
        ORDER BY count DESC, MAX(created_at) DESC
        LIMIT 8;
      `);

      let popularQueries = topRows.map((r) => r.query);

      // Default curated backups if DB has few entries
      const defaultBackups = [
        'Commercial Office Space',
        'I Want a Buyer for 3 BHK',
        '3 BHK Apartments in Pune',
        'Baner Luxury Residences',
        'Koregaon Park Buyers',
        'Ready to Move',
        'Penthouses'
      ];

      for (const backup of defaultBackups) {
        if (!popularQueries.some((pq) => pq.toLowerCase() === backup.toLowerCase()) && popularQueries.length < 8) {
          popularQueries.push(backup);
        }
      }

      return NextResponse.json({
        success: true,
        popularSearches: popularQueries
      });
    }

    // Mode: 'all' -> For Admin Panel History Tab
    let historyRows: any[] = [];
    if (filter) {
      historyRows = await query(
        `SELECT id, query, locality, bhk, price_range, intent, results_count, created_at
         FROM search_history
         WHERE query ILIKE $1 OR locality ILIKE $1 OR bhk ILIKE $1 OR intent ILIKE $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [`%${filter}%`, limit]
      );
    } else {
      historyRows = await query(
        `SELECT id, query, locality, bhk, price_range, intent, results_count, created_at
         FROM search_history
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit]
      );
    }

    // Compute metrics for Admin dashboard tab
    const totalCountRow = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM search_history;`);
    const uniqueCountRow = await queryOne<{ count: string }>(`SELECT COUNT(DISTINCT LOWER(TRIM(query))) as count FROM search_history;`);
    const buyerCountRow = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM search_history WHERE intent = 'buyer';`);
    const sellerCountRow = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM search_history WHERE intent = 'seller';`);

    const topAggRows = await query<{ query: string; count: string }>(`
      SELECT TRIM(query) as query, COUNT(*) as count
      FROM search_history
      WHERE TRIM(query) != ''
      GROUP BY TRIM(query)
      ORDER BY count DESC
      LIMIT 6;
    `);

    return NextResponse.json({
      success: true,
      history: historyRows,
      stats: {
        totalSearches: parseInt(totalCountRow?.count || "0", 10),
        uniqueQueries: parseInt(uniqueCountRow?.count || "0", 10),
        buyerSearches: parseInt(buyerCountRow?.count || "0", 10),
        sellerSearches: parseInt(sellerCountRow?.count || "0", 10),
        topSearches: topAggRows.map((r) => ({ query: r.query, count: parseInt(r.count, 10) }))
      }
    });
  } catch (error: any) {
    console.error("GET /api/search-history error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch search history" },
      { status: 500 }
    );
  }
}

// POST: Record a new user search in database
export async function POST(req: NextRequest) {
  try {
    await ensureSearchHistoryTable();
    const body = await req.json();
    const {
      query: searchQuery,
      locality,
      bhk,
      priceRange,
      intent = "buyer",
      resultsCount = 0
    } = body;

    const trimmedQuery = (searchQuery || "").trim();
    if (!trimmedQuery) {
      return NextResponse.json(
        { success: false, error: "Query cannot be empty" },
        { status: 400 }
      );
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const inserted = await queryOne(
      `INSERT INTO search_history (
        query, locality, bhk, price_range, intent, results_count, ip_address, user_agent, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, query, created_at;`,
      [
        trimmedQuery,
        locality && locality !== "All" ? locality : null,
        bhk && bhk !== "All" ? bhk : null,
        priceRange && priceRange !== "All" ? priceRange : null,
        intent,
        Number(resultsCount) || 0,
        clientIp,
        userAgent
      ]
    );

    return NextResponse.json({
      success: true,
      record: inserted
    });
  } catch (error: any) {
    console.error("POST /api/search-history error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record search history" },
      { status: 500 }
    );
  }
}

// DELETE: Delete search history record or clear all
export async function DELETE(req: NextRequest) {
  try {
    await ensureSearchHistoryTable();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    if (clearAll) {
      await query(`TRUNCATE TABLE search_history;`);
      return NextResponse.json({
        success: true,
        message: "Search history cleared successfully"
      });
    }

    if (id) {
      await query(`DELETE FROM search_history WHERE id = $1;`, [parseInt(id, 10)]);
      return NextResponse.json({
        success: true,
        message: "Record deleted successfully"
      });
    }

    return NextResponse.json(
      { success: false, error: "Specify id or all=true" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("DELETE /api/search-history error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete record" },
      { status: 500 }
    );
  }
}
