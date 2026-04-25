-- =======================================================
-- HikePass Database Schema
-- MySQL
-- Jalankan: mysql -u root -p < prisma/schema.sql
-- =======================================================

CREATE DATABASE IF NOT EXISTS hikepass
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hikepass;

-- =======================================================
-- ENUM equivalents (pakai VARCHAR dengan CHECK jika MySQL 8+)
-- =======================================================

-- Tabel User
CREATE TABLE IF NOT EXISTS `User` (
  `id`          INT              NOT NULL AUTO_INCREMENT,
  `phone`       VARCHAR(20)      NOT NULL,
  `name`        VARCHAR(100)     NULL,
  `role`        ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `mountainId`  INT              NULL,
  `createdAt`   DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_phone_key` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Mountain
CREATE TABLE IF NOT EXISTS `Mountain` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(100) NOT NULL,
  `location`       VARCHAR(200) NOT NULL,
  `province`       VARCHAR(100) NOT NULL,
  `altitude`       INT          NOT NULL,
  `dailyQuota`     INT          NOT NULL,
  `minGroupSize`   INT          NOT NULL DEFAULT 3,
  `maxGroupSize`   INT          NOT NULL DEFAULT 10,
  `pricePerPerson` INT          NOT NULL,
  `description`    TEXT         NULL,
  `imageUrl`       VARCHAR(500) NULL,
  `createdAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Mountain_province_idx` (`province`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Trail
CREATE TABLE IF NOT EXISTS `Trail` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL,
  `mountainId` INT          NOT NULL,
  `isOpen`     TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `Trail_mountainId_idx` (`mountainId`),
  CONSTRAINT `Trail_mountainId_fkey` FOREIGN KEY (`mountainId`) REFERENCES `Mountain` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Booking
CREATE TABLE IF NOT EXISTS `Booking` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `bookingCode`     VARCHAR(30)  NOT NULL,
  `userId`          INT          NOT NULL,
  `mountainId`      INT          NOT NULL,
  `trailId`         INT          NOT NULL,
  `hikingDate`      DATE         NOT NULL,
  `totalMembers`    INT          NOT NULL,
  `totalPrice`      INT          NOT NULL,
  `status`          ENUM('PENDING','WAITING_CONFIRM','PAID','CHECKED_IN','COMPLETED','CANCELLED','EXPIRED')
                                 NOT NULL DEFAULT 'PENDING',
  `paymentProofUrl` VARCHAR(500) NULL,
  `qrToken`         VARCHAR(100) NOT NULL,
  `checkInAt`       DATETIME(3)  NULL,
  `checkOutAt`      DATETIME(3)  NULL,
  `createdAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Booking_bookingCode_key` (`bookingCode`),
  UNIQUE KEY `Booking_qrToken_key` (`qrToken`),
  INDEX `Booking_userId_idx` (`userId`),
  INDEX `Booking_mountainId_idx` (`mountainId`),
  INDEX `Booking_hikingDate_idx` (`hikingDate`),
  INDEX `Booking_status_idx` (`status`),
  CONSTRAINT `Booking_userId_fkey`     FOREIGN KEY (`userId`)     REFERENCES `User`     (`id`),
  CONSTRAINT `Booking_mountainId_fkey` FOREIGN KEY (`mountainId`) REFERENCES `Mountain` (`id`),
  CONSTRAINT `Booking_trailId_fkey`    FOREIGN KEY (`trailId`)    REFERENCES `Trail`    (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel BookingMember
CREATE TABLE IF NOT EXISTS `BookingMember` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `bookingId`     INT          NOT NULL,
  `name`          VARCHAR(100) NOT NULL,
  `nik`           VARCHAR(16)  NOT NULL,
  `phone`         VARCHAR(20)  NOT NULL,
  `isLeader`      TINYINT(1)   NOT NULL DEFAULT 0,
  `ktpImageUrl`   VARCHAR(500) NULL,
  `healthCertUrl` VARCHAR(500) NULL,
  PRIMARY KEY (`id`),
  INDEX `BookingMember_bookingId_idx` (`bookingId`),
  CONSTRAINT `BookingMember_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Closure
CREATE TABLE IF NOT EXISTS `Closure` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `mountainId` INT          NOT NULL,
  `reason`     VARCHAR(200) NOT NULL,
  `startDate`  DATE         NOT NULL,
  `endDate`    DATE         NOT NULL,
  `isActive`   TINYINT(1)   NOT NULL DEFAULT 1,
  `createdAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Closure_mountainId_idx` (`mountainId`),
  INDEX `Closure_startDate_endDate_idx` (`startDate`, `endDate`),
  CONSTRAINT `Closure_mountainId_fkey` FOREIGN KEY (`mountainId`) REFERENCES `Mountain` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel OtpSession
CREATE TABLE IF NOT EXISTS `OtpSession` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `phone`     VARCHAR(20)  NOT NULL,
  `code`      VARCHAR(6)   NOT NULL,
  `expiresAt` DATETIME(3)  NOT NULL,
  `verified`  TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `OtpSession_phone_code_idx` (`phone`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FK untuk User -> Mountain (admin)
ALTER TABLE `User`
  ADD CONSTRAINT `User_mountainId_fkey`
  FOREIGN KEY (`mountainId`) REFERENCES `Mountain` (`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =======================================================
-- SEED DATA
-- =======================================================

-- Gunung Semeru
INSERT INTO `Mountain` (`name`, `location`, `province`, `altitude`, `dailyQuota`, `minGroupSize`, `maxGroupSize`, `pricePerPerson`, `description`, `imageUrl`)
VALUES (
  'Gunung Semeru',
  'Lumajang, Jawa Timur',
  'Jawa Timur',
  3676,
  60,
  3,
  10,
  27500,
  'Gunung Semeru adalah gunung tertinggi di Pulau Jawa dengan ketinggian 3.676 mdpl. Puncaknya bernama Mahameru, yang merupakan simbol tertinggi tanah Jawa dalam mitologi Hindu. Jalur pendakian utama dimulai dari Ranu Pani yang terletak di ketinggian 2.100 mdpl.',
  NULL
);

-- Trail Semeru
INSERT INTO `Trail` (`mountainId`, `name`, `isOpen`) VALUES (1, 'Ranu Pani', 1);

-- Gunung Rinjani
INSERT INTO `Mountain` (`name`, `location`, `province`, `altitude`, `dailyQuota`, `minGroupSize`, `maxGroupSize`, `pricePerPerson`, `description`, `imageUrl`)
VALUES (
  'Gunung Rinjani',
  'Lombok, Nusa Tenggara Barat',
  'Nusa Tenggara Barat',
  3726,
  80,
  3,
  10,
  150000,
  'Gunung Rinjani adalah gunung berapi aktif setinggi 3.726 mdpl yang terletak di Lombok, NTB. Gunung ini merupakan gunung berapi tertinggi kedua di Indonesia dan menjadi salah satu destinasi pendakian paling populer karena keindahan Danau Segara Anak di kalderanya.',
  NULL
);

-- Trail Rinjani
INSERT INTO `Trail` (`mountainId`, `name`, `isOpen`) VALUES
  (2, 'Senaru', 1),
  (2, 'Sembalun', 1);

-- Gunung Merbabu
INSERT INTO `Mountain` (`name`, `location`, `province`, `altitude`, `dailyQuota`, `minGroupSize`, `maxGroupSize`, `pricePerPerson`, `description`, `imageUrl`)
VALUES (
  'Gunung Merbabu',
  'Boyolali, Jawa Tengah',
  'Jawa Tengah',
  3145,
  50,
  3,
  10,
  15000,
  'Gunung Merbabu adalah gunung berapi tipe strato dengan ketinggian 3.145 mdpl di Jawa Tengah. Gunung ini terkenal dengan padang sabana nan luas dan pemandangan matahari terbit yang spektakuler. Terdapat beberapa jalur pendakian populer seperti Selo, Swanting, dan Suwanting.',
  NULL
);

-- Trail Merbabu
INSERT INTO `Trail` (`mountainId`, `name`, `isOpen`) VALUES
  (3, 'Selo', 1),
  (3, 'Swanting', 1);

-- Gunung Prau
INSERT INTO `Mountain` (`name`, `location`, `province`, `altitude`, `dailyQuota`, `minGroupSize`, `maxGroupSize`, `pricePerPerson`, `description`, `imageUrl`)
VALUES (
  'Gunung Prau',
  'Wonosobo, Jawa Tengah',
  'Jawa Tengah',
  2565,
  100,
  2,
  15,
  20000,
  'Gunung Prau setinggi 2.565 mdpl dikenal sebagai "Raja Sabana" di Jawa Tengah. Dari puncaknya, pendaki dapat menikmati pemandangan 360 derajat dengan latar belakang gunung-gunung besar Jawa seperti Sindoro, Sumbing, Merapi, dan Merbabu.',
  NULL
);

-- Trail Prau
INSERT INTO `Trail` (`mountainId`, `name`, `isOpen`) VALUES
  (4, 'Patak Banteng', 1),
  (4, 'Wates', 1);

-- Gunung Gede
INSERT INTO `Mountain` (`name`, `location`, `province`, `altitude`, `dailyQuota`, `minGroupSize`, `maxGroupSize`, `pricePerPerson`, `description`, `imageUrl`)
VALUES (
  'Gunung Gede',
  'Cianjur, Jawa Barat',
  'Jawa Barat',
  2958,
  300,
  2,
  10,
  30000,
  'Gunung Gede (2.958 mdpl) adalah gunung berapi aktif di kawasan TNGP (Taman Nasional Gunung Gede Pangrango), Jawa Barat. Gunung ini merupakan salah satu kawasan konservasi tertua di Indonesia dengan keanekaragaman hayati yang tinggi.',
  NULL
);

-- Trail Gede
INSERT INTO `Trail` (`mountainId`, `name`, `isOpen`) VALUES
  (5, 'Cibodas', 1),
  (5, 'Gunung Putri', 1);
