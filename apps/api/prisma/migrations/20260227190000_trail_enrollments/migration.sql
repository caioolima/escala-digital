-- CreateTable
CREATE TABLE "TrailEnrollment" (
    "userId" TEXT NOT NULL,
    "trailId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrailEnrollment_pkey" PRIMARY KEY ("userId","trailId")
);

-- AddForeignKey
ALTER TABLE "TrailEnrollment" ADD CONSTRAINT "TrailEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrailEnrollment" ADD CONSTRAINT "TrailEnrollment_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "Trail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
