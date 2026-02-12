-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DONOR', 'HOSPITAL', 'NGO', 'ADMIN');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM (
    'A_POSITIVE',
    'A_NEGATIVE',
    'B_POSITIVE',
    'B_NEGATIVE',
    'AB_POSITIVE',
    'AB_NEGATIVE',
    'O_POSITIVE',
    'O_NEGATIVE'
);

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

--------------------------------------------------
-- CreateTable User
--------------------------------------------------
CREATE TABLE
    "User" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" "UserRole" NOT NULL DEFAULT 'DONOR',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User" ("email");

--------------------------------------------------
-- CreateTable DonorProfile
--------------------------------------------------
CREATE TABLE
    "DonorProfile" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "bloodGroup" "BloodGroup" NOT NULL,
        "lastDonationDate" TIMESTAMP(3),
        "latitude" DOUBLE PRECISION,
        "longitude" DOUBLE PRECISION,
        "phone" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "DonorProfile_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "DonorProfile_userId_key" ON "DonorProfile" ("userId");

--------------------------------------------------
-- CreateTable HospitalProfile
--------------------------------------------------
CREATE TABLE
    "HospitalProfile" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "latitude" DOUBLE PRECISION,
        "longitude" DOUBLE PRECISION,
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "HospitalProfile_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "HospitalProfile_userId_key" ON "HospitalProfile" ("userId");

--------------------------------------------------
-- CreateTable NGOProfile
--------------------------------------------------
CREATE TABLE
    "NGOProfile" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "organizationName" TEXT NOT NULL,
        "description" TEXT,
        "phone" TEXT,
        "address" TEXT,
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "NGOProfile_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "NGOProfile_userId_key" ON "NGOProfile" ("userId");

--------------------------------------------------
-- CreateTable Inventory
--------------------------------------------------
CREATE TABLE
    "Inventory" (
        "id" TEXT NOT NULL,
        "hospitalId" TEXT NOT NULL,
        "bloodGroup" "BloodGroup" NOT NULL,
        "units" INTEGER NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_hospitalId_bloodGroup_key" ON "Inventory" ("hospitalId", "bloodGroup");

--------------------------------------------------
-- CreateTable BloodRequest
--------------------------------------------------
CREATE TABLE
    "BloodRequest" (
        "id" TEXT NOT NULL,
        "hospitalId" TEXT NOT NULL,
        "bloodGroup" "BloodGroup" NOT NULL,
        "unitsRequired" INTEGER NOT NULL,
        "details" TEXT,
        "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "BloodRequest_pkey" PRIMARY KEY ("id")
    );

--------------------------------------------------
-- CreateTable RequestResponse
--------------------------------------------------
CREATE TABLE
    "RequestResponse" (
        "id" TEXT NOT NULL,
        "requestId" TEXT NOT NULL,
        "donorId" TEXT NOT NULL,
        "status" "ResponseStatus" NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RequestResponse_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "RequestResponse_requestId_donorId_key" ON "RequestResponse" ("requestId", "donorId");

--------------------------------------------------
-- CreateTable DonationHistory
--------------------------------------------------
CREATE TABLE
    "DonationHistory" (
        "id" TEXT NOT NULL,
        "donorId" TEXT NOT NULL,
        "hospitalId" TEXT NOT NULL,
        "donationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "units" INTEGER NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DonationHistory_pkey" PRIMARY KEY ("id")
    );

--------------------------------------------------
-- CreateTable Campaign
--------------------------------------------------
CREATE TABLE
    "Campaign" (
        "id" TEXT NOT NULL,
        "ngoId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "location" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
    );

--------------------------------------------------
-- CreateTable Notification
--------------------------------------------------
CREATE TABLE
    "Notification" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
    );

--------------------------------------------------
-- Foreign Keys
--------------------------------------------------
ALTER TABLE "DonorProfile" ADD CONSTRAINT "DonorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HospitalProfile" ADD CONSTRAINT "HospitalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NGOProfile" ADD CONSTRAINT "NGOProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "HospitalProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "HospitalProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RequestResponse" ADD CONSTRAINT "RequestResponse_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BloodRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RequestResponse" ADD CONSTRAINT "RequestResponse_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "DonorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DonationHistory" ADD CONSTRAINT "DonationHistory_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "DonorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DonationHistory" ADD CONSTRAINT "DonationHistory_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "HospitalProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGOProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;