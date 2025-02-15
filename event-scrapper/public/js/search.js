document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const eventsContainer = document.querySelector('.events-container');

    searchInput.addEventListener('input', debounce(async (e) => {
        const searchTerm = e.target.value.trim();
        
        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ searchTerm })
            });

            const events = await response.json();
            updateEventsDisplay(events);
        } catch (error) {
            console.error('Error searching events:', error);
        }
    }, 300));

    function updateEventsDisplay(events) {
        if (events.length === 0) {
            eventsContainer.innerHTML = `
                <div class="no-events">
                    <i class="fas fa-search"></i>
                    <p>No events found matching your search.</p>
                </div>
            `;
            return;
        }

        eventsContainer.innerHTML = events.map(event => `
            <div class="event-card">
                <div class="event-image-container">
                    ${event.image 
                        ? `<img src="${event.image}" alt="${event.name}" class="event-image" loading="lazy">` 
                        : `<div class="placeholder-image"><i class="fas fa-image"></i></div>`
                    }
                    <div class="event-date-badge">
                        ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                </div>
                <div class="event-content">
                    <h2 class="event-title">${event.name}</h2>
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.location}
                    </p>
                    <p class="event-description">${event.description}</p>
                    <div class="event-footer">
                        <a href="/ticket?eventId=${event.id}" class="btn">
                            <i class="fas fa-ticket-alt"></i>
                            Get Tickets
                        </a>
                        <div class="event-price">
                            ${event.price ? `<span>$${event.price}</span>` : '<span>Free</span>'}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
