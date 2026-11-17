CREATE TABLE `sprint_closeout_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportingPeriod` varchar(100) NOT NULL,
	`category` varchar(40) NOT NULL,
	`fileName` varchar(512) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`sizeBytes` int NOT NULL,
	`sha256` varchar(64) NOT NULL,
	`storageKey` text NOT NULL,
	`storageUrl` text NOT NULL,
	`uploadedBy` varchar(256) NOT NULL,
	`createdAtMs` bigint NOT NULL,
	CONSTRAINT `sprint_closeout_sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `closeout_source_identity` UNIQUE(`reportingPeriod`,`category`,`sha256`)
);
