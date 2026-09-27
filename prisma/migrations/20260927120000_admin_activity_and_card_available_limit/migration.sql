ALTER TABLE `cards`
  ADD COLUMN `available_limit` DECIMAL(12,2) NOT NULL DEFAULT 0;

CREATE TABLE `admin_activities` (
  `id` CHAR(36) NOT NULL,
  `admin_user_id` CHAR(36) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_user_id` CHAR(36) NULL,
  `target_card_id` CHAR(36) NULL,
  `description` VARCHAR(500) NOT NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `admin_activities_admin_user_id_idx`(`admin_user_id`),
  INDEX `admin_activities_target_user_id_idx`(`target_user_id`),
  INDEX `admin_activities_target_card_id_idx`(`target_card_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `admin_activities_admin_user_id_fkey` FOREIGN KEY (`admin_user_id`) REFERENCES `users`(`id`),
  CONSTRAINT `admin_activities_target_user_id_fkey` FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`),
  CONSTRAINT `admin_activities_target_card_id_fkey` FOREIGN KEY (`target_card_id`) REFERENCES `cards`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
