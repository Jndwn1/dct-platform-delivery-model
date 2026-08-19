CREATE TABLE `mapping_artifacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artifactType` enum('Master Data','Prior Year Inventory','Approved Crosswalk','Other') NOT NULL,
	`sourceType` enum('Upload','Platform Registered') NOT NULL DEFAULT 'Upload',
	`fileName` varchar(512) NOT NULL,
	`versionLabel` varchar(256) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`storageUrl` varchar(1024) NOT NULL,
	`fieldsJson` text NOT NULL,
	`uploadedBy` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mapping_artifacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mapping_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`originalMasterField` varchar(512) NOT NULL,
	`priorInventoryField` varchar(512),
	`inputCode` varchar(256) NOT NULL DEFAULT 'Not Confirmed',
	`ruleCode` varchar(256) NOT NULL DEFAULT 'Not Confirmed',
	`mappingStatus` enum('Confirmed','Candidate','Ambiguous','No Match','Conflict') NOT NULL,
	`confidence` int NOT NULL DEFAULT 0,
	`evidenceJson` text NOT NULL,
	`reason` text NOT NULL,
	`selectedMapping` varchar(512),
	`reviewStatus` enum('Unreviewed','Confirmed','Rejected','Needs SME Review') NOT NULL DEFAULT 'Unreviewed',
	`reviewedBy` varchar(128),
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mapping_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mapping_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`masterArtifactId` int NOT NULL,
	`priorArtifactId` int NOT NULL,
	`readiness` varchar(32) NOT NULL DEFAULT 'NOT READY',
	`exceptionsJson` text NOT NULL,
	`createdBy` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mapping_sessions_id` PRIMARY KEY(`id`)
);
