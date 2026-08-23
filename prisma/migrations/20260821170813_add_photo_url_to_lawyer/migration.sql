-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lawyer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "price" REAL NOT NULL DEFAULT 0,
    "gender" TEXT NOT NULL DEFAULT 'male',
    "languages" TEXT NOT NULL DEFAULT '[]',
    "bio" TEXT NOT NULL DEFAULT '',
    "initials" TEXT NOT NULL DEFAULT '',
    "hue" TEXT NOT NULL DEFAULT 'from-blue-600 to-indigo-700',
    "avatar" TEXT NOT NULL DEFAULT '',
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "telegram" TEXT NOT NULL DEFAULT '',
    "facebook" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "promoted" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lawyer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lawyer" ("avatar", "bio", "city", "createdAt", "experience", "facebook", "gender", "hue", "id", "initials", "instagram", "languages", "name", "online", "price", "promoted", "rating", "reviewCount", "slug", "specialization", "telegram", "updatedAt", "userId", "verified", "whatsapp") SELECT "avatar", "bio", "city", "createdAt", "experience", "facebook", "gender", "hue", "id", "initials", "instagram", "languages", "name", "online", "price", "promoted", "rating", "reviewCount", "slug", "specialization", "telegram", "updatedAt", "userId", "verified", "whatsapp" FROM "Lawyer";
DROP TABLE "Lawyer";
ALTER TABLE "new_Lawyer" RENAME TO "Lawyer";
CREATE UNIQUE INDEX "Lawyer_slug_key" ON "Lawyer"("slug");
CREATE UNIQUE INDEX "Lawyer_userId_key" ON "Lawyer"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
