CREATE TABLE `tdc_meeting_recap_jobs` (
	`id` varchar(64) NOT NULL,
	`transcriptFileName` varchar(512) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`fileSizeBytes` int NOT NULL,
	`totalParts` int NOT NULL,
	`uploadedPartsJson` mediumtext NOT NULL,
	`tdcMeetingRecapJobStatus` enum('Uploading','Queued','Running','Complete','Failed') NOT NULL DEFAULT 'Uploading',
	`stage` varchar(128) NOT NULL DEFAULT 'Preparing upload',
	`recapId` int,
	`failureMessage` text,
	`attemptCount` int NOT NULL DEFAULT 0,
	`createdBy` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tdc_meeting_recap_jobs_id` PRIMARY KEY(`id`)
);
