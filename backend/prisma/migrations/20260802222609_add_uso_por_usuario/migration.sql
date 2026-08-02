-- AlterTable
ALTER TABLE "CodigoDescuento" ADD COLUMN     "maxUsosPorUsuario" INTEGER;

-- CreateTable
CREATE TABLE "UsoCodigoDescuento" (
    "id" SERIAL NOT NULL,
    "codigoId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsoCodigoDescuento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsoCodigoDescuento_codigoId_userId_idx" ON "UsoCodigoDescuento"("codigoId", "userId");

-- AddForeignKey
ALTER TABLE "UsoCodigoDescuento" ADD CONSTRAINT "UsoCodigoDescuento_codigoId_fkey" FOREIGN KEY ("codigoId") REFERENCES "CodigoDescuento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
