-- CreateTable
CREATE TABLE "CassationDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "year" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL,
    "judgmentType" TEXT NOT NULL DEFAULT '',
    "fullText" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'civil',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Instruction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "year" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL,
    "issuingAuthority" TEXT NOT NULL DEFAULT '',
    "validityStatus" TEXT NOT NULL DEFAULT 'active',
    "fullText" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "year" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "issuingAuthority" TEXT NOT NULL DEFAULT '',
    "scope" TEXT NOT NULL DEFAULT '',
    "fullText" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SitePartner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'Building2',
    "url" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'ShieldCheck',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteTestimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "initials" TEXT NOT NULL DEFAULT '',
    "hue" TEXT NOT NULL DEFAULT 'from-blue-500 to-indigo-600',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteFaq" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InheritanceRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'general',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveFrom" TEXT NOT NULL DEFAULT '',
    "effectiveTo" TEXT NOT NULL DEFAULT '',
    "conditions" TEXT NOT NULL DEFAULT '[]',
    "calculation" TEXT NOT NULL DEFAULT '{}',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InheritanceRuleArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT NOT NULL,
    "lawId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "articleNum" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "InheritanceRuleArticle_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "InheritanceRule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InheritanceTestCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "inputs" TEXT NOT NULL DEFAULT '{}',
    "expected" TEXT NOT NULL DEFAULT '{}',
    "actual" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InheritanceCalculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL DEFAULT '',
    "deceasedGender" TEXT NOT NULL DEFAULT '',
    "deathDate" TEXT NOT NULL DEFAULT '',
    "legalSystem" TEXT NOT NULL DEFAULT '',
    "totalEstate" REAL NOT NULL DEFAULT 0,
    "debts" REAL NOT NULL DEFAULT 0,
    "wills" REAL NOT NULL DEFAULT 0,
    "netEstate" REAL NOT NULL DEFAULT 0,
    "answers" TEXT NOT NULL DEFAULT '{}',
    "result" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "lawyerId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InheritanceHeir" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "calculationId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "relationship" TEXT NOT NULL DEFAULT '',
    "gender" TEXT NOT NULL DEFAULT '',
    "isAlive" BOOLEAN NOT NULL DEFAULT true,
    "isDeceased" BOOLEAN NOT NULL DEFAULT false,
    "deceasedBefore" BOOLEAN NOT NULL DEFAULT false,
    "hasChildren" BOOLEAN NOT NULL DEFAULT false,
    "fraction" TEXT NOT NULL DEFAULT '',
    "percentage" REAL NOT NULL DEFAULT 0,
    "amount" REAL NOT NULL DEFAULT 0,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "excludeReason" TEXT NOT NULL DEFAULT '',
    "legalBasis" TEXT NOT NULL DEFAULT '',
    "ruleIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InheritanceHeir_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "InheritanceCalculation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InheritanceStopCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "condition" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "action" TEXT NOT NULL DEFAULT 'stop',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InheritanceQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "step" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'boolean',
    "options" TEXT NOT NULL DEFAULT '[]',
    "condition" TEXT NOT NULL DEFAULT '',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Law" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "articles" INTEGER NOT NULL DEFAULT 0,
    "updated" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'Scale',
    "color" TEXT NOT NULL DEFAULT '#1E3A8A',
    "category" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'نافذ',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Law" ("articles", "category", "color", "createdAt", "icon", "id", "isActive", "name", "source", "updated", "updatedAt") SELECT "articles", "category", "color", "createdAt", "icon", "id", "isActive", "name", "source", "updated", "updatedAt" FROM "Law";
DROP TABLE "Law";
ALTER TABLE "new_Law" RENAME TO "Law";
CREATE TABLE "new_SiteHero" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "badge" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "titleGradient" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "btnPrimary" TEXT NOT NULL DEFAULT '',
    "btnSecondary" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_SiteHero" ("badge", "btnPrimary", "btnSecondary", "id", "subtitle", "title") SELECT "badge", "btnPrimary", "btnSecondary", "id", "subtitle", "title" FROM "SiteHero";
DROP TABLE "SiteHero";
ALTER TABLE "new_SiteHero" RENAME TO "SiteHero";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
