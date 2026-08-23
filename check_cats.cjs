const { createClient } = require("@libsql/client");
const c = createClient({ url: "file:./dev.db" });

async function main() {
  // Check what the categories table has
  const cats = await c.execute("SELECT id, name FROM Category");
  console.log("=== Categories in DB ===");
  cats.rows.forEach(r => console.log(`  ${r.id} | ${r.name}`));

  // Check law categories
  const lawCats = await c.execute("SELECT DISTINCT category FROM Law WHERE category != ''");
  console.log("\n=== Law category values ===");
  lawCats.rows.forEach(r => console.log(`  ${r.category}`));

  // Check site-config for categories
  const configCats = await c.execute("SELECT value FROM SiteConfig WHERE key = 'categories'");
  console.log("\n=== SiteConfig categories ===");
  configCats.rows.forEach(r => console.log(`  ${r.value}`));

  await c.close();
}

main().catch(e => { console.error(e); process.exit(1); });
