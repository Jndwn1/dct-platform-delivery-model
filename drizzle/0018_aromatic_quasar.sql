ALTER TABLE `tdc_meeting_recap_jobs` ADD `uploadDurationMs` int;--> statement-breakpoint
ALTER TABLE `tdc_meeting_recap_jobs` ADD `uploadCompletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `tdc_meeting_recap_jobs` ADD `uploadMode` varchar(16) DEFAULT 'Multipart' NOT NULL;