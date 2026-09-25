import Link from "next/link";
import { formatKes, listingTypeLabel } from "@/lib/format";

type ListingCardProps = {
  id: string;
  title: string;
  destinationName: string;
  destinationImageUrl?: string | null;
  type: string;
  basePriceCents: number;
  supplierName: string;
  supplierVerified: boolean;
  isSeedData: boolean;
};

export function ListingCard(props: ListingCardProps) {
  return (
    <Link
      href={`/listings/${props.id}`}
      className="block overflow-hidden rounded-card border border-sandDeep bg-white transition-shadow hover:shadow-md dark:border-nightBorder dark:bg-nightCard"
    >
      {/* No listing-specific photos yet — the destination's photo stands in
          so cards look real instead of showing a plain block; falls back
          to the gradient placeholder if a destination has no image. */}
      {props.destinationImageUrl ? (
        <img
          src={props.destinationImageUrl}
          alt={props.destinationName}
          loading="lazy"
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-acacia/20 to-savanna/20">
          <span className="text-sm text-ink/40 dark:text-nightInk/40">{listingTypeLabel(props.type)}</span>
        </div>
      )}
      <div className="p-4">
        {props.isSeedData && (
          <span className="mb-2 inline-block rounded bg-sandDeep px-2 py-0.5 text-xs text-ink/60 dark:bg-nightBorder dark:text-nightInk/60">
            Demo listing
          </span>
        )}
        <p className="font-medium text-ink dark:text-nightInk">{props.title}</p>
        <p className="mt-1 text-sm text-ink/60 dark:text-nightInk/60">
          {props.destinationName} · {listingTypeLabel(props.type)}
        </p>
        <p className="mt-1 text-xs text-ink/50 dark:text-nightInk/50">
          {props.supplierName}
          {props.supplierVerified ? " · Verified" : ""}
        </p>
        <p className="mt-3 font-medium text-savannaDark dark:text-savanna">{formatKes(props.basePriceCents)}</p>
      </div>
    </Link>
  );
}
