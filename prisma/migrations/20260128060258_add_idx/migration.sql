-- CreateIndex
CREATE INDEX "Avatar_userId_deletedAt_createdAt_idx" ON "Avatar"("userId", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "User_age_idx" ON "User"("age");

-- CreateIndex
CREATE INDEX "Avatar_userId_active_idx" ON "Avatar"("userId")
WHERE "deletedAt" IS NULL;

-- CreateIndex
CREATE INDEX "Avatar_userId_createdAt_desc_active_idx" ON "Avatar"("userId", "createdAt" DESC)
WHERE "deletedAt" IS NULL;

-- CreateIndex
CREATE INDEX "User_age_active_idx" ON "User"("age")
WHERE "deletedAt" IS NULL;
