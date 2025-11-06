-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'OTHER');

-- CreateTable
CREATE TABLE "House" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ownerName" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashTransaction" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(12, 2) NOT NULL,
    "description" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "House_code_key" ON "House"("code");

-- CreateIndex
CREATE INDEX "CashTransaction_houseId_idx" ON "CashTransaction"("houseId");

-- CreateIndex
CREATE INDEX "CashTransaction_transactionDate_idx" ON "CashTransaction"("transactionDate");

-- CreateIndex
CREATE INDEX "CashTransaction_transactionType_idx" ON "CashTransaction"("transactionType");

-- AddForeignKey
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;
