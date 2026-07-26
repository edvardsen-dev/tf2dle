-- CreateTable
CREATE TABLE "AdminSettings" (
    "id" INTEGER NOT NULL,
    "metricsLoggingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

-- Seed singleton admin settings row
INSERT INTO "AdminSettings" ("id", "metricsLoggingEnabled", "updatedAt")
VALUES (1, true, CURRENT_TIMESTAMP);
