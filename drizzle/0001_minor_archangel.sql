CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`authorName` text NOT NULL,
	`recipient` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notes_owner_idx` ON `notes` (`owner`);--> statement-breakpoint
CREATE INDEX `notes_status_idx` ON `notes` (`status`);