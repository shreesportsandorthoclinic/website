import "server-only";

/* Live Google reviews.

   Pulled from the Google Places API (New) rather than scraped off the Maps
   page — scraping Maps breaks Google's terms and the markup changes without
   warning. The API returns the place's overall rating, the total review count
   and up to FIVE reviews (that is Google's hard limit; there is no paid tier
   that returns more).

   Nothing here is written or edited by the clinic: review text, author name,
   rating and date come straight from Google, which is what keeps this page on
   the right side of the NMC's rules on testimonials.

   Setup — both env vars are required, otherwise the site falls back to a
   plain "read our reviews on Google" link:

     GOOGLE_PLACES_API_KEY   Google Cloud key with "Places API (New)" enabled.
                             Restrict it to that API. It is only ever used
                             server-side, so it is never exposed to visitors.
     GOOGLE_PLACE_ID         The clinic's Place ID (starts "ChIJ…"). Find it
                             at https://developers.google.com/maps/documentation/places/web-service/place-id
                             by searching for the clinic name.

   Google's terms allow caching this data for up to 30 days; we re-fetch
   hourly so new reviews appear on their own without hammering the quota. */

export type GoogleReview = {
  id: string;
  author: string;
  authorUri?: string;
  photoUri?: string;
  rating: number;
  text: string;
  when: string;
  uri?: string;
};

export type ReviewData = {
  configured: true;
  rating: number | null;
  total: number | null;
  reviews: GoogleReview[];
  mapsUri?: string;
};

export type ReviewsResult = ReviewData | { configured: false; reason: string };

const ENDPOINT = "https://places.googleapis.com/v1/places";
const FIELD_MASK = "id,rating,userRatingCount,googleMapsUri,reviews";

type ApiReview = {
  name?: string;
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  googleMapsUri?: string;
};

export async function getGoogleReviews(): Promise<ReviewsResult> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!key || !placeId) {
    return { configured: false, reason: "GOOGLE_PLACES_API_KEY / GOOGLE_PLACE_ID not set" };
  }

  try {
    const response = await fetch(`${ENDPOINT}/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      /* Re-checked at most once an hour; new reviews appear without a deploy. */
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("[reviews] Places API responded", response.status, await response.text().catch(() => ""));
      return { configured: false, reason: `Places API returned ${response.status}` };
    }

    const data = (await response.json()) as {
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
      reviews?: ApiReview[];
    };

    const reviews: GoogleReview[] = (data.reviews ?? [])
      .map((r, i) => ({
        id: r.name ?? `review-${i}`,
        author: r.authorAttribution?.displayName?.trim() || "Google user",
        authorUri: r.authorAttribution?.uri,
        photoUri: r.authorAttribution?.photoUri,
        rating: typeof r.rating === "number" ? r.rating : 0,
        text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
        when: r.relativePublishTimeDescription ?? "",
        uri: r.googleMapsUri,
      }))
      .filter((r) => r.text.length > 0);

    return {
      configured: true,
      rating: typeof data.rating === "number" ? data.rating : null,
      total: typeof data.userRatingCount === "number" ? data.userRatingCount : null,
      reviews,
      mapsUri: data.googleMapsUri,
    };
  } catch (error) {
    console.error("[reviews] Places API request failed", error);
    return { configured: false, reason: "Places API request failed" };
  }
}

export function stars(rating: number) {
  const filled = Math.round(rating);
  return "★".repeat(Math.max(0, Math.min(5, filled))).padEnd(5, "☆");
}
