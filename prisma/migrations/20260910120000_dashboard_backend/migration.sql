ALTER TABLE `cards`
  ADD COLUMN `expiration_month` INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN `expiration_year` INTEGER NOT NULL DEFAULT 2099,
  ADD COLUMN `credit_limit` DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN `used_limit` DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN `status` ENUM('active','locked','expired','removed') NOT NULL DEFAULT 'active';

ALTER TABLE `simulations`
  ADD COLUMN `operation_code` VARCHAR(20) NOT NULL,
  ADD COLUMN `card_id` CHAR(36) NOT NULL,
  ADD COLUMN `bank_id` INTEGER NOT NULL,
  ADD COLUMN `currency` VARCHAR(3) NOT NULL DEFAULT 'PEN',
  ADD COLUMN `status` ENUM('pending','converted','cancelled') NOT NULL DEFAULT 'pending';
CREATE UNIQUE INDEX `simulations_operation_code_key` ON `simulations`(`operation_code`);
CREATE INDEX `simulations_card_id_idx` ON `simulations`(`card_id`);
ALTER TABLE `simulations` ADD CONSTRAINT `simulations_card_id_fkey` FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`);
ALTER TABLE `simulations` ADD CONSTRAINT `simulations_bank_id_fkey` FOREIGN KEY (`bank_id`) REFERENCES `banks`(`id`);

CREATE TABLE `withdrawals` (
  `id` CHAR(36) NOT NULL,
  `simulation_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `status` ENUM('pending','reviewing','approved','rejected','completed','cancelled') NOT NULL DEFAULT 'pending',
  `reason` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `withdrawals_simulation_id_key`(`simulation_id`),
  INDEX `withdrawals_user_id_idx`(`user_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `withdrawals_simulation_id_fkey` FOREIGN KEY (`simulation_id`) REFERENCES `simulations`(`id`),
  CONSTRAINT `withdrawals_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `status_history` (
  `id` CHAR(36) NOT NULL,
  `withdrawal_id` CHAR(36) NOT NULL,
  `status` ENUM('pending','reviewing','approved','rejected','completed','cancelled') NOT NULL,
  `reason` VARCHAR(255) NULL,
  `changed_by` CHAR(36) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `status_history_withdrawal_id_idx`(`withdrawal_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `status_history_withdrawal_id_fkey` FOREIGN KEY (`withdrawal_id`) REFERENCES `withdrawals`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `status_history` ADD CONSTRAINT `status_history_changed_by_fkey` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`);

CREATE TABLE `notifications` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `message` VARCHAR(500) NOT NULL,
  `read_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `notifications_user_id_read_at_idx`(`user_id`, `read_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `password_reset_tokens` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `token_hash` VARCHAR(128) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `used_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `password_reset_tokens_token_hash_key`(`token_hash`),
  INDEX `password_reset_tokens_user_id_idx`(`user_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `password_reset_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
