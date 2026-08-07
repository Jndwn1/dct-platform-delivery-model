CREATE TABLE `deployment_screens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deploymentId` varchar(32) NOT NULL,
	`screenName` varchar(256) NOT NULL,
	`releaseStatus` enum('Available in QA','Partially Available','Not Included in This Deployment') NOT NULL DEFAULT 'Available in QA',
	`changeType` varchar(64),
	`whatChanged` text,
	`newFunctionality` text,
	`fixesIncluded` text,
	`qaValidationGuidance` text,
	`knownLimitations` text,
	`functionalityNotIncluded` text,
	`dependencies` text,
	`adoWorkItems` text,
	`notes` text,
	`screenshots` text,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deployment_screens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `deployments` ADD `knownLimitations` text;--> statement-breakpoint
ALTER TABLE `deployments` ADD `dependencies` text;--> statement-breakpoint
ALTER TABLE `deployments` ADD `qaConsiderations` text;