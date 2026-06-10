function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function renderSpeakers(speakers) {
    if (!speakers || speakers.length === 0) return "";

    const items = speakers.map((speaker) => {
        const talkTitle = speaker.title || speaker.talk;
        const affiliation = speaker.affiliation
            ? `<span class="speaker-affiliation">${escapeHtml(speaker.affiliation)}</span>`
            : "";
        const talk = talkTitle
            ? `<span class="speaker-talk">${escapeHtml(talkTitle)}</span>`
            : "";

        return `
            <li>
                <span class="speaker-name">${escapeHtml(speaker.name)}</span>
                ${talk}
                ${affiliation}
            </li>
        `;
    });

    return `<ul class="speaker-list">${items.join("")}</ul>`;
}

function renderEventActions() {
    return `
        <div class="event-actions">
            <div class="cta-row">
                <a class="btn btn-primary" href="zoom/">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    Join on Zoom
                </a>
                <a class="btn btn-secondary" href="registration/">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    Register
                </a>
            </div>
        </div>
    `;
}

function renderEventMeta(event) {
    const tags = [
        `<span class="tag tag--date">${escapeHtml(event.dateLabel || event.date)}</span>`,
        `<span class="tag">${escapeHtml(event.location)}</span>`,
    ];

    if (event.cancelled) {
        tags.push('<span class="tag tag--cancelled">Cancelled</span>');
    }

    return `<div class="event-meta">${tags.join("")}</div>`;
}

function renderEventCard(event, { upcoming = false } = {}) {
    const classes = ["card", "event-card"];
    if (upcoming) classes.push("event-card--upcoming");
    if (event.cancelled) classes.push("event-card--cancelled");

    const label = upcoming
        ? '<p class="event-label">Upcoming session</p>'
        : "";
    const title = event.title
        ? `<h3 class="event-title">${escapeHtml(event.title)}</h3>`
        : upcoming
          ? `<h3 class="event-title">Next session</h3>`
          : "";
    const description = event.description
        ? `<p>${escapeHtml(event.description)}</p>`
        : "";
    const actions = upcoming ? renderEventActions() : "";

    return `
        <article class="${classes.join(" ")}">
            ${label}
            ${title}
            ${renderEventMeta(event)}
            ${description}
            ${renderSpeakers(event.speakers)}
            ${actions}
        </article>
    `;
}

async function loadEvents(dataUrl) {
    const response = await fetch(dataUrl);
    if (!response.ok) {
        throw new Error(`Failed to load events (${response.status})`);
    }
    return response.json();
}

function renderUpcomingEvent(container, event) {
    if (!container) return;
    if (!event) {
        container.hidden = true;
        return;
    }
    container.innerHTML = renderEventCard(event, { upcoming: true });
    container.hidden = false;
}

function renderPastEvents(container, events) {
    if (!container) return;

    if (!events || events.length === 0) {
        container.innerHTML = '<p class="page-subtitle">No past events yet.</p>';
        return;
    }

    const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));
    container.innerHTML = sorted.map((event) => renderEventCard(event)).join("");
}
