CREATE TABLE `ask_buddy_audits` (
  `id` int AUTO_INCREMENT NOT NULL,
  `question` text NOT NULL,
  `currentPagePath` varchar(512),
  `capability` varchar(64),
  `answerStatus` varchar(32) NOT NULL,
  `sourcesJson` text NOT NULL,
  `sourceVersionsJson` text NOT NULL,
  `conflictsJson` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ask_buddy_audits_id` PRIMARY KEY(`id`)
);
