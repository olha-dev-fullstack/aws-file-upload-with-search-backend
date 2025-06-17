-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "s3Url" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
