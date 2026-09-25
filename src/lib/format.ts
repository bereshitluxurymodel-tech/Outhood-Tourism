export function formatKes(cents: number): string {
  const amount = cents / 100;
  return `KSh ${amount.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export function listingTypeLabel(type: string): string {
  switch (type) {
    case "ACCOMMODATION":
      return "Stay";
    case "EXPERIENCE":
      return "Experience";
    case "TOUR_PACKAGE":
      return "Tour package";
    default:
      return type;
  }
}
