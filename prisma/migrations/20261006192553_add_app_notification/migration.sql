-- CreateTable
CREATE TABLE "public"."AppNotification" (
    "id" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "AppNotification_pkey" PRIMARY KEY ("id")
);
