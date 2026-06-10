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

    return `
        <article class="${classes.join(" ")}">
            ${label}
            ${title}
            ${renderEventMeta(event)}
            ${description}
            ${renderSpeakers(event.speakers)}
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
