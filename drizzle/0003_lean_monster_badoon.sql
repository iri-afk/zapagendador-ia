ALTER TABLE `documents` MODIFY COLUMN `s3Key` varchar(500);--> statement-breakpoint
ALTER TABLE `documents` MODIFY COLUMN `s3Url` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `fileData` mediumtext;