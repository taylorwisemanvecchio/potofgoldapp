-- CreateTable
CREATE TABLE "SubscriptionQuestionnaire" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "shopifyOrderId" TEXT,
    "customerId" TEXT,
    "dogName" TEXT NOT NULL,
    "dogGender" TEXT NOT NULL,
    "dogSize" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "birthday" DATETIME,
    "adoptionDay" DATETIME,
    "toyPreference" TEXT NOT NULL,
    "allergies" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscriptionPlan" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionnaireId" TEXT NOT NULL,
    "fulfillmentId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "productImageUrl" TEXT,
    "rating" INTEGER,
    "comments" TEXT,
    "emailSentAt" DATETIME,
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductFeedback_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "SubscriptionQuestionnaire" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionnaireId" TEXT NOT NULL,
    "monthYear" TEXT NOT NULL,
    "recommendedProducts" TEXT NOT NULL,
    "openAIResponse" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIRecommendation_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "SubscriptionQuestionnaire" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FulfillmentTracking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopifyFulfillmentId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fulfilledAt" DATETIME,
    "feedbackScheduledFor" DATETIME,
    "feedbackSentAt" DATETIME,
    "products" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionQuestionnaire_orderId_key" ON "SubscriptionQuestionnaire"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "AIRecommendation_questionnaireId_monthYear_key" ON "AIRecommendation"("questionnaireId", "monthYear");

-- CreateIndex
CREATE UNIQUE INDEX "FulfillmentTracking_shopifyFulfillmentId_key" ON "FulfillmentTracking"("shopifyFulfillmentId");
