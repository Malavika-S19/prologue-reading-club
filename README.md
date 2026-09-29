# PROLOGUE — The Reading Club of LBSITW

A responsive multi-page reading club website with a warm editorial design, book browsing, chapter preview cards, activities, events, gallery, membership registration UI, and an accessible light/dark theme toggle.

## Pages
- `index.html` — Home, club introduction, vision and mission
- `about.html` — About PROLOGUE, vision and mission
- `why-join.html` — Membership benefits
- `books.html` — Searchable book collection, genre/mood filters and chapter previews
- `activities.html` — Club activity descriptions and schedule
- `events.html` — Upcoming event cards
- `gallery.html` — Reading imagery gallery
- `join.html` — Membership registration form with validation and success feedback
- `contact.html` — Contact and social links

## Run locally
1. Open this folder in Visual Studio Code.
2. Open `index.html` and click **Go Live** if Live Server is installed.
3. Use the navigation to explore the pages. The theme button is the small moon/sun icon at the top right.

## Before public launch
The registration form currently validates entries and displays a success confirmation in the browser. To deliver registrations to club administrators, connect a trusted form backend or server endpoint. Replace contact and social URLs with the club's official contact channels before publishing. Confirm the activity schedule with the club organisers before treating it as official.

Book covers are edition-specific images sourced from Google Books or Open Library using catalogue IDs/ISBNs. The catalogue hides any title whose original edition cover fails to load; it does not generate or substitute custom covers. Internet access is required to load external cover images. Public-domain reading links open in a new tab where available.

## Visual enhancements (Version 5)
- Expanded gallery to 15 image-led moments using the provided PROLOGUE image set.
- Added click-to-enlarge gallery lightbox with Escape/close support.
- Increased homepage hero, motto strip, vision/mission cards, and call-to-action sizing for stronger visual hierarchy.
- Added scroll-reveal motion that respects reduced-motion preferences.


Library update: includes additional Malayalam novels (Aadujeevitham, Chemmeen, Balyakalasakhi, Pathummayude Aadu, Khasakkinte Ithihasam, Oru Desathinte Katha, Mayyazhippuzhayude Theerangalil) and Hindi titles (Godaan, Nirmala). Chapter notes for copyrighted titles are original reading guides, not reproduced book chapters.

The homepage includes a lightweight CSS animated book-opening illustration. It is a website animation, not a downloadable video file, and respects reduced-motion preferences.


## Cover artwork and animation

The library uses actual edition cover images from Google Books and Open Library. No custom-generated cover art is used as a fallback. The welcome screen has a CSS-animated open book with page turns, floating sparkles and orbiting accents; the homepage book illustration also moves. No video file or external image host is required for the covers/animation.


## Original-cover policy
- Book cards appear only after a real external edition cover image successfully loads.
- If an edition has no available cover image, the card is removed instead of showing a generated placeholder.
- Internet access is required for Google Books/Open Library cover images.


Latest catalogue adjustment: Randamoozham has been removed at the user's request. Chemmeen uses the Malayalam-edition ISBN 9788171305506; it is shown only if its original cover image loads successfully.
