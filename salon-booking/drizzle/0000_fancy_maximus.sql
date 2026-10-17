CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" text NOT NULL,
	"service_name" text NOT NULL,
	"date" text NOT NULL,
	"start_minute" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"customer_name" text NOT NULL,
	"contact" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "bookings_date_idx" ON "bookings" USING btree ("date");