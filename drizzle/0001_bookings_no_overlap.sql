-- Database-level guard against double booking: two active bookings on the same
-- date may not overlap in time. Cancelled bookings are ignored.
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap" EXCLUDE USING gist (
	"date" WITH =,
	int4range("start_minute", "start_minute" + "duration_minutes") WITH &&
) WHERE ("status" <> 'cancelled');
