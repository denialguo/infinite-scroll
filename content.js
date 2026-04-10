let isFetching = false;

window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
        loadNextPage();
    }
});

async function loadNextPage() {
    if (isFetching) return;
    
    const nextButton = document.getElementById('pnnext');
    if (!nextButton) return; 

    isFetching = true;
    const nextUrl = nextButton.href;

    try {
        const response = await fetch(nextUrl);
        const text = await response.text();
        
        // --- 1. IMAGE MINING ---
        const imageMap = {};
        let match;
        
        const regex1 = /var\s+s\s*=\s*'([^']+)';\s*var\s+ii\s*=\s*\['([^']+)'\]/g;
        while ((match = regex1.exec(text)) !== null) {
            imageMap[match[2]] = decodeImageData(match[1]);
        }

        const regex2 = /_setImagesSrc\(\s*\['([^']+)'\]\s*,\s*'([^']+)'\s*\)/g;
        while ((match = regex2.exec(text)) !== null) {
            imageMap[match[1]] = decodeImageData(match[2]);
        }

        const regex3 = /\(function\(\)\{var\s+s='(data:image[^']+)';\s*var\s+ii=\['([^']+)'\]/g;
        while ((match = regex3.exec(text)) !== null) {
            imageMap[match[2]] = decodeImageData(match[1]);
        }

        // --- 2. PARSE PAGE ---
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const newResults = doc.getElementById('rso');
        const currentResults = document.getElementById('rso');

        if (newResults && currentResults) {
            
            const pageWrapper = document.createElement('div');
            pageWrapper.className = 'infinite-scroll-page';
            
            try {
                const pageNum = Math.floor(new URL(nextUrl).searchParams.get('start') / 10) + 1;
                pageWrapper.setAttribute('data-label', `Page ${pageNum}`);
            } catch(e) {}

            // --- 3. EXTRACT & REBUILD EACH RESULT ---
            const resultBlocks = newResults.querySelectorAll('[data-hveid]');
            
            resultBlocks.forEach(block => {
                const data = extractResult(block, imageMap);
                if (data) {
                    pageWrapper.appendChild(buildResultCard(data));
                }
            });

            // Fallback: if extraction found nothing, dump raw HTML
            if (pageWrapper.children.length === 0) {
                pageWrapper.innerHTML = newResults.innerHTML;
            }

            currentResults.appendChild(pageWrapper);

            // Update Next Button
            const newNextBtn = doc.getElementById('pnnext');
            if (newNextBtn) {
                nextButton.href = newNextBtn.href;
            } else {
                nextButton.remove();
            }
        }
    } catch (err) {
        console.error("Infinite Scroll Error:", err);
    } finally {
        isFetching = false;
    }
}

function extractResult(block, imageMap) {
    const titleEl = block.querySelector('h3');
    const linkEl = block.querySelector('a[href^="http"]');
    
    if (!titleEl || !linkEl) return null;
    
    const title = titleEl.textContent.trim();
    const url = linkEl.href;
    
    // Snippet
    const snippetEl = block.querySelector('.VwiC3b, .IsZvec, [data-snf="nke7rc"]');
    const snippet = snippetEl ? snippetEl.textContent.trim() : '';
    
    // Site name & cite
    const siteNameEl = block.querySelector('.VuuXrf');
    const siteName = siteNameEl ? siteNameEl.textContent.trim() : '';
    const citeEl = block.querySelector('cite');
    const citeUrl = citeEl ? citeEl.textContent.trim() : url;
    
    // Favicon
    let faviconSrc = '';
    const faviconEl = block.querySelector('img.XNo5Ab, .eqA2re img');
    if (faviconEl && faviconEl.src && faviconEl.src.startsWith('data:')) {
        faviconSrc = faviconEl.src;
    }
    
    // Thumbnail
    let thumbSrc = '';
    // Check all images, pick the one that's a thumbnail (not favicon)
    block.querySelectorAll('img').forEach(img => {
        if (thumbSrc) return;
        if (img === faviconEl) return; // skip favicon
        if (img.classList.contains('XNo5Ab')) return; // skip favicons
        
        const id = img.id;
        if (id && imageMap[id]) {
            thumbSrc = imageMap[id];
        } else {
            const src = img.getAttribute('data-src') || img.getAttribute('data-lsrc') || img.src;
            if (src && !src.startsWith('data:image/gif') && src.startsWith('data:image/')) {
                thumbSrc = src;
            }
        }
    });
    
    return { title, url, snippet, siteName, citeUrl, faviconSrc, thumbSrc };
}

function buildResultCard(data) {
    const card = document.createElement('div');
    card.className = 'isr-card';
    
    let thumbHtml = '';
    if (data.thumbSrc) {
        thumbHtml = `<a class="isr-thumb" href="${esc(data.url)}"><img src="${esc(data.thumbSrc)}" alt=""></a>`;
    }
    
    card.innerHTML = `
        <div class="isr-body">
            <div class="isr-header">
                ${data.faviconSrc ? `<img class="isr-favicon" src="${esc(data.faviconSrc)}" alt="">` : ''}
                <div class="isr-site-info">
                    ${data.siteName ? `<span class="isr-site-name">${esc(data.siteName)}</span>` : ''}
                    <cite class="isr-cite">${esc(data.citeUrl)}</cite>
                </div>
            </div>
            <a class="isr-title" href="${esc(data.url)}">${esc(data.title)}</a>
            ${data.snippet ? `<div class="isr-snippet">${esc(data.snippet)}</div>` : ''}
        </div>
        ${thumbHtml}
    `;
    
    return card;
}

function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function decodeImageData(str) {
    try {
        return str
            .replace(/\\x3d/g, '=').replace(/\\x26/g, '&')
            .replace(/\\x2F/g, '/').replace(/\\x2f/g, '/')
            .replace(/\\x3a/g, ':').replace(/\\x3A/g, ':')
            .replace(/\\x2B/g, '+').replace(/\\x2b/g, '+')
            .replace(/\\n/g, '').replace(/\\\\/g, '\\');
    } catch(e) {
        return str;
    }
}