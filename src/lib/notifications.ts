import { preferences } from '$lib/preferences';
import { get } from 'svelte/store';
import { toast } from 'svelte-sonner';
import GitHubIcon from '$lib/components/custom-ui/GitHubIcon.svelte';

const prefs = get(preferences).notifications;
const CANCEL_THRESHOLD = 2;
// const TIMEOUT_ms = 1000 * 60 * 1.5;
const TIMEOUT_ms = 0;
const DELAY_ms = 1000 * 5;
const NOTIFICATION_DURATION_ms = 1000 * 10;

const showStar = !(prefs?.starOpened || prefs?.starCancelledTimes > CANCEL_THRESHOLD);
const showIssue = !(prefs?.issuesOpened || prefs?.issuesCancelledTimes > CANCEL_THRESHOLD);

let starTimer: ReturnType<typeof setTimeout> | null = null;
let issueTimer: ReturnType<typeof setTimeout> | null = null;

function showWhenFocused(cb: () => void) {
    // show immediately if page is active
    if (document.hasFocus() || document.visibilityState === 'visible') {
        cb();
        return () => { };
    }

    // otherwise run once when page becomes focused/visible
    const handler = () => {
        if (document.hasFocus() || document.visibilityState === 'visible') {
            cleanup();
            cb();
        }
    };
    const cleanup = () => {
        window.removeEventListener('focus', handler);
        document.removeEventListener('visibilitychange', handler);
    };
    window.addEventListener('focus', handler, { passive: true });
    document.addEventListener('visibilitychange', handler, { passive: true });
    return cleanup;
}

function scheduleStarNotification() {
    starTimer = setTimeout(() => {
        starTimer = null;
        showWhenFocused(() => {
            toast('Do you like unBLOCHed?', {
                icon: GitHubIcon,
                action: {
                    label: 'GitHub',
                    onClick: () => {
                        window.open('https://github.com/gamberoillecito/unBLOCHed', '_blank');
                        preferences.update((x) => ({ ...x, notifications: { ...x.notifications, starOpened: true } }));
                    }
                },
                description: 'Give it a star ★!',
                duration: NOTIFICATION_DURATION_ms,
                onDismiss: () =>
                    preferences.update((x) => ({ ...x, notifications: { ...x.notifications, starCancelledTimes: x.notifications.starCancelledTimes + 1 } }))
            });
        });
    }, TIMEOUT_ms);
}

function scheduleIssueNotification() {
    issueTimer = setTimeout(() => {
        issueTimer = null;
        showWhenFocused(() => {
            toast.error('Found any issues?', {
                icon: GitHubIcon,
                action: {
                    label: 'GitHub',
                    onClick: () => {
                        window.open('https://github.com/gamberoillecito/unBLOCHed/issues/new', '_blank');
                        preferences.update((x) => ({ ...x, notifications: { ...x.notifications, issuesOpened: true } }));
                    }
                },
                description: 'Report it on GitHub!',
                duration: NOTIFICATION_DURATION_ms,
                onDismiss: () =>
                    preferences.update((x) => ({ ...x, notifications: { ...x.notifications, issuesCancelledTimes: x.notifications.issuesCancelledTimes + 1 } }))
            });
        });
    }, TIMEOUT_ms + DELAY_ms);
}

export function scheduleNotifications() {
    if (showStar) scheduleStarNotification();
    if (showIssue) scheduleIssueNotification();
}

export function cancelScheduledNotifications() {
    if (starTimer) {
        clearTimeout(starTimer);
        starTimer = null;
    }
    if (issueTimer) {
        clearTimeout(issueTimer);
        issueTimer = null;
    }
    // listeners created by showWhenFocused are one-shot; no extra state to clean here
}