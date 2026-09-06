/*
  Warnings:

  - You are about to drop the column `createdAt` on the `halls` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `halls` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `halls` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to drop the column `ageRating` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `durationMin` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `posterUrl` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `hallId` on the `seats` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `seats` table. All the data in the column will be lost.
  - You are about to drop the column `row` on the `seats` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.
  - You are about to drop the `order_seats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `showtimes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[hall_id,row_number,seat_number]` on the table `seats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `duration_minutes` to the `movies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `movies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hall_id` to the `seats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `row_number` to the `seats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seat_number` to the `seats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order_seats` DROP FOREIGN KEY `order_seats_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `order_seats` DROP FOREIGN KEY `order_seats_seatId_fkey`;

-- DropForeignKey
ALTER TABLE `order_seats` DROP FOREIGN KEY `order_seats_showtimeId_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_showtimeId_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_userId_fkey`;

-- DropForeignKey
ALTER TABLE `seats` DROP FOREIGN KEY `seats_hallId_fkey`;

-- DropForeignKey
ALTER TABLE `showtimes` DROP FOREIGN KEY `showtimes_hallId_fkey`;

-- DropForeignKey
ALTER TABLE `showtimes` DROP FOREIGN KEY `showtimes_movieId_fkey`;

-- DropIndex
DROP INDEX `halls_number_key` ON `halls`;

-- DropIndex
DROP INDEX `seats_hallId_idx` ON `seats`;

-- DropIndex
DROP INDEX `seats_hallId_row_number_key` ON `seats`;

-- AlterTable
ALTER TABLE `halls` DROP COLUMN `createdAt`,
    DROP COLUMN `number`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `name` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `movies` DROP COLUMN `ageRating`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `durationMin`,
    DROP COLUMN `genre`,
    DROP COLUMN `isActive`,
    DROP COLUMN `language`,
    DROP COLUMN `posterUrl`,
    DROP COLUMN `rating`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `duration_minutes` INTEGER NOT NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `poster_url` VARCHAR(500) NULL,
    ADD COLUMN `release_date` DATE NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `title` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `seats` DROP COLUMN `hallId`,
    DROP COLUMN `number`,
    DROP COLUMN `row`,
    ADD COLUMN `hall_id` INTEGER NOT NULL,
    ADD COLUMN `row_number` INTEGER NOT NULL,
    ADD COLUMN `seat_number` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `name` VARCHAR(150) NOT NULL,
    MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE `order_seats`;

-- DropTable
DROP TABLE `orders`;

-- DropTable
DROP TABLE `showtimes`;

-- CreateTable
CREATE TABLE `genres` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `genres_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movie_genres` (
    `movie_id` INTEGER NOT NULL,
    `genre_id` INTEGER NOT NULL,

    PRIMARY KEY (`movie_id`, `genre_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `screenings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `movie_id` INTEGER NOT NULL,
    `hall_id` INTEGER NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `screenings_movie_id_idx`(`movie_id`),
    INDEX `screenings_hall_id_idx`(`hall_id`),
    INDEX `screenings_start_time_idx`(`start_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `screening_id` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `total_price` DECIMAL(10, 2) NOT NULL,
    `guest_name` VARCHAR(150) NULL,
    `guest_email` VARCHAR(255) NULL,
    `guest_phone` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `bookings_user_id_idx`(`user_id`),
    INDEX `bookings_screening_id_idx`(`screening_id`),
    INDEX `bookings_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_seats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `screening_id` INTEGER NOT NULL,
    `seat_id` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,

    INDEX `booking_seats_booking_id_idx`(`booking_id`),
    INDEX `booking_seats_seat_id_idx`(`seat_id`),
    UNIQUE INDEX `booking_seats_screening_id_seat_id_key`(`screening_id`, `seat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `movies_is_active_idx` ON `movies`(`is_active`);

-- CreateIndex
CREATE INDEX `seats_hall_id_idx` ON `seats`(`hall_id`);

-- CreateIndex
CREATE UNIQUE INDEX `seats_hall_id_row_number_seat_number_key` ON `seats`(`hall_id`, `row_number`, `seat_number`);

-- AddForeignKey
ALTER TABLE `movie_genres` ADD CONSTRAINT `movie_genres_movie_id_fkey` FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movie_genres` ADD CONSTRAINT `movie_genres_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seats` ADD CONSTRAINT `seats_hall_id_fkey` FOREIGN KEY (`hall_id`) REFERENCES `halls`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `screenings` ADD CONSTRAINT `screenings_movie_id_fkey` FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `screenings` ADD CONSTRAINT `screenings_hall_id_fkey` FOREIGN KEY (`hall_id`) REFERENCES `halls`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_screening_id_fkey` FOREIGN KEY (`screening_id`) REFERENCES `screenings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_seats` ADD CONSTRAINT `booking_seats_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_seats` ADD CONSTRAINT `booking_seats_screening_id_fkey` FOREIGN KEY (`screening_id`) REFERENCES `screenings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_seats` ADD CONSTRAINT `booking_seats_seat_id_fkey` FOREIGN KEY (`seat_id`) REFERENCES `seats`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
