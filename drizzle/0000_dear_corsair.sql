CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`alias` text NOT NULL,
	`universe` text NOT NULL,
	`details` text NOT NULL,
	`kind` text NOT NULL,
	`photo` text,
	`created` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `entries_owner_idx` ON `entries` (`owner`);