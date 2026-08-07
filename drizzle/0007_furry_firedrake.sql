ALTER TABLE `qa_deployments` ADD `screenChanges` text;--> statement-breakpoint
ALTER TABLE `qa_deployments` ADD `whatChanged` text;--> statement-breakpoint
ALTER TABLE `qa_deployments` ADD `qaTestInstructions` text;--> statement-breakpoint
ALTER TABLE `qa_deployments` ADD `expectedResults` text;--> statement-breakpoint
ALTER TABLE `qa_deployments` ADD `knownIssues` text;--> statement-breakpoint
ALTER TABLE `qa_deployments` ADD `backendChanges` text;--> statement-breakpoint
ALTER TABLE `qa_deployments` ADD `validationStatus` varchar(32) DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE `qa_deployments` ADD `validatedBy` varchar(128);--> statement-breakpoint
ALTER TABLE `qa_deployments` ADD `validationDate` varchar(16);--> statement-breakpoint
ALTER TABLE `qa_deployments` ADD `validationNotes` text;--> statement-breakpoint
ALTER TABLE `qa_deployments` ADD `releaseNotesStatus` varchar(32) DEFAULT 'Draft';