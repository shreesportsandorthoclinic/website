import Script from "next/script";

/* The clinic's Google reviews, embedded from Elfsight. The widget fetches and
   renders everything itself — star rating, reviewer names, text — straight
   from the Google Business Profile, so nothing here is authored or edited by
   the clinic (see the note next to it on /reviews and the home page, and the
   third-party-content rules in CLAUDE.md).

   The widget id is fixed to this clinic's Elfsight app. `platform.js` is
   loaded once and is idempotent if the component appears on more than one
   page. */

const ELFSIGHT_APP_ID = "elfsight-app-b5b45a27-8b94-46f8-8d73-32f582c91a4f";

export default function GoogleReviews() {
  return (
    <>
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
      <div className={ELFSIGHT_APP_ID} data-elfsight-app-lazy />
    </>
  );
}
