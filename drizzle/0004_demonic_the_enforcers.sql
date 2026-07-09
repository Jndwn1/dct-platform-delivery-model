CREATE TABLE `uat_defects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`defectNumber` varchar(32) NOT NULL,
	`description` text NOT NULL,
	`severity` enum('Critical','High','Medium','Low') NOT NULL DEFAULT 'Medium',
	`priority` enum('P1','P2','P3','P4') NOT NULL DEFAULT 'P2',
	`assignedDeveloper` varchar(128),
	`status` enum('Open','In Progress','Fixed','Closed','Deferred') NOT NULL DEFAULT 'Open',
	`targetFixDate` varchar(16),
	`retestStatus` enum('Pending','Passed','Failed','N/A') NOT NULL DEFAULT 'Pending',
	`daysOpen` int NOT NULL DEFAULT 0,
	`comments` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uat_defects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uat_risks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`risk` text NOT NULL,
	`businessImpact` varchar(32),
	`probability` enum('Critical','High','Medium','Low') NOT NULL DEFAULT 'Medium',
	`mitigation` text,
	`owner` varchar(128),
	`status` varchar(64) DEFAULT 'Open',
	`targetResolution` varchar(16),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uat_risks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uat_test_cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` varchar(32) NOT NULL,
	`epic` varchar(128),
	`feature` varchar(128),
	`story` text,
	`requirementId` varchar(64),
	`configItem` varchar(128),
	`workbookTab` varchar(64),
	`rogerScreen` varchar(128),
	`expectedResult` text,
	`actualResult` text,
	`tester` varchar(128),
	`businessReviewer` varchar(128),
	`priority` enum('Critical','High','Medium','Low') NOT NULL DEFAULT 'Medium',
	`status` enum('Not Started','In Progress','Passed','Failed','Blocked','Deferred','Retest Required','Production Ready') NOT NULL DEFAULT 'Not Started',
	`defectId` varchar(32),
	`retest` int NOT NULL DEFAULT 0,
	`comments` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uat_test_cases_id` PRIMARY KEY(`id`)
);
