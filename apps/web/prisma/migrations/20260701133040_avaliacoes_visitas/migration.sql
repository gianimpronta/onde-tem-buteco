-- AlterTable: add notaMedia and totalAvaliacoes to Buteco
ALTER TABLE "Buteco" ADD COLUMN "notaMedia" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Buteco" ADD COLUMN "totalAvaliacoes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: add nota and comentario to Visita
ALTER TABLE "Visita" ADD COLUMN "nota" INTEGER;
ALTER TABLE "Visita" ADD COLUMN "comentario" VARCHAR(500);

-- AddCheckConstraint: nota must be between 1 and 5 (only when present)
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_nota_check" CHECK ("nota" IS NULL OR ("nota" >= 1 AND "nota" <= 5));
