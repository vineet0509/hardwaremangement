DROP TABLE IF EXISTS "advance_payments";
CREATE TABLE "advance_payments" (
	"id"	integer NOT NULL,
	"staff_id"	integer NOT NULL,
	"amount"	numeric NOT NULL,
	"advance_date"	datetime NOT NULL,
	"reason"	text,
	"status"	varchar NOT NULL DEFAULT ('pending'),
	"created_at"	datetime,
	"updated_at"	datetime,
	"shop_id"	integer,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade on update no action,
	FOREIGN KEY("staff_id") REFERENCES "staff"("id") on delete cascade on update no action
);
DROP TABLE IF EXISTS "bill_items";
CREATE TABLE "bill_items" (
	"id"	integer NOT NULL,
	"bill_id"	integer NOT NULL,
	"product_id"	integer NOT NULL,
	"product_name"	varchar NOT NULL,
	"price"	numeric NOT NULL,
	"quantity"	integer NOT NULL,
	"discount"	numeric NOT NULL DEFAULT ('0'),
	"total"	numeric NOT NULL,
	"created_at"	datetime,
	"updated_at"	datetime,
	"shop_id"	integer,
	"description"	text,
	"unit"	varchar,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("bill_id") REFERENCES "bills"("id") on delete cascade on update no action,
	FOREIGN KEY("product_id") REFERENCES "products"("id") on delete cascade on update no action,
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade
);
DROP TABLE IF EXISTS "bills";
CREATE TABLE "bills" (
	"id"	integer NOT NULL,
	"bill_number"	varchar NOT NULL,
	"customer_name"	varchar,
	"customer_phone"	varchar,
	"subtotal"	numeric NOT NULL DEFAULT ('0'),
	"discount"	numeric NOT NULL DEFAULT ('0'),
	"tax"	numeric NOT NULL DEFAULT ('0'),
	"total"	numeric NOT NULL DEFAULT ('0'),
	"paid_amount"	numeric NOT NULL DEFAULT ('0'),
	"due_amount"	numeric NOT NULL DEFAULT ('0'),
	"payment_method"	varchar NOT NULL DEFAULT ('cash'),
	"status"	varchar NOT NULL DEFAULT ('paid'),
	"notes"	text,
	"created_at"	datetime,
	"updated_at"	datetime,
	"customer_address"	text,
	"shop_id"	integer,
	"is_gst"	tinyint(1) NOT NULL DEFAULT '0',
	"tax_amount"	numeric NOT NULL DEFAULT '0',
	"deleted_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade
);
DROP TABLE IF EXISTS "cache";
CREATE TABLE "cache" (
	"key"	varchar NOT NULL,
	"value"	text NOT NULL,
	"expiration"	integer NOT NULL,
	PRIMARY KEY("key")
);
DROP TABLE IF EXISTS "cache_locks";
CREATE TABLE "cache_locks" (
	"key"	varchar NOT NULL,
	"owner"	varchar NOT NULL,
	"expiration"	integer NOT NULL,
	PRIMARY KEY("key")
);
DROP TABLE IF EXISTS "categories";
CREATE TABLE "categories" (
	"id"	integer NOT NULL,
	"name"	varchar NOT NULL,
	"description"	varchar,
	"created_at"	datetime,
	"updated_at"	datetime,
	"shop_id"	integer,
	"deleted_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade
);
DROP TABLE IF EXISTS "expenses";
CREATE TABLE "expenses" (
	"id"	integer NOT NULL,
	"shop_id"	integer NOT NULL,
	"expense_date"	date NOT NULL,
	"amount"	numeric NOT NULL,
	"description"	varchar NOT NULL,
	"created_at"	datetime,
	"updated_at"	datetime,
	"deleted_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade
);
DROP TABLE IF EXISTS "failed_jobs";
CREATE TABLE "failed_jobs" (
	"id"	integer NOT NULL,
	"uuid"	varchar NOT NULL,
	"connection"	text NOT NULL,
	"queue"	text NOT NULL,
	"payload"	text NOT NULL,
	"exception"	text NOT NULL,
	"failed_at"	datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "job_batches";
CREATE TABLE "job_batches" (
	"id"	varchar NOT NULL,
	"name"	varchar NOT NULL,
	"total_jobs"	integer NOT NULL,
	"pending_jobs"	integer NOT NULL,
	"failed_jobs"	integer NOT NULL,
	"failed_job_ids"	text NOT NULL,
	"options"	text,
	"cancelled_at"	integer,
	"created_at"	integer NOT NULL,
	"finished_at"	integer,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "jobs";
CREATE TABLE "jobs" (
	"id"	integer NOT NULL,
	"queue"	varchar NOT NULL,
	"payload"	text NOT NULL,
	"attempts"	integer NOT NULL,
	"reserved_at"	integer,
	"available_at"	integer NOT NULL,
	"created_at"	integer NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "login_logs";
CREATE TABLE "login_logs" (
	"id"	integer NOT NULL,
	"user_id"	integer,
	"shop_id"	integer,
	"ip_address"	varchar,
	"user_agent"	text,
	"login_at"	datetime NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete set null,
	FOREIGN KEY("user_id") REFERENCES "users"("id") on delete set null
);
DROP TABLE IF EXISTS "migrations";
CREATE TABLE "migrations" (
	"id"	integer NOT NULL,
	"migration"	varchar NOT NULL,
	"batch"	integer NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "password_reset_tokens";
CREATE TABLE "password_reset_tokens" (
	"email"	varchar NOT NULL,
	"token"	varchar NOT NULL,
	"created_at"	datetime,
	PRIMARY KEY("email")
);
DROP TABLE IF EXISTS "personal_access_tokens";
CREATE TABLE "personal_access_tokens" (
	"id"	integer NOT NULL,
	"tokenable_type"	varchar NOT NULL,
	"tokenable_id"	integer NOT NULL,
	"name"	text NOT NULL,
	"token"	varchar NOT NULL,
	"abilities"	text,
	"last_used_at"	datetime,
	"expires_at"	datetime,
	"created_at"	datetime,
	"updated_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "products";
CREATE TABLE "products" (
	"id"	integer NOT NULL,
	"category_id"	integer NOT NULL,
	"name"	varchar NOT NULL,
	"sku"	varchar NOT NULL,
	"description"	text,
	"purchase_price"	numeric NOT NULL DEFAULT ('0'),
	"selling_price"	numeric NOT NULL DEFAULT ('0'),
	"quantity"	integer NOT NULL DEFAULT ('0'),
	"min_stock_alert"	integer NOT NULL DEFAULT ('5'),
	"unit"	varchar NOT NULL DEFAULT ('piece'),
	"created_at"	datetime,
	"updated_at"	datetime,
	"shop_id"	integer,
	"supplier_id"	integer,
	"deleted_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("category_id") REFERENCES "categories"("id") on delete cascade on update no action,
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade on update no action,
	FOREIGN KEY("supplier_id") REFERENCES "suppliers"("id") on delete set null
);
DROP TABLE IF EXISTS "quotation_items";
CREATE TABLE "quotation_items" (
	"id"	integer NOT NULL,
	"quotation_id"	integer NOT NULL,
	"product_id"	integer,
	"product_name"	varchar NOT NULL,
	"price"	numeric NOT NULL,
	"quantity"	integer NOT NULL,
	"total"	numeric NOT NULL,
	"created_at"	datetime,
	"updated_at"	datetime,
	"description"	text,
	"unit"	varchar,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("product_id") REFERENCES "products"("id") on delete set null,
	FOREIGN KEY("quotation_id") REFERENCES "quotations"("id") on delete cascade
);
DROP TABLE IF EXISTS "quotations";
CREATE TABLE "quotations" (
	"id"	integer NOT NULL,
	"shop_id"	integer NOT NULL,
	"quotation_number"	varchar NOT NULL,
	"customer_name"	varchar,
	"customer_phone"	varchar,
	"customer_address"	text,
	"subtotal"	numeric NOT NULL DEFAULT '0',
	"discount"	numeric NOT NULL DEFAULT '0',
	"tax"	numeric NOT NULL DEFAULT '0',
	"total"	numeric NOT NULL DEFAULT '0',
	"notes"	text,
	"created_at"	datetime,
	"updated_at"	datetime,
	"is_gst"	tinyint(1) NOT NULL DEFAULT '0',
	"tax_amount"	numeric NOT NULL DEFAULT '0',
	"deleted_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade
);
DROP TABLE IF EXISTS "salary_records";
CREATE TABLE "salary_records" (
	"id"	integer NOT NULL,
	"staff_id"	integer NOT NULL,
	"month"	integer NOT NULL,
	"year"	integer NOT NULL,
	"basic_salary"	numeric NOT NULL,
	"bonus"	numeric NOT NULL DEFAULT ('0'),
	"deductions"	numeric NOT NULL DEFAULT ('0'),
	"net_salary"	numeric NOT NULL,
	"paid_amount"	numeric NOT NULL DEFAULT ('0'),
	"status"	varchar NOT NULL DEFAULT ('pending'),
	"payment_date"	datetime,
	"notes"	text,
	"created_at"	datetime,
	"updated_at"	datetime,
	"shop_id"	integer,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade on update no action,
	FOREIGN KEY("staff_id") REFERENCES "staff"("id") on delete cascade on update no action
);
DROP TABLE IF EXISTS "sessions";
CREATE TABLE "sessions" (
	"id"	varchar NOT NULL,
	"user_id"	integer,
	"ip_address"	varchar,
	"user_agent"	text,
	"payload"	text NOT NULL,
	"last_activity"	integer NOT NULL,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "settings";
CREATE TABLE "settings" (
	"id"	integer NOT NULL,
	"company_name"	varchar NOT NULL DEFAULT ('Hardware Shop Management System'),
	"company_phone"	varchar,
	"company_address"	varchar,
	"subscription_plan"	varchar NOT NULL DEFAULT ('full_time'),
	"subscription_expires_at"	date,
	"created_at"	datetime,
	"updated_at"	datetime,
	"shop_id"	integer,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade
);
DROP TABLE IF EXISTS "shops";
CREATE TABLE "shops" (
	"id"	integer NOT NULL,
	"name"	varchar NOT NULL,
	"domain"	varchar,
	"is_active"	tinyint(1) NOT NULL DEFAULT '1',
	"created_at"	datetime,
	"updated_at"	datetime,
	"trial_ends_at"	datetime,
	"gst_number"	varchar,
	"deleted_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "staff";
CREATE TABLE "staff" (
	"id"	integer NOT NULL,
	"name"	varchar NOT NULL,
	"phone"	varchar,
	"role"	varchar NOT NULL,
	"address"	varchar,
	"aadhar_number"	varchar,
	"monthly_salary"	numeric NOT NULL DEFAULT ('0'),
	"joining_date"	datetime NOT NULL,
	"status"	varchar NOT NULL DEFAULT ('active'),
	"created_at"	datetime,
	"updated_at"	datetime,
	"shop_id"	integer,
	"deleted_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade on update no action
);
DROP TABLE IF EXISTS "stock_transactions";
CREATE TABLE "stock_transactions" (
	"id"	integer NOT NULL,
	"product_id"	integer NOT NULL,
	"type"	varchar NOT NULL,
	"quantity"	integer NOT NULL,
	"price"	numeric,
	"reference"	varchar,
	"notes"	text,
	"created_at"	datetime,
	"updated_at"	datetime,
	"shop_id"	integer,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("product_id") REFERENCES "products"("id") on delete cascade on update no action,
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade
);
DROP TABLE IF EXISTS "subscription_requests";
CREATE TABLE "subscription_requests" (
	"id"	integer NOT NULL,
	"shop_id"	integer NOT NULL,
	"plan_type"	varchar NOT NULL,
	"amount"	numeric NOT NULL DEFAULT '0',
	"status"	varchar NOT NULL DEFAULT 'pending',
	"created_at"	datetime,
	"updated_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade
);
DROP TABLE IF EXISTS "supplier_transactions";
CREATE TABLE "supplier_transactions" (
	"id"	integer NOT NULL,
	"shop_id"	integer NOT NULL,
	"supplier_id"	integer NOT NULL,
	"type"	varchar NOT NULL DEFAULT ('payment'),
	"amount"	numeric NOT NULL,
	"transaction_date"	datetime NOT NULL,
	"notes"	varchar,
	"created_at"	datetime,
	"updated_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade on update no action,
	FOREIGN KEY("supplier_id") REFERENCES "suppliers"("id") on delete cascade on update no action
);
DROP TABLE IF EXISTS "suppliers";
CREATE TABLE "suppliers" (
	"id"	integer NOT NULL,
	"shop_id"	integer NOT NULL,
	"name"	varchar NOT NULL,
	"phone"	varchar,
	"email"	varchar,
	"address"	text,
	"created_at"	datetime,
	"updated_at"	datetime,
	"deleted_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade
);
DROP TABLE IF EXISTS "users";
CREATE TABLE "users" (
	"id"	integer NOT NULL,
	"name"	varchar NOT NULL,
	"email"	varchar NOT NULL,
	"email_verified_at"	datetime,
	"password"	varchar NOT NULL,
	"remember_token"	varchar,
	"created_at"	datetime,
	"updated_at"	datetime,
	"shop_id"	integer,
	"is_super_admin"	tinyint(1) NOT NULL DEFAULT '0',
	"mobile"	varchar,
	"deleted_at"	datetime,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("shop_id") REFERENCES "shops"("id") on delete cascade
);
INSERT INTO "bill_items" VALUES (2,1,8,'wtie',2000,1,0,2000,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "bill_items" VALUES (3,2,9,'kkasd',400,6,0,2400,'2026-05-05 10:34:11','2026-05-05 10:34:11',2,NULL,NULL);
INSERT INTO "bill_items" VALUES (4,2,8,'wtie',2000,3,0,6000,'2026-05-05 10:34:11','2026-05-05 10:34:11',2,NULL,NULL);
INSERT INTO "bill_items" VALUES (5,4,10,'ploo',200,1,0,200,'2026-05-09 20:01:23','2026-05-09 20:01:23',3,NULL,NULL);
INSERT INTO "bill_items" VALUES (7,6,20,'Hgf',800,1,0,800,'2026-05-10 06:46:05','2026-05-10 06:46:05',3,NULL,NULL);
INSERT INTO "bill_items" VALUES (8,5,9,'kkasd',400,1,0,400,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "bill_items" VALUES (10,5,8,'wtie',2000,1,0,2000,'2026-05-10 07:28:22','2026-05-10 07:28:22',2,NULL,NULL);
INSERT INTO "bill_items" VALUES (11,5,9,'kkasd',400,1,0,400,'2026-05-10 07:28:22','2026-05-10 07:28:22',2,NULL,NULL);
INSERT INTO "bill_items" VALUES (13,7,9,'kkasd',400,1,0,400,'2026-05-10 07:48:05','2026-05-10 07:48:05',2,NULL,'meter');
INSERT INTO "bills" VALUES (1,'INV-20260504-0001','adasd','9169704496',2000,0,360,2360,2360,0,'cash','paid',NULL,'2026-05-04 05:57:24','2026-05-04 05:57:24','asdasd1',2,0,0,NULL);
INSERT INTO "bills" VALUES (2,'INV-20260505-0001','adasd','9169704496',8400,0,1512,9912,9000,912,'cash','partial',NULL,'2026-05-05 10:34:11','2026-05-05 10:35:42','asdasd1',2,0,0,NULL);
INSERT INTO "bills" VALUES (3,'INV-20260505-0002','adasd','9169704496',0,0,0,0,4000,0,'cash','paid','Repayment for Bill #INV-20260505-0001','2026-05-05 10:35:42','2026-05-05 10:35:42',NULL,2,0,0,NULL);
INSERT INTO "bills" VALUES (4,'INV-20260509-0001','555','56666',200,0,0,200,200,0,'cash','paid',NULL,'2026-05-09 20:01:23','2026-05-09 20:01:23',';;;',3,0,0,NULL);
INSERT INTO "bills" VALUES (5,'INV-20260510-0001','Vineet Pandey','7398222389',2400,0,0,2400,400,2000,'cash','partial',NULL,'2026-05-10 05:10:24','2026-05-10 07:28:22','Mishrapur Kursi Road, Gudamba, Lucknow .',2,0,0,NULL);
INSERT INTO "bills" VALUES (6,'INV-20260510-0001','Kajal pandey','8953504528',800,0,0,800,800,0,'cash','paid',NULL,'2026-05-10 06:46:05','2026-05-10 06:46:05','Mishrapur lucknow',3,0,0,NULL);
INSERT INTO "bills" VALUES (7,'INV-20260510-0002','kajal Pandey','8953504528',400,0,72,472,472,0,'cash','paid',NULL,'2026-05-10 07:32:38','2026-05-10 07:48:05','Mihsrapur Lukcnow ..',2,1,0,NULL);
INSERT INTO "categories" VALUES (1,'Paints & Chemical','Wall paints, primer, putty','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL);
INSERT INTO "categories" VALUES (2,'Plumbing','Pipes, taps, fittings','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL);
INSERT INTO "categories" VALUES (3,'Electricals','Wires, switches, boards','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL);
INSERT INTO "categories" VALUES (4,'Tools','Hammers, drills, screwdrivers','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL);
INSERT INTO "categories" VALUES (5,'asdasd',NULL,'2026-05-04 05:56:33','2026-05-04 05:56:33',2,NULL);
INSERT INTO "categories" VALUES (6,'Plumbing',NULL,'2026-05-05 10:31:01','2026-05-05 10:31:01',2,NULL);
INSERT INTO "categories" VALUES (7,'kkkk',NULL,'2026-05-09 19:49:27','2026-05-09 19:49:27',3,NULL);
INSERT INTO "categories" VALUES (8,'Construction','Cement, Bricks, Sand','2026-05-09 19:58:39','2026-05-09 19:58:39',1,NULL);
INSERT INTO "categories" VALUES (9,'Hardware','Nails, screws, hinges','2026-05-09 19:58:39','2026-05-09 19:58:39',1,NULL);
INSERT INTO "categories" VALUES (10,'Nhj',NULL,'2026-05-09 20:58:11','2026-05-09 20:58:11',3,NULL);
INSERT INTO "expenses" VALUES (1,3,'2026-05-09 00:00:00',5858,'jjjjj','2026-05-09 20:18:32','2026-05-09 20:18:32',NULL);
INSERT INTO "expenses" VALUES (2,3,'2026-05-09 00:00:00',6,'Hshs','2026-05-09 20:32:27','2026-05-09 20:32:27',NULL);
INSERT INTO "expenses" VALUES (3,2,'2026-05-10 00:00:00',1000,'Given to CHai','2026-05-10 07:37:30','2026-05-10 07:37:30',NULL);
INSERT INTO "login_logs" VALUES (1,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-02 11:15:54');
INSERT INTO "login_logs" VALUES (2,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-02 11:22:51');
INSERT INTO "login_logs" VALUES (3,1,2,'127.0.0.1','Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1 Edg/147.0.0.0','2026-05-02 11:35:44');
INSERT INTO "login_logs" VALUES (4,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','2026-05-04 05:55:30');
INSERT INTO "login_logs" VALUES (5,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','2026-05-05 10:29:12');
INSERT INTO "login_logs" VALUES (6,2,3,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-09 19:48:19');
INSERT INTO "login_logs" VALUES (7,2,3,'192.168.1.20','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36','2026-05-09 20:31:32');
INSERT INTO "login_logs" VALUES (8,2,3,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-09 20:35:58');
INSERT INTO "login_logs" VALUES (9,2,3,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-10 04:02:00');
INSERT INTO "login_logs" VALUES (10,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-10 04:09:19');
INSERT INTO "login_logs" VALUES (11,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-10 04:40:26');
INSERT INTO "login_logs" VALUES (12,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-10 05:02:09');
INSERT INTO "login_logs" VALUES (13,2,3,'192.168.1.4','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36','2026-05-10 05:22:45');
INSERT INTO "migrations" VALUES (1,'0001_01_01_000000_create_users_table',1);
INSERT INTO "migrations" VALUES (2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO "migrations" VALUES (3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO "migrations" VALUES (4,'2026_04_15_000001_create_products_table',1);
INSERT INTO "migrations" VALUES (5,'2026_04_15_000002_create_bills_table',1);
INSERT INTO "migrations" VALUES (6,'2026_04_15_000003_create_staff_table',1);
INSERT INTO "migrations" VALUES (7,'2026_04_15_000004_create_stock_transactions_table',1);
INSERT INTO "migrations" VALUES (8,'2026_04_15_181559_create_settings_table',1);
INSERT INTO "migrations" VALUES (9,'2026_04_27_162824_add_customer_address_to_bills_table',1);
INSERT INTO "migrations" VALUES (10,'2026_04_27_171231_create_shops_table',1);
INSERT INTO "migrations" VALUES (11,'2026_04_27_171324_add_shop_id_to_all_tables',1);
INSERT INTO "migrations" VALUES (12,'2026_04_27_171719_create_personal_access_tokens_table',1);
INSERT INTO "migrations" VALUES (13,'2026_04_27_181041_add_is_super_admin_to_users_table',1);
INSERT INTO "migrations" VALUES (14,'2026_04_28_081439_add_shop_id_to_categories_table',1);
INSERT INTO "migrations" VALUES (15,'2026_04_28_133329_add_trial_ends_at_to_shops_table',1);
INSERT INTO "migrations" VALUES (16,'2026_04_28_140320_create_suppliers_table',1);
INSERT INTO "migrations" VALUES (17,'2026_04_28_140814_add_supplier_id_to_products_table',1);
INSERT INTO "migrations" VALUES (18,'2026_04_28_162044_fix_bills_bill_number_unique_constraint',1);
INSERT INTO "migrations" VALUES (19,'2026_04_29_060241_create_supplier_transactions_table',1);
INSERT INTO "migrations" VALUES (20,'2026_04_29_112012_create_login_logs_table',1);
INSERT INTO "migrations" VALUES (21,'2026_05_02_053742_create_quotations_table',1);
INSERT INTO "migrations" VALUES (22,'2026_05_02_053754_create_quotation_items_table',1);
INSERT INTO "migrations" VALUES (23,'2026_05_02_055117_add_phone_to_users_table',1);
INSERT INTO "migrations" VALUES (24,'2026_05_02_055337_add_mobile_to_users_table',1);
INSERT INTO "migrations" VALUES (25,'2026_05_02_063013_add_gst_fields_to_tables',1);
INSERT INTO "migrations" VALUES (26,'2026_05_02_101247_change_date_columns_to_datetime',1);
INSERT INTO "migrations" VALUES (27,'2026_05_02_171504_add_soft_deletes_to_all_tables',2);
INSERT INTO "migrations" VALUES (28,'2026_05_09_201402_create_expenses_table',3);
INSERT INTO "migrations" VALUES (29,'2026_05_10_035309_create_subscription_requests_table',4);
INSERT INTO "migrations" VALUES (30,'2026_05_10_071708_add_description_to_bill_items_table',5);
INSERT INTO "migrations" VALUES (31,'2026_05_10_072511_add_description_to_quotation_items_table',6);
INSERT INTO "migrations" VALUES (32,'2026_05_10_072937_add_unit_to_items_tables',7);
INSERT INTO "personal_access_tokens" VALUES (2,'App\Models\User',1,'auth_token','1ec3ebcea2c3b840ed3d1ee565b01faf6ff069c1aeb077c4bd6f441af0eccee5','["*"]','2026-05-02 11:20:03',NULL,'2026-05-02 11:15:54','2026-05-02 11:20:03');
INSERT INTO "personal_access_tokens" VALUES (3,'App\Models\User',1,'auth_token','ec1f58cf94222e232f113f2ad61222f8ba8ccb48a96113213d958caffbe54f60','["*"]','2026-05-02 11:22:57',NULL,'2026-05-02 11:22:51','2026-05-02 11:22:57');
INSERT INTO "personal_access_tokens" VALUES (6,'App\Models\User',1,'auth_token','acb2254d0eba7d4c91e00619578a5c71541a015f3156a3a05258ed1af8a8f3df','["*"]','2026-05-05 10:44:34',NULL,'2026-05-05 10:29:12','2026-05-05 10:44:34');
INSERT INTO "personal_access_tokens" VALUES (7,'App\Models\User',2,'auth_token','1b3c10288e04d5c881290ff1ccca37f42dbf84a7081598226dac550dad126a11','["*"]','2026-05-09 19:46:36',NULL,'2026-05-09 19:41:26','2026-05-09 19:46:36');
INSERT INTO "personal_access_tokens" VALUES (8,'App\Models\User',2,'auth_token','aa9f93edc8ad84de9a044a46615a1a0500df75126f6717fa08fe4b3ae77bf25a','["*"]','2026-05-09 20:35:23',NULL,'2026-05-09 19:48:19','2026-05-09 20:35:23');
INSERT INTO "personal_access_tokens" VALUES (9,'App\Models\User',2,'auth_token','fbcdb3638561a7d190716722e2cd94dbd4439c2740db59727f0bba6aaa1a6c3e','["*"]','2026-05-09 22:47:06',NULL,'2026-05-09 20:31:32','2026-05-09 22:47:06');
INSERT INTO "personal_access_tokens" VALUES (10,'App\Models\User',2,'auth_token','b73b95c8c177b1a117d5f2e0b976ee9342a319825e1890ec49c356f984664c0b','["*"]','2026-05-10 04:01:46',NULL,'2026-05-09 20:35:58','2026-05-10 04:01:46');
INSERT INTO "personal_access_tokens" VALUES (12,'App\Models\User',1,'auth_token','1a2bd04f399c8395afc6e91848f76de2f491391325a5b16cd8f10e91f5e7e60e','["*"]','2026-05-10 04:39:49',NULL,'2026-05-10 04:09:19','2026-05-10 04:39:49');
INSERT INTO "personal_access_tokens" VALUES (13,'App\Models\User',1,'auth_token','71add4c9b9a0f6bb1603c172a21a1abc07a2ffb6de027be1c95062e99d220f1c','["*"]','2026-05-10 05:01:18',NULL,'2026-05-10 04:40:26','2026-05-10 05:01:18');
INSERT INTO "personal_access_tokens" VALUES (14,'App\Models\User',1,'auth_token','e267566115d2bfe317922570c083ec3500a043e7e023960e721d9803368ccced','["*"]','2026-05-10 07:50:40',NULL,'2026-05-10 05:02:09','2026-05-10 07:50:40');
INSERT INTO "personal_access_tokens" VALUES (15,'App\Models\User',2,'auth_token','fa10d55f80d0294a4b13528bf48f14d307ad7d41d12b215339540f17775f7828','["*"]','2026-05-10 06:48:04',NULL,'2026-05-10 05:22:45','2026-05-10 06:48:04');
INSERT INTO "products" VALUES (1,1,'Asian Paints Apex 20L','SKU-DBWSSX',NULL,3200,3600,15,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL);
INSERT INTO "products" VALUES (2,1,'Wall Putty 40kg','SKU-SZJPAZ',NULL,650,750,30,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL);
INSERT INTO "products" VALUES (3,2,'PVC Pipe 1.5 inch','SKU-FRTZZX',NULL,120,150,100,10,'meter','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL);
INSERT INTO "products" VALUES (4,2,'Steel Tap Heavy','SKU-U5MJ0S',NULL,250,350,45,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL);
INSERT INTO "products" VALUES (5,3,'Copper Wire 1.5 sq mm Bundle','SKU-U5JRAH',NULL,1400,1700,20,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL);
INSERT INTO "products" VALUES (6,3,'Modular Switch 6A','SKU-SDGDFP',NULL,35,50,200,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL);
INSERT INTO "products" VALUES (7,4,'Drill Machine 500W','SKU-EGZ5VB',NULL,1500,1900,5,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL);
INSERT INTO "products" VALUES (8,5,'wtie','SKU-EGHBENIU',NULL,1000,2000,106,5,'piece','2026-05-04 05:56:46','2026-05-10 07:28:22',2,1,NULL);
INSERT INTO "products" VALUES (9,6,'kkasd','SKU-OHMD4TUP',NULL,200,400,91,5,'meter','2026-05-05 10:31:35','2026-05-10 07:48:05',2,1,NULL);
INSERT INTO "products" VALUES (10,7,'ploo','SKU-ZQ43MCF3',NULL,100,200,99,5,'meter','2026-05-09 19:49:45','2026-05-09 20:01:23',3,2,NULL);
INSERT INTO "products" VALUES (11,8,'UltraTech Cement 50kg','SKU-U32TTX',NULL,380,410,500,10,'bag','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL);
INSERT INTO "products" VALUES (12,8,'Red Bricks (Premium)','SKU-SUMZKN',NULL,6,8,10000,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL);
INSERT INTO "products" VALUES (13,8,'River Sand (Tractor Load)','SKU-0VIQ6J',NULL,2500,3200,20,10,'load','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL);
INSERT INTO "products" VALUES (14,2,'Sintex Water Tank 1000L','SKU-R63ZME',NULL,4500,5200,15,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL);
INSERT INTO "products" VALUES (15,2,'CPVC Pipe 1" (3m)','SKU-GVLNOL',NULL,280,340,120,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL);
INSERT INTO "products" VALUES (16,2,'Brass Bib Cock','SKU-GVSSYJ',NULL,180,250,50,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL);
INSERT INTO "products" VALUES (17,9,'Iron Nails 2 Inch (1kg)','SKU-KGZCEQ',NULL,70,100,80,10,'kg','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL);
INSERT INTO "products" VALUES (18,9,'Door Hinge 4" SS','SKU-JKY7EX',NULL,45,75,200,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL);
INSERT INTO "products" VALUES (19,9,'Aldrop 10" Heavy','SKU-QOLYDF',NULL,220,350,40,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL);
INSERT INTO "products" VALUES (20,10,'Hgf','SKU-OKHTL4KC',NULL,600,800,54,5,'box','2026-05-09 20:58:29','2026-05-10 06:46:05',3,2,NULL);
INSERT INTO "sessions" VALUES ('heuC4hB5AWVjyV7zMI5nJAy2TNgqp3qHtzSebOdd',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiQWhOVXpFd1J5Tks5UUtoeXF0WEYwTFVpY21uc0xLRzFOcmVmZ2hBSSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778399314);
INSERT INTO "sessions" VALUES ('i84smyvsna48WmEvFjC9S5DtaDdWehRFmzAgfsSl',NULL,'192.168.1.4','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTHVoMURZWGdvM1ZNYkIyWmhnaTlGeWhjc3p6SGtzcVFpQnVxN01WbyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHA6Ly8xOTIuMTY4LjEuMTI6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778390548);
INSERT INTO "sessions" VALUES ('0BvWMd9DYidHrzmTAsCgOnbJctegk8umCiTKPDS3',NULL,'192.168.1.20','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZFFZaUw2RDA5bFJnSHJFU090Z25nVVFCQ09waFgyWGlqcnlpR0RFZCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDQ6Imh0dHA6Ly8xOTIuMTY4LjEuMTI6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778395450);
INSERT INTO "sessions" VALUES ('3Cg67T19XnDc8ZeQmEtTU9Db2ZrHTThKxJwnfYof',NULL,'127.0.0.1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiV3JSNXdqZWZlSWRteGRxblJnVEFTYVZDMUh6eHdwVThnbVFqc0VxViI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778395963);
INSERT INTO "sessions" VALUES ('VJMeAb99WSms32hZXw4KcXtZlhfwBubtmFCT87Rd',NULL,'127.0.0.1','Go-http-client/1.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoieFdOUG1MazlRNmk5YVZFRGhxbmNkejF1bmlyaXRXS0RkMGZDcXdOQyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXBhdGgiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778395964);
INSERT INTO "settings" VALUES (1,'Vineet Harware Compnay','9169704496','Mishrapur, Kursir ROad, Gudamba , Lucknow . 226026','yearly','2027-06-01 11:06:10','2026-05-02 11:06:10','2026-05-10 05:06:19',2);
INSERT INTO "settings" VALUES (2,'asdasd','9169704496','Bdhsh','monthly','2026-07-08 19:41:25','2026-05-09 19:41:25','2026-05-10 05:23:47',3);
INSERT INTO "shops" VALUES (1,'Default Hardware Shop','default.localhost',1,'2026-05-02 10:53:37','2026-05-02 10:53:37',NULL,NULL,NULL);
INSERT INTO "shops" VALUES (2,'teset',NULL,1,'2026-05-02 11:06:10','2026-05-10 04:48:06','2027-06-01 11:06:10','ASDF12345DFASDAS',NULL);
INSERT INTO "shops" VALUES (3,'asdasd',NULL,1,'2026-05-09 19:41:25','2026-05-10 04:11:46','2026-07-08 19:41:25','asdasdasd',NULL);
INSERT INTO "staff" VALUES (1,'Raju Kumar','9876543210','Salesman',NULL,NULL,15000,'2025-11-02 10:53:52','active','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL);
INSERT INTO "staff" VALUES (2,'Mohan Lal','9123456780','Labour',NULL,NULL,12000,'2025-05-02 10:53:52','active','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL);
INSERT INTO "stock_transactions" VALUES (1,1,'purchase',15,3200,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1);
INSERT INTO "stock_transactions" VALUES (2,2,'purchase',30,650,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1);
INSERT INTO "stock_transactions" VALUES (3,3,'purchase',100,120,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1);
INSERT INTO "stock_transactions" VALUES (4,4,'purchase',45,250,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1);
INSERT INTO "stock_transactions" VALUES (5,5,'purchase',20,1400,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1);
INSERT INTO "stock_transactions" VALUES (6,6,'purchase',200,35,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1);
INSERT INTO "stock_transactions" VALUES (7,7,'purchase',5,1500,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1);
INSERT INTO "stock_transactions" VALUES (8,8,'purchase',111,1000,'Initial Stock',NULL,'2026-05-04 05:56:46','2026-05-04 05:56:46',2);
INSERT INTO "stock_transactions" VALUES (9,8,'sale',-1,2000,NULL,NULL,'2026-05-04 05:57:24','2026-05-04 05:57:24',2);
INSERT INTO "stock_transactions" VALUES (10,9,'purchase',100,200,'Initial Stock',NULL,'2026-05-05 10:31:35','2026-05-05 10:31:35',2);
INSERT INTO "stock_transactions" VALUES (11,9,'sale',-6,400,NULL,NULL,'2026-05-05 10:34:11','2026-05-05 10:34:11',2);
INSERT INTO "stock_transactions" VALUES (12,8,'sale',-3,2000,NULL,NULL,'2026-05-05 10:34:11','2026-05-05 10:34:11',2);
INSERT INTO "stock_transactions" VALUES (13,10,'purchase',100,100,'Initial Stock',NULL,'2026-05-09 19:49:45','2026-05-09 19:49:45',3);
INSERT INTO "stock_transactions" VALUES (14,11,'purchase',500,380,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1);
INSERT INTO "stock_transactions" VALUES (15,12,'purchase',10000,6,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1);
INSERT INTO "stock_transactions" VALUES (16,13,'purchase',20,2500,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1);
INSERT INTO "stock_transactions" VALUES (17,14,'purchase',15,4500,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1);
INSERT INTO "stock_transactions" VALUES (18,15,'purchase',120,280,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1);
INSERT INTO "stock_transactions" VALUES (19,16,'purchase',50,180,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1);
INSERT INTO "stock_transactions" VALUES (20,17,'purchase',80,70,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1);
INSERT INTO "stock_transactions" VALUES (21,18,'purchase',200,45,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1);
INSERT INTO "stock_transactions" VALUES (22,19,'purchase',40,220,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1);
INSERT INTO "stock_transactions" VALUES (23,10,'sale',-1,200,NULL,NULL,'2026-05-09 20:01:23','2026-05-09 20:01:23',3);
INSERT INTO "stock_transactions" VALUES (24,20,'purchase',55,600,'Initial Stock',NULL,'2026-05-09 20:58:29','2026-05-09 20:58:29',3);
INSERT INTO "stock_transactions" VALUES (25,9,'sale',-1,400,NULL,NULL,'2026-05-10 05:10:24','2026-05-10 05:10:24',2);
INSERT INTO "stock_transactions" VALUES (26,20,'sale',-1,800,NULL,NULL,'2026-05-10 06:46:05','2026-05-10 06:46:05',3);
INSERT INTO "stock_transactions" VALUES (27,9,'sale',-1,400,NULL,NULL,'2026-05-10 07:32:38','2026-05-10 07:32:38',2);
INSERT INTO "subscription_requests" VALUES (1,3,'monthly',499,'approved','2026-05-10 04:01:06','2026-05-10 04:11:46');
INSERT INTO "subscription_requests" VALUES (2,2,'yearly',4999,'approved','2026-05-10 04:47:45','2026-05-10 04:48:06');
INSERT INTO "supplier_transactions" VALUES (1,2,1,'purchase',111000,'2026-05-04 05:56:46','Initial stock for product: wtie','2026-05-04 05:56:46','2026-05-04 05:56:46');
INSERT INTO "supplier_transactions" VALUES (2,2,1,'purchase',20000,'2026-05-05 10:31:35','Initial stock for product: kkasd','2026-05-05 10:31:35','2026-05-05 10:31:35');
INSERT INTO "supplier_transactions" VALUES (3,2,1,'purchase',30000,'2026-05-05T10:31','llll','2026-05-05 10:32:16','2026-05-05 10:32:16');
INSERT INTO "supplier_transactions" VALUES (4,3,2,'purchase',10000,'2026-05-09 19:49:45','Initial stock for product: ploo','2026-05-09 19:49:45','2026-05-09 19:49:45');
INSERT INTO "supplier_transactions" VALUES (5,3,2,'purchase',33000,'2026-05-09 20:58:29','Initial stock for product: Hgf','2026-05-09 20:58:29','2026-05-09 20:58:29');
INSERT INTO "suppliers" VALUES (1,2,'asdasd','12344567','asdasdasdasdasd@gmail.com','asdasdasdasdasd','2026-05-04 05:56:13','2026-05-04 05:56:13',NULL);
INSERT INTO "suppliers" VALUES (2,3,'komal','123456','komal@gmail.com','asdasdasd.,a.s,d.asd','2026-05-09 19:49:08','2026-05-09 19:49:08',NULL);
INSERT INTO "suppliers" VALUES (3,1,'BuildTech Global Suppliers','9876543210','contact@buildtech.com','123 Industrial Area, Phase 1','2026-05-09 19:58:39','2026-05-09 19:58:39',NULL);
INSERT INTO "users" VALUES (1,'vineet','vineet@gmail.com',NULL,'$2y$12$65jNUYEYiTiAk8TdJA85uOd3rvsUPBHCVFLJaI2fzAtHtC77LKFO2',NULL,'2026-05-02 11:06:10','2026-05-02 12:24:49',2,1,'9169704496',NULL);
INSERT INTO "users" VALUES (2,'vineet','vin@gmaill.com',NULL,'$2y$12$lteC6K8DebrvM2GjdnkHBedjPdEFj8B4W2PEEbpQCaXjbTKuZR7G6',NULL,'2026-05-09 19:41:26','2026-05-09 19:41:26',3,0,'7398222389',NULL);
DROP INDEX IF EXISTS "bills_shop_id_bill_number_unique";
CREATE UNIQUE INDEX "bills_shop_id_bill_number_unique" ON "bills" (
	"shop_id",
	"bill_number"
);
DROP INDEX IF EXISTS "cache_expiration_index";
CREATE INDEX "cache_expiration_index" ON "cache" (
	"expiration"
);
DROP INDEX IF EXISTS "cache_locks_expiration_index";
CREATE INDEX "cache_locks_expiration_index" ON "cache_locks" (
	"expiration"
);
DROP INDEX IF EXISTS "failed_jobs_uuid_unique";
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" ON "failed_jobs" (
	"uuid"
);
DROP INDEX IF EXISTS "jobs_queue_index";
CREATE INDEX "jobs_queue_index" ON "jobs" (
	"queue"
);
DROP INDEX IF EXISTS "personal_access_tokens_expires_at_index";
CREATE INDEX "personal_access_tokens_expires_at_index" ON "personal_access_tokens" (
	"expires_at"
);
DROP INDEX IF EXISTS "personal_access_tokens_token_unique";
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" ON "personal_access_tokens" (
	"token"
);
DROP INDEX IF EXISTS "personal_access_tokens_tokenable_type_tokenable_id_index";
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" ON "personal_access_tokens" (
	"tokenable_type",
	"tokenable_id"
);
DROP INDEX IF EXISTS "products_sku_unique";
CREATE UNIQUE INDEX "products_sku_unique" ON "products" (
	"sku"
);
DROP INDEX IF EXISTS "quotations_shop_id_quotation_number_unique";
CREATE UNIQUE INDEX "quotations_shop_id_quotation_number_unique" ON "quotations" (
	"shop_id",
	"quotation_number"
);
DROP INDEX IF EXISTS "sessions_last_activity_index";
CREATE INDEX "sessions_last_activity_index" ON "sessions" (
	"last_activity"
);
DROP INDEX IF EXISTS "sessions_user_id_index";
CREATE INDEX "sessions_user_id_index" ON "sessions" (
	"user_id"
);
DROP INDEX IF EXISTS "shops_domain_unique";
CREATE UNIQUE INDEX "shops_domain_unique" ON "shops" (
	"domain"
);
DROP INDEX IF EXISTS "users_email_unique";
CREATE UNIQUE INDEX "users_email_unique" ON "users" (
	"email"
);
DROP INDEX IF EXISTS "users_mobile_unique";
CREATE UNIQUE INDEX "users_mobile_unique" ON "users" (
	"mobile"
);
COMMIT;
