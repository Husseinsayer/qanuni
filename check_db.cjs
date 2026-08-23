const { createClient } = require("@libsql/client");
const c = createClient({ url: "file:./dev.db" });

async function main() {
  // Check law categories
  const cats = await c.execute("SELECT DISTINCT category FROM Law WHERE category != '' ORDER BY category");
  console.log("=== Law categories in DB ===");
  cats.rows.forEach(r => console.log(" ", r.category));

  // Check categories table
  const dbCats = await c.execute("SELECT * FROM Category ORDER BY name");
  console.log("\n=== Category table ===");
  dbCats.rows.forEach(r => console.log(" ", r.id, "|", r.name));

  // Check site-config for lawTypeVisibility
  const ltv = await c.execute("SELECT * FROM SiteConfig WHERE key = 'lawTypeVisibility'");
  console.log("\n=== lawTypeVisibility ===");
  ltv.rows.forEach(r => console.log(" ", r.key, "=", r.value));

  // Check site-config for registrationEnabled
  const reg = await c.execute("SELECT * FROM SiteConfig WHERE key = 'registrationEnabled'");
  console.log("\n=== registrationEnabled ===");
  reg.rows.forEach(r => console.log(" ", r.key, "=", r.value));

  // Check site-config for lawPageTabs
  const tabs = await c.execute("SELECT * FROM SiteConfig WHERE key = 'lawPageTabs'");
  console.log("\n=== lawPageTabs ===");
  tabs.rows.forEach(r => console.log(" ", r.key, "=", r.value));

  await c.close();
}

main().catch(e => { console.error(e); process.exit(1); });
