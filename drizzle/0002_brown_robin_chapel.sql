CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`author_role` text DEFAULT 'client' NOT NULL,
	`author_name` text DEFAULT 'Client' NOT NULL,
	`attachment_url` text,
	`attachment_type` text,
	`attachment_name` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_notes`("id", "content", "author_role", "author_name", "attachment_url", "attachment_type", "attachment_name", "created_at") SELECT "id", "content", "author_role", "author_name", "attachment_url", "attachment_type", "attachment_name", "created_at" FROM `notes`;--> statement-breakpoint
DROP TABLE `notes`;--> statement-breakpoint
ALTER TABLE `__new_notes` RENAME TO `notes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `projects` ADD `slug` text NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `description` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `turso_db_url` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `turso_db_token` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `has_unread` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `last_activity_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);