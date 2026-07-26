-- CreateTable
CREATE TABLE "DailyGameModeMetrics" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "gameMode" TEXT NOT NULL,
    "starts" INTEGER NOT NULL DEFAULT 0,
    "guesses" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "totalGuessesToWin" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyGameModeMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPageMetrics" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "path" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyPageMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyGameModeMetrics_date_gameMode_key" ON "DailyGameModeMetrics"("date", "gameMode");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPageMetrics_date_path_key" ON "DailyPageMetrics"("date", "path");
