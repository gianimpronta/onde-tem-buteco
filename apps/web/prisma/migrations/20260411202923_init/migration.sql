-- CreateTable
CREATE TABLE "Buteco" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT,
    "horario" TEXT,
    "petiscoNome" TEXT,
    "petiscoDesc" TEXT,
    "fotoUrl" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buteco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorito" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "butecoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visita" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "butecoId" TEXT NOT NULL,
    "visitadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Buteco_slug_key" ON "Buteco"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Favorito_userId_butecoId_key" ON "Favorito"("userId", "butecoId");

-- CreateIndex
CREATE UNIQUE INDEX "Visita_userId_butecoId_key" ON "Visita"("userId", "butecoId");

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_butecoId_fkey" FOREIGN KEY ("butecoId") REFERENCES "Buteco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_butecoId_fkey" FOREIGN KEY ("butecoId") REFERENCES "Buteco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
