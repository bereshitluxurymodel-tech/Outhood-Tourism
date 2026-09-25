# Assignment Requirement Mapping

| Assignment Requirement | System Component |
|---|---|
| Client needs analysis | Search/filter behaviour (Phase 2) + `User`/booking history data |
| Travel distribution map | Supplier → Outhood → Customer architecture — `docs/business-model.md` |
| Technology solution recommendation | `docs/architecture.md` |
| Travel itinerary | `ItineraryItem` model + itinerary display (Phase 2/3) |
| Supplier selection | Supplier onboarding + `Supplier.verificationStatus` workflow |
| Quotation/pricing | `Quotation` model + `src/server/services/commission.ts` |
| Reservation records | `Booking` model + state machine — `docs/booking-workflow.md` |
| Travel documentation | Booking confirmation + itinerary display (documents; generation is a Should-have) |
| Marketing strategy | Homepage acquisition structure + SEO plan (Phase 7) |
| Administrative records | Admin dashboard (Phase 5) + `AuditLog` |
| Complaint response | `Complaint` model + workflow (Phase 6) |
| Service recovery | `ServiceRecovery` model, linked to complaints, full audit trail |

This mapping should be kept up to date as each phase lands — update the
right-hand column with the actual page/route once it's built, not just
the schema.
