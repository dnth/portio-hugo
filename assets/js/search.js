document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let searchIndex = [];

    // Fetch all blog posts and projects data
    console.log('Fetching search index from /index.json...');
    fetch('/index.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log('Response received:', response);
            return response.json();
        })
        .then(data => {
            console.log('Search index loaded. Raw data:', data);
            searchIndex = data; // Use the data directly since it's already an array
            console.log('Search index size:', searchIndex.length, 'items');
        })
        .catch(error => {
            console.error('Error loading search index:', error);
            searchResults.innerHTML = '<div class="search-result-item text-danger">Error loading search data</div>';
        });

    function highlightText(text, query) {
        if (!text) return '';
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Handle input changes
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        
        if (query.length < 2) {
            searchResults.classList.add('d-none');
            return;
        }

        console.log('Searching for:', query);
        console.log('Current search index:', searchIndex);

        const filteredResults = searchIndex.filter(item => {
            const titleMatch = item.title?.toLowerCase().includes(query);
            const descriptionMatch = item.description?.toLowerCase().includes(query);
            const contentMatch = item.content?.toLowerCase().includes(query);
            const typeMatch = item.type?.toLowerCase().includes(query);
            
            console.log('Checking item:', {
                title: item.title,
                titleMatch,
                descriptionMatch,
                contentMatch,
                typeMatch
            });
            
            return titleMatch || descriptionMatch || contentMatch || typeMatch;
        }).slice(0, 5); // Limit to 5 results

        console.log('Found results:', filteredResults.length);
        console.log('Filtered results:', filteredResults);

        if (filteredResults.length > 0) {
            searchResults.innerHTML = filteredResults.map(result => {
                let preview = '';
                
                // Try to find the matching content around the search term
                if (result.content) {
                    const contentLower = result.content.toLowerCase();
                    const index = contentLower.indexOf(query);
                    if (index !== -1) {
                        const start = Math.max(0, index - 50);
                        const end = Math.min(result.content.length, index + query.length + 50);
                        preview = result.content.slice(start, end);
                        if (start > 0) preview = '...' + preview;
                        if (end < result.content.length) preview += '...';
                    }
                }

                // If no content preview, use description
                if (!preview && result.description) {
                    preview = result.description;
                }

                return `
                    <div class="search-result-item" onclick="window.location.href='${result.permalink}'">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="fw-bold">${highlightText(result.title, query)}</div>
                            <span class="badge bg-${result.type === 'Blog' ? 'primary' : 'success'} text-white">${result.type}</span>
                        </div>
                        <div class="small text-muted mt-1">${highlightText(preview, query)}</div>
                    </div>
                `;
            }).join('');
            searchResults.classList.remove('d-none');
        } else {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
            searchResults.classList.remove('d-none');
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('d-none');
        }
    });

    // Show results again when focusing on input
    searchInput.addEventListener('focus', function() {
        if (searchInput.value.length >= 2) {
            searchResults.classList.remove('d-none');
        }
    });
}); 