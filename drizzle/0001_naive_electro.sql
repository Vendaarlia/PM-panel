ALTER TABLE `notes` ADD `author_role` text DEFAULT 'client' NOT NULL;--> statement-breakpoint
ALTER TABLE `notes` ADD `author_name` text DEFAULT 'Client' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `share_token` text NOT NULL;