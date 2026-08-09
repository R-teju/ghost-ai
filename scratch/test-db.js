const { Client } = require("pg");

async function main() {
  const connectionString = "postgres://2237431aecdbbcc5be2f869abd4f355762ce308c22a64eb306575cc3f576ed78:sk_x5AS323wKN5waGSogjUhT@db.prisma.io:5432/postgres?sslmode=require";
  console.log("Connecting to:", connectionString);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query("SELECT NOW()");
    console.log("Result:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

main();
