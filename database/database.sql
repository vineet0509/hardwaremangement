CREATE TABLE IF NOT EXISTS "advance_payments" ("id" integer primary key autoincrement not null, "staff_id" integer not null, "amount" numeric not null, "advance_date" datetime not null, "reason" text, "status" varchar not null default ('pending'), "created_at" datetime, "updated_at" datetime, "shop_id" integer, foreign key("shop_id") references shops("id") on delete cascade on update no action, foreign key("staff_id") references staff("id") on delete cascade on update no action);
CREATE TABLE IF NOT EXISTS "bill_items" ("id" integer primary key autoincrement not null, "bill_id" integer not null, "product_id" integer not null, "product_name" varchar not null, "price" numeric not null, "quantity" integer not null, "discount" numeric not null default ('0'), "total" numeric not null, "created_at" datetime, "updated_at" datetime, "shop_id" integer, "description" text, "unit" varchar, foreign key("product_id") references products("id") on delete cascade on update no action, foreign key("bill_id") references bills("id") on delete cascade on update no action, foreign key("shop_id") references "shops"("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "bills" ("id" integer primary key autoincrement not null, "bill_number" varchar not null, "customer_name" varchar, "customer_phone" varchar, "subtotal" numeric not null default ('0'), "discount" numeric not null default ('0'), "tax" numeric not null default ('0'), "total" numeric not null default ('0'), "paid_amount" numeric not null default ('0'), "due_amount" numeric not null default ('0'), "payment_method" varchar not null default ('cash'), "status" varchar not null default ('paid'), "notes" text, "created_at" datetime, "updated_at" datetime, "customer_address" text, "shop_id" integer, "is_gst" tinyint(1) not null default '0', "tax_amount" numeric not null default '0', "deleted_at" datetime, foreign key("shop_id") references "shops"("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "cache" ("key" varchar not null, "value" text not null, "expiration" integer not null, primary key ("key"));
CREATE TABLE IF NOT EXISTS "cache_locks" ("key" varchar not null, "owner" varchar not null, "expiration" integer not null, primary key ("key"));
CREATE TABLE IF NOT EXISTS "categories" ("id" integer primary key autoincrement not null, "name" varchar not null, "description" varchar, "created_at" datetime, "updated_at" datetime, "shop_id" integer, "deleted_at" datetime, foreign key("shop_id") references "shops"("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "expenses" ("id" integer primary key autoincrement not null, "shop_id" integer not null, "expense_date" date not null, "amount" numeric not null, "description" varchar not null, "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, foreign key("shop_id") references "shops"("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "failed_jobs" ("id" integer primary key autoincrement not null, "uuid" varchar not null, "connection" text not null, "queue" text not null, "payload" text not null, "exception" text not null, "failed_at" datetime not null default CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "job_batches" ("id" varchar not null, "name" varchar not null, "total_jobs" integer not null, "pending_jobs" integer not null, "failed_jobs" integer not null, "failed_job_ids" text not null, "options" text, "cancelled_at" integer, "created_at" integer not null, "finished_at" integer, primary key ("id"));
CREATE TABLE IF NOT EXISTS "jobs" ("id" integer primary key autoincrement not null, "queue" varchar not null, "payload" text not null, "attempts" integer not null, "reserved_at" integer, "available_at" integer not null, "created_at" integer not null);
CREATE TABLE IF NOT EXISTS "login_logs" ("id" integer primary key autoincrement not null, "user_id" integer, "shop_id" integer, "ip_address" varchar, "user_agent" text, "login_at" datetime not null, foreign key("user_id") references "users"("id") on delete set null, foreign key("shop_id") references "shops"("id") on delete set null);
CREATE TABLE IF NOT EXISTS "migrations" ("id" integer primary key autoincrement not null, "migration" varchar not null, "batch" integer not null);
CREATE TABLE IF NOT EXISTS "password_reset_tokens" ("email" varchar not null, "token" varchar not null, "created_at" datetime, primary key ("email"));
CREATE TABLE IF NOT EXISTS "personal_access_tokens" ("id" integer primary key autoincrement not null, "tokenable_type" varchar not null, "tokenable_id" integer not null, "name" text not null, "token" varchar not null, "abilities" text, "last_used_at" datetime, "expires_at" datetime, "created_at" datetime, "updated_at" datetime);
CREATE TABLE IF NOT EXISTS "products" ("id" integer primary key autoincrement not null, "category_id" integer not null, "name" varchar not null, "sku" varchar not null, "description" text, "purchase_price" numeric not null default ('0'), "selling_price" numeric not null default ('0'), "quantity" integer not null default ('0'), "min_stock_alert" integer not null default ('5'), "unit" varchar not null default ('piece'), "created_at" datetime, "updated_at" datetime, "shop_id" integer, "supplier_id" integer, "deleted_at" datetime, foreign key("shop_id") references shops("id") on delete cascade on update no action, foreign key("category_id") references categories("id") on delete cascade on update no action, foreign key("supplier_id") references "suppliers"("id") on delete set null);
CREATE TABLE IF NOT EXISTS "quotation_items" ("id" integer primary key autoincrement not null, "quotation_id" integer not null, "product_id" integer, "product_name" varchar not null, "price" numeric not null, "quantity" integer not null, "total" numeric not null, "created_at" datetime, "updated_at" datetime, "description" text, "unit" varchar, foreign key("quotation_id") references "quotations"("id") on delete cascade, foreign key("product_id") references "products"("id") on delete set null);
CREATE TABLE IF NOT EXISTS "quotations" ("id" integer primary key autoincrement not null, "shop_id" integer not null, "quotation_number" varchar not null, "customer_name" varchar, "customer_phone" varchar, "customer_address" text, "subtotal" numeric not null default '0', "discount" numeric not null default '0', "tax" numeric not null default '0', "total" numeric not null default '0', "notes" text, "created_at" datetime, "updated_at" datetime, "is_gst" tinyint(1) not null default '0', "tax_amount" numeric not null default '0', "deleted_at" datetime, foreign key("shop_id") references "shops"("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "salary_records" ("id" integer primary key autoincrement not null, "staff_id" integer not null, "month" integer not null, "year" integer not null, "basic_salary" numeric not null, "bonus" numeric not null default ('0'), "deductions" numeric not null default ('0'), "net_salary" numeric not null, "paid_amount" numeric not null default ('0'), "status" varchar not null default ('pending'), "payment_date" datetime, "notes" text, "created_at" datetime, "updated_at" datetime, "shop_id" integer, foreign key("shop_id") references shops("id") on delete cascade on update no action, foreign key("staff_id") references staff("id") on delete cascade on update no action);
CREATE TABLE IF NOT EXISTS "sessions" ("id" varchar not null, "user_id" integer, "ip_address" varchar, "user_agent" text, "payload" text not null, "last_activity" integer not null, primary key ("id"));
CREATE TABLE IF NOT EXISTS "settings" ("id" integer primary key autoincrement not null, "company_name" varchar not null default ('Hardware Shop Management System'), "company_phone" varchar, "company_address" varchar, "subscription_plan" varchar not null default ('full_time'), "subscription_expires_at" date, "created_at" datetime, "updated_at" datetime, "shop_id" integer, foreign key("shop_id") references "shops"("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "shops" ("id" integer primary key autoincrement not null, "name" varchar not null, "domain" varchar, "is_active" tinyint(1) not null default '1', "created_at" datetime, "updated_at" datetime, "trial_ends_at" datetime, "gst_number" varchar, "deleted_at" datetime);
CREATE TABLE IF NOT EXISTS "staff" ("id" integer primary key autoincrement not null, "name" varchar not null, "phone" varchar, "role" varchar not null, "address" varchar, "aadhar_number" varchar, "monthly_salary" numeric not null default ('0'), "joining_date" datetime not null, "status" varchar not null default ('active'), "created_at" datetime, "updated_at" datetime, "shop_id" integer, "deleted_at" datetime, foreign key("shop_id") references shops("id") on delete cascade on update no action);
CREATE TABLE IF NOT EXISTS "stock_transactions" ("id" integer primary key autoincrement not null, "product_id" integer not null, "type" varchar not null, "quantity" integer not null, "price" numeric, "reference" varchar, "notes" text, "created_at" datetime, "updated_at" datetime, "shop_id" integer, foreign key("product_id") references products("id") on delete cascade on update no action, foreign key("shop_id") references "shops"("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "subscription_requests" ("id" integer primary key autoincrement not null, "shop_id" integer not null, "plan_type" varchar not null, "amount" numeric not null default '0', "status" varchar not null default 'pending', "created_at" datetime, "updated_at" datetime, foreign key("shop_id") references "shops"("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "supplier_transactions" ("id" integer primary key autoincrement not null, "shop_id" integer not null, "supplier_id" integer not null, "type" varchar not null default ('payment'), "amount" numeric not null, "transaction_date" datetime not null, "notes" varchar, "created_at" datetime, "updated_at" datetime, foreign key("supplier_id") references suppliers("id") on delete cascade on update no action, foreign key("shop_id") references shops("id") on delete cascade on update no action);
CREATE TABLE IF NOT EXISTS "suppliers" ("id" integer primary key autoincrement not null, "shop_id" integer not null, "name" varchar not null, "phone" varchar, "email" varchar, "address" text, "created_at" datetime, "updated_at" datetime, "deleted_at" datetime, foreign key("shop_id") references "shops"("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "users" ("id" integer primary key autoincrement not null, "name" varchar not null, "email" varchar not null, "email_verified_at" datetime, "password" varchar not null, "remember_token" varchar, "created_at" datetime, "updated_at" datetime, "shop_id" integer, "is_super_admin" tinyint(1) not null default '0', "mobile" varchar, "deleted_at" datetime, foreign key("shop_id") references "shops"("id") on delete cascade);
INSERT INTO "bill_items" ("id","bill_id","product_id","product_name","price","quantity","discount","total","created_at","updated_at","shop_id","description","unit") VALUES (2,1,8,'wtie',2000,1,0,2000,NULL,NULL,NULL,NULL,NULL),
 (3,2,9,'kkasd',400,6,0,2400,'2026-05-05 10:34:11','2026-05-05 10:34:11',2,NULL,NULL),
 (4,2,8,'wtie',2000,3,0,6000,'2026-05-05 10:34:11','2026-05-05 10:34:11',2,NULL,NULL),
 (5,4,10,'ploo',200,1,0,200,'2026-05-09 20:01:23','2026-05-09 20:01:23',3,NULL,NULL),
 (7,6,20,'Hgf',800,1,0,800,'2026-05-10 06:46:05','2026-05-10 06:46:05',3,NULL,NULL),
 (8,5,9,'kkasd',400,1,0,400,NULL,NULL,NULL,NULL,NULL),
 (10,5,8,'wtie',2000,1,0,2000,'2026-05-10 07:28:22','2026-05-10 07:28:22',2,NULL,NULL),
 (11,5,9,'kkasd',400,1,0,400,'2026-05-10 07:28:22','2026-05-10 07:28:22',2,NULL,NULL),
 (13,7,9,'kkasd',400,1,0,400,'2026-05-10 07:48:05','2026-05-10 07:48:05',2,NULL,'meter');
INSERT INTO "bills" ("id","bill_number","customer_name","customer_phone","subtotal","discount","tax","total","paid_amount","due_amount","payment_method","status","notes","created_at","updated_at","customer_address","shop_id","is_gst","tax_amount","deleted_at") VALUES (1,'INV-20260504-0001','adasd','9169704496',2000,0,360,2360,2360,0,'cash','paid',NULL,'2026-05-04 05:57:24','2026-05-04 05:57:24','asdasd1',2,0,0,NULL),
 (2,'INV-20260505-0001','adasd','9169704496',8400,0,1512,9912,9000,912,'cash','partial',NULL,'2026-05-05 10:34:11','2026-05-05 10:35:42','asdasd1',2,0,0,NULL),
 (3,'INV-20260505-0002','adasd','9169704496',0,0,0,0,4000,0,'cash','paid','Repayment for Bill #INV-20260505-0001','2026-05-05 10:35:42','2026-05-05 10:35:42',NULL,2,0,0,NULL),
 (4,'INV-20260509-0001','555','56666',200,0,0,200,200,0,'cash','paid',NULL,'2026-05-09 20:01:23','2026-05-09 20:01:23',';;;',3,0,0,NULL),
 (5,'INV-20260510-0001','Vineet Pandey','7398222389',2400,0,0,2400,400,2000,'cash','partial',NULL,'2026-05-10 05:10:24','2026-05-10 07:28:22','Mishrapur Kursi Road, Gudamba, Lucknow .',2,0,0,NULL),
 (6,'INV-20260510-0001','Kajal pandey','8953504528',800,0,0,800,800,0,'cash','paid',NULL,'2026-05-10 06:46:05','2026-05-10 06:46:05','Mishrapur lucknow',3,0,0,NULL),
 (7,'INV-20260510-0002','kajal Pandey','8953504528',400,0,72,472,472,0,'cash','paid',NULL,'2026-05-10 07:32:38','2026-05-10 07:48:05','Mihsrapur Lukcnow ..',2,1,0,NULL);
INSERT INTO "categories" ("id","name","description","created_at","updated_at","shop_id","deleted_at") VALUES (1,'Paints & Chemical','Wall paints, primer, putty','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL),
 (2,'Plumbing','Pipes, taps, fittings','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL),
 (3,'Electricals','Wires, switches, boards','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL),
 (4,'Tools','Hammers, drills, screwdrivers','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL),
 (5,'asdasd',NULL,'2026-05-04 05:56:33','2026-05-04 05:56:33',2,NULL),
 (6,'Plumbing',NULL,'2026-05-05 10:31:01','2026-05-05 10:31:01',2,NULL),
 (7,'kkkk',NULL,'2026-05-09 19:49:27','2026-05-09 19:49:27',3,NULL),
 (8,'Construction','Cement, Bricks, Sand','2026-05-09 19:58:39','2026-05-09 19:58:39',1,NULL),
 (9,'Hardware','Nails, screws, hinges','2026-05-09 19:58:39','2026-05-09 19:58:39',1,NULL),
 (10,'Nhj',NULL,'2026-05-09 20:58:11','2026-05-09 20:58:11',3,NULL);
INSERT INTO "expenses" ("id","shop_id","expense_date","amount","description","created_at","updated_at","deleted_at") VALUES (1,3,'2026-05-09 00:00:00',5858,'jjjjj','2026-05-09 20:18:32','2026-05-09 20:18:32',NULL),
 (2,3,'2026-05-09 00:00:00',6,'Hshs','2026-05-09 20:32:27','2026-05-09 20:32:27',NULL),
 (3,2,'2026-05-10 00:00:00',1000,'Given to CHai','2026-05-10 07:37:30','2026-05-10 07:37:30',NULL);
INSERT INTO "login_logs" ("id","user_id","shop_id","ip_address","user_agent","login_at") VALUES (1,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-02 11:15:54'),
 (2,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-02 11:22:51'),
 (3,1,2,'127.0.0.1','Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1 Edg/147.0.0.0','2026-05-02 11:35:44'),
 (4,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','2026-05-04 05:55:30'),
 (5,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0','2026-05-05 10:29:12'),
 (6,2,3,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-09 19:48:19'),
 (7,2,3,'192.168.1.20','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36','2026-05-09 20:31:32'),
 (8,2,3,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-09 20:35:58'),
 (9,2,3,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-10 04:02:00'),
 (10,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','2026-05-10 04:09:19'),
 (11,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-10 04:40:26'),
 (12,1,2,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','2026-05-10 05:02:09'),
 (13,2,3,'192.168.1.4','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36','2026-05-10 05:22:45');
INSERT INTO "migrations" ("id","migration","batch") VALUES (1,'0001_01_01_000000_create_users_table',1),
 (2,'0001_01_01_000001_create_cache_table',1),
 (3,'0001_01_01_000002_create_jobs_table',1),
 (4,'2026_04_15_000001_create_products_table',1),
 (5,'2026_04_15_000002_create_bills_table',1),
 (6,'2026_04_15_000003_create_staff_table',1),
 (7,'2026_04_15_000004_create_stock_transactions_table',1),
 (8,'2026_04_15_181559_create_settings_table',1),
 (9,'2026_04_27_162824_add_customer_address_to_bills_table',1),
 (10,'2026_04_27_171231_create_shops_table',1),
 (11,'2026_04_27_171324_add_shop_id_to_all_tables',1),
 (12,'2026_04_27_171719_create_personal_access_tokens_table',1),
 (13,'2026_04_27_181041_add_is_super_admin_to_users_table',1),
 (14,'2026_04_28_081439_add_shop_id_to_categories_table',1),
 (15,'2026_04_28_133329_add_trial_ends_at_to_shops_table',1),
 (16,'2026_04_28_140320_create_suppliers_table',1),
 (17,'2026_04_28_140814_add_supplier_id_to_products_table',1),
 (18,'2026_04_28_162044_fix_bills_bill_number_unique_constraint',1),
 (19,'2026_04_29_060241_create_supplier_transactions_table',1),
 (20,'2026_04_29_112012_create_login_logs_table',1),
 (21,'2026_05_02_053742_create_quotations_table',1),
 (22,'2026_05_02_053754_create_quotation_items_table',1),
 (23,'2026_05_02_055117_add_phone_to_users_table',1),
 (24,'2026_05_02_055337_add_mobile_to_users_table',1),
 (25,'2026_05_02_063013_add_gst_fields_to_tables',1),
 (26,'2026_05_02_101247_change_date_columns_to_datetime',1),
 (27,'2026_05_02_171504_add_soft_deletes_to_all_tables',2),
 (28,'2026_05_09_201402_create_expenses_table',3),
 (29,'2026_05_10_035309_create_subscription_requests_table',4),
 (30,'2026_05_10_071708_add_description_to_bill_items_table',5),
 (31,'2026_05_10_072511_add_description_to_quotation_items_table',6),
 (32,'2026_05_10_072937_add_unit_to_items_tables',7);
INSERT INTO "personal_access_tokens" ("id","tokenable_type","tokenable_id","name","token","abilities","last_used_at","expires_at","created_at","updated_at") VALUES (2,'App\Models\User',1,'auth_token','1ec3ebcea2c3b840ed3d1ee565b01faf6ff069c1aeb077c4bd6f441af0eccee5','["*"]','2026-05-02 11:20:03',NULL,'2026-05-02 11:15:54','2026-05-02 11:20:03'),
 (3,'App\Models\User',1,'auth_token','ec1f58cf94222e232f113f2ad61222f8ba8ccb48a96113213d958caffbe54f60','["*"]','2026-05-02 11:22:57',NULL,'2026-05-02 11:22:51','2026-05-02 11:22:57'),
 (6,'App\Models\User',1,'auth_token','acb2254d0eba7d4c91e00619578a5c71541a015f3156a3a05258ed1af8a8f3df','["*"]','2026-05-05 10:44:34',NULL,'2026-05-05 10:29:12','2026-05-05 10:44:34'),
 (7,'App\Models\User',2,'auth_token','1b3c10288e04d5c881290ff1ccca37f42dbf84a7081598226dac550dad126a11','["*"]','2026-05-09 19:46:36',NULL,'2026-05-09 19:41:26','2026-05-09 19:46:36'),
 (8,'App\Models\User',2,'auth_token','aa9f93edc8ad84de9a044a46615a1a0500df75126f6717fa08fe4b3ae77bf25a','["*"]','2026-05-09 20:35:23',NULL,'2026-05-09 19:48:19','2026-05-09 20:35:23'),
 (9,'App\Models\User',2,'auth_token','fbcdb3638561a7d190716722e2cd94dbd4439c2740db59727f0bba6aaa1a6c3e','["*"]','2026-05-09 22:47:06',NULL,'2026-05-09 20:31:32','2026-05-09 22:47:06'),
 (10,'App\Models\User',2,'auth_token','b73b95c8c177b1a117d5f2e0b976ee9342a319825e1890ec49c356f984664c0b','["*"]','2026-05-10 04:01:46',NULL,'2026-05-09 20:35:58','2026-05-10 04:01:46'),
 (12,'App\Models\User',1,'auth_token','1a2bd04f399c8395afc6e91848f76de2f491391325a5b16cd8f10e91f5e7e60e','["*"]','2026-05-10 04:39:49',NULL,'2026-05-10 04:09:19','2026-05-10 04:39:49'),
 (13,'App\Models\User',1,'auth_token','71add4c9b9a0f6bb1603c172a21a1abc07a2ffb6de027be1c95062e99d220f1c','["*"]','2026-05-10 05:01:18',NULL,'2026-05-10 04:40:26','2026-05-10 05:01:18'),
 (14,'App\Models\User',1,'auth_token','e267566115d2bfe317922570c083ec3500a043e7e023960e721d9803368ccced','["*"]','2026-05-10 07:50:40',NULL,'2026-05-10 05:02:09','2026-05-10 07:50:40'),
 (15,'App\Models\User',2,'auth_token','fa10d55f80d0294a4b13528bf48f14d307ad7d41d12b215339540f17775f7828','["*"]','2026-05-10 06:48:04',NULL,'2026-05-10 05:22:45','2026-05-10 06:48:04');
INSERT INTO "products" ("id","category_id","name","sku","description","purchase_price","selling_price","quantity","min_stock_alert","unit","created_at","updated_at","shop_id","supplier_id","deleted_at") VALUES (1,1,'Asian Paints Apex 20L','SKU-DBWSSX',NULL,3200,3600,15,10,'piece','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL,NULL),
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
 (15,2,'CPVC Pipe 1" (3m)','SKU-GVLNOL',NULL,280,340,120,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
 (16,2,'Brass Bib Cock','SKU-GVSSYJ',NULL,180,250,50,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
 (17,9,'Iron Nails 2 Inch (1kg)','SKU-KGZCEQ',NULL,70,100,80,10,'kg','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
 (18,9,'Door Hinge 4" SS','SKU-JKY7EX',NULL,45,75,200,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
 (19,9,'Aldrop 10" Heavy','SKU-QOLYDF',NULL,220,350,40,10,'piece','2026-05-09 19:58:39','2026-05-09 19:58:39',1,3,NULL),
 (20,10,'Hgf','SKU-OKHTL4KC',NULL,600,800,54,5,'box','2026-05-09 20:58:29','2026-05-10 06:46:05',3,2,NULL);
INSERT INTO "sessions" ("id","user_id","ip_address","user_agent","payload","last_activity") VALUES ('heuC4hB5AWVjyV7zMI5nJAy2TNgqp3qHtzSebOdd',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiQWhOVXpFd1J5Tks5UUtoeXF0WEYwTFVpY21uc0xLRzFOcmVmZ2hBSSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778399314),
 ('i84smyvsna48WmEvFjC9S5DtaDdWehRFmzAgfsSl',NULL,'192.168.1.4','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTHVoMURZWGdvM1ZNYkIyWmhnaTlGeWhjc3p6SGtzcVFpQnVxN01WbyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHA6Ly8xOTIuMTY4LjEuMTI6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778390548),
 ('0BvWMd9DYidHrzmTAsCgOnbJctegk8umCiTKPDS3',NULL,'192.168.1.20','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZFFZaUw2RDA5bFJnSHJFU090Z25nVVFCQ09waFgyWGlqcnlpR0RFZCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDQ6Imh0dHA6Ly8xOTIuMTY4LjEuMTI6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778395450),
 ('3Cg67T19XnDc8ZeQmEtTU9Db2ZrHTThKxJwnfYof',NULL,'127.0.0.1','Go-http-client/1.1','YToyOntzOjY6Il90b2tlbiI7czo0MDoiV3JSNXdqZWZlSWRteGRxblJnVEFTYVZDMUh6eHdwVThnbVFqc0VxViI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1778395963),
 ('VJMeAb99WSms32hZXw4KcXtZlhfwBubtmFCT87Rd',NULL,'127.0.0.1','Go-http-client/1.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoieFdOUG1MazlRNmk5YVZFRGhxbmNkejF1bmlyaXRXS0RkMGZDcXdOQyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC90ZXN0LXBhdGgiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1778395964);
INSERT INTO "settings" ("id","company_name","company_phone","company_address","subscription_plan","subscription_expires_at","created_at","updated_at","shop_id") VALUES (1,'Vineet Harware Compnay','9169704496','Mishrapur, Kursir ROad, Gudamba , Lucknow . 226026','yearly','2027-06-01 11:06:10','2026-05-02 11:06:10','2026-05-10 05:06:19',2),
 (2,'asdasd','9169704496','Bdhsh','monthly','2026-07-08 19:41:25','2026-05-09 19:41:25','2026-05-10 05:23:47',3);
INSERT INTO "shops" ("id","name","domain","is_active","created_at","updated_at","trial_ends_at","gst_number","deleted_at") VALUES (1,'Default Hardware Shop','default.localhost',1,'2026-05-02 10:53:37','2026-05-02 10:53:37',NULL,NULL,NULL),
 (2,'teset',NULL,1,'2026-05-02 11:06:10','2026-05-10 04:48:06','2027-06-01 11:06:10','ASDF12345DFASDAS',NULL),
 (3,'asdasd',NULL,1,'2026-05-09 19:41:25','2026-05-10 04:11:46','2026-07-08 19:41:25','asdasdasd',NULL);
INSERT INTO "staff" ("id","name","phone","role","address","aadhar_number","monthly_salary","joining_date","status","created_at","updated_at","shop_id","deleted_at") VALUES (1,'Raju Kumar','9876543210','Salesman',NULL,NULL,15000,'2025-11-02 10:53:52','active','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL),
 (2,'Mohan Lal','9123456780','Labour',NULL,NULL,12000,'2025-05-02 10:53:52','active','2026-05-02 10:53:52','2026-05-02 10:53:52',1,NULL);
INSERT INTO "stock_transactions" ("id","product_id","type","quantity","price","reference","notes","created_at","updated_at","shop_id") VALUES (1,1,'purchase',15,3200,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1),
 (2,2,'purchase',30,650,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1),
 (3,3,'purchase',100,120,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1),
 (4,4,'purchase',45,250,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1),
 (5,5,'purchase',20,1400,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1),
 (6,6,'purchase',200,35,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1),
 (7,7,'purchase',5,1500,'Opening Stock',NULL,'2026-05-02 10:53:52','2026-05-02 10:53:52',1),
 (8,8,'purchase',111,1000,'Initial Stock',NULL,'2026-05-04 05:56:46','2026-05-04 05:56:46',2),
 (9,8,'sale',-1,2000,NULL,NULL,'2026-05-04 05:57:24','2026-05-04 05:57:24',2),
 (10,9,'purchase',100,200,'Initial Stock',NULL,'2026-05-05 10:31:35','2026-05-05 10:31:35',2),
 (11,9,'sale',-6,400,NULL,NULL,'2026-05-05 10:34:11','2026-05-05 10:34:11',2),
 (12,8,'sale',-3,2000,NULL,NULL,'2026-05-05 10:34:11','2026-05-05 10:34:11',2),
 (13,10,'purchase',100,100,'Initial Stock',NULL,'2026-05-09 19:49:45','2026-05-09 19:49:45',3),
 (14,11,'purchase',500,380,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1),
 (15,12,'purchase',10000,6,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1),
 (16,13,'purchase',20,2500,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1),
 (17,14,'purchase',15,4500,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1),
 (18,15,'purchase',120,280,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1),
 (19,16,'purchase',50,180,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1),
 (20,17,'purchase',80,70,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1),
 (21,18,'purchase',200,45,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1),
 (22,19,'purchase',40,220,'Opening Stock from BuildTech',NULL,'2026-05-09 19:58:39','2026-05-09 19:58:39',1),
 (23,10,'sale',-1,200,NULL,NULL,'2026-05-09 20:01:23','2026-05-09 20:01:23',3),
 (24,20,'purchase',55,600,'Initial Stock',NULL,'2026-05-09 20:58:29','2026-05-09 20:58:29',3),
 (25,9,'sale',-1,400,NULL,NULL,'2026-05-10 05:10:24','2026-05-10 05:10:24',2),
 (26,20,'sale',-1,800,NULL,NULL,'2026-05-10 06:46:05','2026-05-10 06:46:05',3),
 (27,9,'sale',-1,400,NULL,NULL,'2026-05-10 07:32:38','2026-05-10 07:32:38',2);
INSERT INTO "subscription_requests" ("id","shop_id","plan_type","amount","status","created_at","updated_at") VALUES (1,3,'monthly',499,'approved','2026-05-10 04:01:06','2026-05-10 04:11:46'),
 (2,2,'yearly',4999,'approved','2026-05-10 04:47:45','2026-05-10 04:48:06');
INSERT INTO "supplier_transactions" ("id","shop_id","supplier_id","type","amount","transaction_date","notes","created_at","updated_at") VALUES (1,2,1,'purchase',111000,'2026-05-04 05:56:46','Initial stock for product: wtie','2026-05-04 05:56:46','2026-05-04 05:56:46'),
 (2,2,1,'purchase',20000,'2026-05-05 10:31:35','Initial stock for product: kkasd','2026-05-05 10:31:35','2026-05-05 10:31:35'),
 (3,2,1,'purchase',30000,'2026-05-05T10:31','llll','2026-05-05 10:32:16','2026-05-05 10:32:16'),
 (4,3,2,'purchase',10000,'2026-05-09 19:49:45','Initial stock for product: ploo','2026-05-09 19:49:45','2026-05-09 19:49:45'),
 (5,3,2,'purchase',33000,'2026-05-09 20:58:29','Initial stock for product: Hgf','2026-05-09 20:58:29','2026-05-09 20:58:29');
INSERT INTO "suppliers" ("id","shop_id","name","phone","email","address","created_at","updated_at","deleted_at") VALUES (1,2,'asdasd','12344567','asdasdasdasdasd@gmail.com','asdasdasdasdasd','2026-05-04 05:56:13','2026-05-04 05:56:13',NULL),
 (2,3,'komal','123456','komal@gmail.com','asdasdasd.,a.s,d.asd','2026-05-09 19:49:08','2026-05-09 19:49:08',NULL),
 (3,1,'BuildTech Global Suppliers','9876543210','contact@buildtech.com','123 Industrial Area, Phase 1','2026-05-09 19:58:39','2026-05-09 19:58:39',NULL);
INSERT INTO "users" ("id","name","email","email_verified_at","password","remember_token","created_at","updated_at","shop_id","is_super_admin","mobile","deleted_at") VALUES (1,'vineet','vineet@gmail.com',NULL,'$2y$12$65jNUYEYiTiAk8TdJA85uOd3rvsUPBHCVFLJaI2fzAtHtC77LKFO2',NULL,'2026-05-02 11:06:10','2026-05-02 12:24:49',2,1,'9169704496',NULL),
 (2,'vineet','vin@gmaill.com',NULL,'$2y$12$lteC6K8DebrvM2GjdnkHBedjPdEFj8B4W2PEEbpQCaXjbTKuZR7G6',NULL,'2026-05-09 19:41:26','2026-05-09 19:41:26',3,0,'7398222389',NULL);
CREATE UNIQUE INDEX "bills_shop_id_bill_number_unique" on "bills" ("shop_id", "bill_number");
CREATE INDEX "cache_expiration_index" on "cache" ("expiration");
CREATE INDEX "cache_locks_expiration_index" on "cache_locks" ("expiration");
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs" ("uuid");
CREATE INDEX "jobs_queue_index" on "jobs" ("queue");
CREATE INDEX "personal_access_tokens_expires_at_index" on "personal_access_tokens" ("expires_at");
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" on "personal_access_tokens" ("token");
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" on "personal_access_tokens" ("tokenable_type", "tokenable_id");
CREATE UNIQUE INDEX "products_sku_unique" on "products" ("sku");
CREATE UNIQUE INDEX "quotations_shop_id_quotation_number_unique" on "quotations" ("shop_id", "quotation_number");
CREATE INDEX "sessions_last_activity_index" on "sessions" ("last_activity");
CREATE INDEX "sessions_user_id_index" on "sessions" ("user_id");
CREATE UNIQUE INDEX "shops_domain_unique" on "shops" ("domain");
CREATE UNIQUE INDEX "users_email_unique" on "users" ("email");
CREATE UNIQUE INDEX "users_mobile_unique" on "users" ("mobile");
COMMIT;
