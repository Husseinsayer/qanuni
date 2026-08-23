-- CreateTable
CREATE TABLE "AlimonySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'IQD',
    "minAlimonyPercent" REAL NOT NULL DEFAULT 20,
    "maxAlimonyPercent" REAL NOT NULL DEFAULT 50,
    "housingAllowancePercent" REAL NOT NULL DEFAULT 30,
    "educationAllowancePercent" REAL NOT NULL DEFAULT 15,
    "healthcareAllowancePercent" REAL NOT NULL DEFAULT 10,
    "enableAutoCalculation" BOOLEAN NOT NULL DEFAULT true,
    "showLegalBasis" BOOLEAN NOT NULL DEFAULT true,
    "defaultMaritalStatus" TEXT NOT NULL DEFAULT 'married',
    "childAgeLimit" INTEGER NOT NULL DEFAULT 18,
    "childEducationAgeLimit" INTEGER NOT NULL DEFAULT 25,
    "monthlyMinWage" REAL NOT NULL DEFAULT 500000,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AlimonyCalculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL DEFAULT '',
    "payerName" TEXT NOT NULL DEFAULT '',
    "payerIncome" REAL NOT NULL DEFAULT 0,
    "payerIncomeSource" TEXT NOT NULL DEFAULT '',
    "recipientType" TEXT NOT NULL DEFAULT '',
    "recipientCount" INTEGER NOT NULL DEFAULT 1,
    "maritalStatus" TEXT NOT NULL DEFAULT 'married',
    "hasHousing" BOOLEAN NOT NULL DEFAULT false,
    "housingCost" REAL NOT NULL DEFAULT 0,
    "hasEducation" BOOLEAN NOT NULL DEFAULT false,
    "educationCost" REAL NOT NULL DEFAULT 0,
    "hasHealthcare" BOOLEAN NOT NULL DEFAULT false,
    "healthcareCost" REAL NOT NULL DEFAULT 0,
    "specialCircumstances" TEXT NOT NULL DEFAULT '[]',
    "result" TEXT NOT NULL DEFAULT '{}',
    "totalAlimony" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CourtFeeSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'IQD',
    "minFee" REAL NOT NULL DEFAULT 5000,
    "maxFee" REAL NOT NULL DEFAULT 500000,
    "percentageThreshold" REAL NOT NULL DEFAULT 100000000,
    "feeCalculationMethod" TEXT NOT NULL DEFAULT 'percentage',
    "enableReductions" BOOLEAN NOT NULL DEFAULT true,
    "reductionPercent" REAL NOT NULL DEFAULT 50,
    "enableExemptions" BOOLEAN NOT NULL DEFAULT true,
    "socialSecurityExemption" BOOLEAN NOT NULL DEFAULT true,
    "governmentExemption" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CourtFeeCalculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL DEFAULT '',
    "caseType" TEXT NOT NULL DEFAULT '',
    "claimAmount" REAL NOT NULL DEFAULT 0,
    "courtLevel" TEXT NOT NULL DEFAULT '',
    "hasExemption" BOOLEAN NOT NULL DEFAULT false,
    "exemptionType" TEXT NOT NULL DEFAULT '',
    "reductionApplied" BOOLEAN NOT NULL DEFAULT false,
    "result" TEXT NOT NULL DEFAULT '{}',
    "totalFee" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CourtFeeType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "caseType" TEXT NOT NULL DEFAULT 'civil',
    "fixedFee" REAL NOT NULL DEFAULT 0,
    "percentageFee" REAL NOT NULL DEFAULT 0,
    "minFee" REAL NOT NULL DEFAULT 0,
    "maxFee" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LegalConsultationType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "price" REAL NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LegalConsultation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typeId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL DEFAULT '',
    "clientEmail" TEXT NOT NULL DEFAULT '',
    "clientPhone" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lawyerId" TEXT,
    "lawyerName" TEXT NOT NULL DEFAULT '',
    "scheduledDate" DATETIME,
    "response" TEXT NOT NULL DEFAULT '',
    "price" REAL NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT NOT NULL DEFAULT '',
    "rating" INTEGER,
    "feedback" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LegalConsultation_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "LegalConsultationType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LegalConsultationSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "allowOnlineBooking" BOOLEAN NOT NULL DEFAULT true,
    "requirePaymentUpfront" BOOLEAN NOT NULL DEFAULT false,
    "maxFreeConsultations" INTEGER NOT NULL DEFAULT 1,
    "workingHoursStart" TEXT NOT NULL DEFAULT '09:00',
    "workingHoursEnd" TEXT NOT NULL DEFAULT '17:00',
    "workingDays" TEXT NOT NULL DEFAULT '0,1,2,3,6',
    "autoAssignLawyer" BOOLEAN NOT NULL DEFAULT false,
    "sendNotifications" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
