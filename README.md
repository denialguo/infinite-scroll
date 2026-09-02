<div align="center">
  <img src="icon128.png" width="96" alt="Google Infinite Scroll icon">
  <h1>Google Infinite Scroll</h1>
  <p>Restores continuous scrolling to Google Search by loading and rebuilding the next page of results in place.</p>

  <a href="https://chromewebstore.google.com/detail/google-infinite-scroll/pohbddcpalgkpoappjppcimepfkklbhh"><img src="https://img.shields.io/badge/Chrome_Web_Store-Install-4285F4?logo=googlechrome&logoColor=white" alt="Install from Chrome Web Store"></a>
  <img src="https://img.shields.io/badge/Manifest-V3-34A853" alt="Manifest V3">
</div>

## How it works

When the user nears the bottom of a Google results page, the extension fetches the next result page in the background instead of navigating away. It then parses that HTML, extracts the useful search-result data, reconstructs matching cards, and appends them to the current page.

## Features

- Automatically loads the next result page near the bottom of the document.
- Preserves titles, links, snippets, site names, favicons, and thumbnails when rebuilding results.
- Handles multiple Google image-embedding formats when extracting thumbnails from fetched pages.
- Adds page boundaries so appended result batches remain understandable.
- Updates Google's next-page URL as each batch is loaded and stops cleanly when no next page remains.
- Guards against duplicate requests with an in-flight fetch lock.

## Tech

`JavaScript` · `Manifest V3` · `Fetch API` · `DOMParser` · `Content Scripts` · `DOM reconstruction`

## Install locally

1. Clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the repository folder.

Or install the published version from the [Chrome Web Store](https://chromewebstore.google.com/detail/google-infinite-scroll/pohbddcpalgkpoappjppcimepfkklbhh).

---

Part of [**Daniel's QOL**](https://github.com/denialguo/Daniel-s-QOL), a collection of 9 published Chrome extensions.