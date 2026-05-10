-- MySQL compatible dump
SET FOREIGN_KEY_CHECKS = 0;

-- Table structures
CREATE TABLE IF NOT EXISTS `shops` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `domain` VARCHAR(255),
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `trial_ends_at` DATETIME,
  `gst_number` VARCHAR(255),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `deleted_at` DATETIME,
  UNIQUE INDEX `shops_domain_unique` (`domain`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `email_verified_at` DATETIME,
  `password` VARCHAR(255) NOT NULL,
  `remember_token` VARCHAR(255),
  `shop_id` INT,
  `is_super_admin` TINYINT(1) NOT NULL DEFAULT '0',
  `mobile` VARCHAR(255),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `deleted_at` DATETIME,
  UNIQUE INDEX `users_email_unique` (`email`),
  UNIQUE INDEX `users_mobile_unique` (`mobile`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `shop_id` INT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `deleted_at` DATETIME,
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `shop_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255),
  `email` VARCHAR(255),
  `address` TEXT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `deleted_at` DATETIME,
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `category_id` INT NOT NULL,
  `supplier_id` INT,
  `shop_id` INT,
  `name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `purchase_price` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `selling_price` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `quantity` INT NOT NULL DEFAULT '0',
  `min_stock_alert` INT NOT NULL DEFAULT '5',
  `unit` VARCHAR(50) NOT NULL DEFAULT 'piece',
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `deleted_at` DATETIME,
  UNIQUE INDEX `products_sku_unique` (`sku`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `bills` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `shop_id` INT,
  `bill_number` VARCHAR(255) NOT NULL,
  `customer_name` VARCHAR(255),
  `customer_phone` VARCHAR(255),
  `customer_address` TEXT,
  `subtotal` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `discount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `tax` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `tax_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `total` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `paid_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `due_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'cash',
  `status` VARCHAR(50) NOT NULL DEFAULT 'paid',
  `notes` TEXT,
  `is_gst` TINYINT(1) NOT NULL DEFAULT '0',
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `deleted_at` DATETIME,
  UNIQUE INDEX `bills_shop_id_bill_number_unique` (`shop_id`, `bill_number`),
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `bill_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `bill_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `shop_id` INT,
  `product_name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(15,2) NOT NULL,
  `quantity` INT NOT NULL,
  `discount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `total` DECIMAL(15,2) NOT NULL,
  `description` TEXT,
  `unit` VARCHAR(50),
  `created_at` DATETIME,
  `updated_at` DATETIME,
  FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Data Insertion
INSERT INTO `shops` (`id`, `name`, `domain`, `is_active`, `created_at`, `updated_at`, `trial_ends_at`, `gst_number`, `deleted_at`) VALUES 
(1,'Default Hardware Shop','default.localhost',1,'2026-05-02 10:53:37','2026-05-02 10:53:37',NULL,NULL,NULL),
(2,'teset',NULL,1,'2026-05-02 11:06:10','2026-05-10 04:48:06','2027-06-01 11:06:10','ASDF12345DFASDAS',NULL),
(3,'asdasd',NULL,1,'2026-05-09 19:41:25','2026-05-10 04:11:46','2026-07-08 19:41:25','asdasdasd',NULL);

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `shop_id`, `is_super_admin`, `mobile`, `deleted_at`) VALUES 
(1,'vineet','vineet@gmail.com',NULL,'$2y$12$65jNUYEYiTiAk8TdJA85uOd3rvsUPBHCVFLJaI2fzAtHtC77LKFO2',NULL,'2026-05-02 11:06:10','2026-05-02 12:24:49',2,1,'9169704496',NULL),
(2,'vineet','vin@gmaill.com',NULL,'$2y$12$lteC6K8DebrvM2GjdnkHBedjPdEFj8B4W2PEEbpQCaXjbTKuZR7G6',NULL,'2026-05-09 19:41:26','2026-05-09 19:41:26',3,0,'7398222389',NULL);

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`, `updated_at`, `shop_id`, `deleted_at`) VALUES 
(1,'Paints & Chemical','Wall paints, primer, putty','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL),
(2,'Plumbing','Pipes, taps, fittings','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL),
(3,'Electricals','Wires, switches, boards','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL),
(4,'Tools','Hammers, drills, screwdrivers','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL),
(5,'asdasd',NULL,'2026-05-04 05:56:33','2026-05-04 05:56:33',2,NULL),
(6,'Plumbing',NULL,'2026-05-05 10:31:01','2026-05-05 10:31:01',2,NULL),
(7,'kkkk',NULL,'2026-05-09 19:49:27','2026-05-09 19:49:27',3,NULL),
(8,'Construction','Cement, Bricks, Sand','2026-05-09 19:58:39','2026-05-09 19:58:39',1,NULL),
(9,'Hardware','Nails, screws, hinges','2026-05-09 19:58:39','2026-05-09 19:58:39',1,NULL),
(10,'Nhj',NULL,'2026-05-09 20:58:11','2026-05-09 20:58:11',3,NULL);

INSERT INTO `suppliers` (`id`, `shop_id`, `name`, `phone`, `email`, `address`, `created_at`, `updated_at`, `deleted_at`) VALUES 
(1,2,'asdasd','12344567','asdasdasdasdasd@gmail.com','asdasdasdasdasd','2026-05-04 05:56:13','2026-05-04 05:56:13',NULL),
(2,3,'komal','123456','komal@gmail.com','asdasdasd.,a.s,d.asd','2026-05-09 19:49:08','2026-05-09 19:49:08',NULL),
(3,1,'BuildTech Global Suppliers','9876543210','contact@buildtech.com','123 Industrial Area, Phase 1','2026-05-09 19:58:39','2026-05-09 19:58:39',NULL);

INSERT INTO `products` (`id`, `category_id`, `name`, `sku`, `description`, `purchase_price`, `selling_price`, `quantity`, `min_stock_alert`, `unit`, `created_at`, `updated_at`, `shop_id`, `supplier_id`, `deleted_at`) VALUES 
(1,1,'Asian Paints Apex 20L','SKU-DBWSSX',NULL,3200,3600,15,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL),
(2,1,'Wall Putty 40kg','SKU-SZJPAZ',NULL,650,750,30,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL),
(3,2,'PVC Pipe 1.5 inch','SKU-FRTZZX',NULL,120,150,100,10,'meter','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL),
(4,2,'Steel Tap Heavy','SKU-U5MJ0S',NULL,250,350,45,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL),
(5,3,'Copper Wire 1.5 sq mm Bundle','SKU-U5JRAH',NULL,1400,1700,20,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL),
(6,3,'Modular Switch 6A','SKU-SDGDFP',NULL,35,50,200,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL),
(7,4,'Drill Machine 500W','SKU-EGZ5VB',NULL,1500,1900,5,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL),
(8,5,'wtie','SKU-EGHBENIU',NULL,1000,2000,106,5,'piece','2026-05-04 05:56:46','2026-05-10 07:28:22',2,1,NULL),
(9,6,'kkasd','SKU-OHMD4TUP',NULL,200,400,91,5,'meter','2026-05-05 10:31:35','2026-05-10 07:48:05',2,1,NULL),
(10,7,'ploo','SKU-ZQ43MCF3',NULL,100,200,99,5,'meter','2026-05-09 19:49:45','2026-05-09 20:01:23',3,2,NULL),
(11,8,'UltraTech Cement 50kg','SKU-U32TTX',NULL,380,410,500,10,'bag','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
(12,8,'Red Bricks (Premium)','SKU-SUMZKN',NULL,6,8,10000,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
(13,8,'River Sand (Tractor Load)','SKU-0VIQ6J',NULL,2500,3200,20,10,'load','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
(14,2,'Sintex Water Tank 1000L','SKU-R63ZME',NULL,4500,5200,15,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
(15,2,'CPVC Pipe 1\" (3m)','SKU-GVLNOL',NULL,280,340,120,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
(16,2,'Brass Bib Cock','SKU-GVSSYJ',NULL,180,250,50,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
(17,9,'Iron Nails 2 Inch (1kg)','SKU-KGZCEQ',NULL,70,100,80,10,'kg','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
(18,9,'Door Hinge 4\" SS','SKU-JKY7EX',NULL,45,75,200,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
(19,9,'Aldrop 10\" Heavy','SKU-QOLYDF',NULL,220,350,40,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
(20,10,'Hgf','SKU-OKHTL4KC',NULL,600,800,54,5,'box','2026-05-09 20:58:29','2026-05-10 06:46:05',3,2,NULL);

INSERT INTO `bills` (`id`,`bill_number`,`customer_name`,`customer_phone`,`subtotal`,`discount`,`tax`,`total`,`paid_amount`,`due_amount`,`payment_method`,`status`,`notes`,`created_at`,`updated_at`,`customer_address`,`shop_id`,`is_gst`,`tax_amount`,`deleted_at`) VALUES 
(1,'INV-20260504-0001','adasd','9169704496',2000,0,360,2360,2360,0,'cash','paid',NULL,'2026-05-04 05:57:24','2026-05-04 05:57:24','asdasd1',2,0,0,NULL),
(2,'INV-20260505-0001','adasd','9169704496',8400,0,1512,9912,9000,912,'cash','partial',NULL,'2026-05-05 10:34:11','2026-05-05 10:35:42','asdasd1',2,0,0,NULL),
(3,'INV-20260505-0002','adasd','9169704496',0,0,0,0,4000,0,'cash','paid','Repayment for Bill #INV-20260505-0001','2026-05-05 10:35:42','2026-05-05 10:35:42',NULL,2,0,0,NULL),
(4,'INV-20260509-0001','555','56666',200,0,0,200,200,0,'cash','paid',NULL,'2026-05-09 20:01:23','2026-05-09 20:01:23',';;;',3,0,0,NULL),
(5,'INV-20260510-0001','Vineet Pandey','7398222389',2400,0,0,2400,400,2000,'cash','partial',NULL,'2026-05-10 05:10:24','2026-05-10 07:28:22','Mishrapur Kursi Road, Gudamba, Lucknow .',2,0,0,NULL),
(6,'INV-20260510-0001','Kajal pandey','8953504528',800,0,0,800,800,0,'cash','paid',NULL,'2026-05-10 06:46:05','2026-05-10 06:46:05','Mishrapur lucknow',3,0,0,NULL),
(7,'INV-20260510-0002','kajal Pandey','8953504528',400,0,72,472,472,0,'cash','paid',NULL,'2026-05-10 07:32:38','2026-05-10 07:48:05','Mihsrapur Lukcnow ..',2,1,0,NULL);

INSERT INTO `bill_items` (`id`,`bill_id`,`product_id`,`product_name`,`price`,`quantity`,`discount`,`total`,`created_at`,`updated_at`,`shop_id`,`description`,`unit`) VALUES 
(2,1,8,'wtie',2000,1,0,2000,NULL,NULL,NULL,NULL,NULL),
(3,2,9,'kkasd',400,6,0,2400,'2026-05-05 10:34:11','2026-05-05 10:34:11',2,NULL,NULL),
(4,2,8,'wtie',2000,3,0,6000,'2026-05-05 10:34:11','2026-05-05 10:34:11',2,NULL,NULL),
(5,4,10,'ploo',200,1,0,200,'2026-05-09 20:01:23','2026-05-09 20:01:23',3,NULL,NULL),
(7,6,20,'Hgf',800,1,0,800,'2026-05-10 06:46:05','2026-05-10 06:46:05',3,NULL,NULL),
(8,5,9,'kkasd',400,1,0,400,NULL,NULL,NULL,NULL,NULL),
(10,5,8,'wtie',2000,1,0,2000,'2026-05-10 07:28:22','2026-05-10 07:28:22',2,NULL,NULL),
(11,5,9,'kkasd',400,1,0,400,'2026-05-10 07:28:22','2026-05-10 07:28:22',2,NULL,NULL),
(13,7,9,'kkasd',400,1,0,400,'2026-05-10 07:48:05','2026-05-10 07:48:05',2,NULL,'meter');

SET FOREIGN_KEY_CHECKS = 1;
