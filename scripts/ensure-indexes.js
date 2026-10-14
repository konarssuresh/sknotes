import { MongoClient } from "mongodb";

const NOTES = "notes";
const TAGS = "tags";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const dbName = process.env.MONGODB_DB_NAME;
  const db = dbName ? client.db(dbName) : client.db();

  await db
    .collection(TAGS)
    .createIndex(
      { userId: 1, normalizedName: 1 },
      { unique: true, name: "tags_user_normalizedName_unique" }
    );

  await db
    .collection(NOTES)
    .createIndex(
      { userId: 1, status: 1, updatedAt: -1, _id: -1 },
      { name: "notes_user_status_updatedAt_id" }
    );

  await db
    .collection(NOTES)
    .createIndex({ userId: 1, _id: 1 }, { name: "notes_user_id" });

  await client.close();
  console.log("Application indexes ensured.");
}

main().catch((error) => {
  console.error("Failed to ensure indexes:", error.message);
  process.exit(1);
});
