export function initResponsiveTables() {
    const applyLabels = () => {
        // Find all tables on the page
        document.querySelectorAll('table').forEach(table => {
            // Get all header text from the thead
            const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
            
            // Loop through each row in tbody
            table.querySelectorAll('tbody tr').forEach(tr => {
                // Loop through each cell
                Array.from(tr.querySelectorAll('td')).forEach((td, index) => {
                    // Only apply if there's a corresponding header and it's not already set
                    if (headers[index] && !td.hasAttribute('data-label')) {
                        td.setAttribute('data-label', headers[index]);
                    }
                });
            });
        });
    };

    // Run once initially
    applyLabels();

    // Set up a MutationObserver to watch for dynamic DOM changes (React renders)
    const observer = new MutationObserver((mutations) => {
        let shouldApply = false;
        for (const m of mutations) {
            if (m.addedNodes.length > 0) {
                // Check if any added node is an element (to avoid text nodes triggering this constantly)
                for (const node of m.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        shouldApply = true;
                        break;
                    }
                }
            }
            if (shouldApply) break;
        }
        
        if (shouldApply) {
            applyLabels();
        }
    });

    // Observe the entire body for changes
    observer.observe(document.body, { childList: true, subtree: true });
}
