CREATE TABLE `integration_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topic` varchar(64) NOT NULL,
	`question` text NOT NULL,
	`status` enum('open','resolved','deferred') NOT NULL DEFAULT 'open',
	`owner` varchar(128),
	`notes` text,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integration_questions_id` PRIMARY KEY(`id`)
);
