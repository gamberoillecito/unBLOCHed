import { preferences } from '$lib/preferences';
import { get } from 'svelte/store';
import { toast } from 'svelte-sonner';
import GitHubIcon from '$lib/components/custom-ui/GitHubIcon.svelte';


let notificationPreferences = get(preferences).notifications;
/** How many times the user should cancel a notification before I stop showing it */
const CANCEL_THRESHOLD = 2;
const TIMEOUT_ms = 1000 * 60 * 2;
// const TIMEOUT_ms = 0;
const DELAY_ms = 1000 * 5;
const NOTIFICATION_DURATION_ms = 1000 * 10;

let showStar = !(notificationPreferences?.starOpened || notificationPreferences?.starCancelledTimes > CANCEL_THRESHOLD);
let showIssue = !(notificationPreferences?.issuesOpened || notificationPreferences?.issuesCancelledTimes > CANCEL_THRESHOLD);

function scheduleStarNotification() {
    setTimeout(
        () => {
            toast('Do you like unBLOCHed?', {
                icon: GitHubIcon,
                action: {
                    label: 'GitHub',
                    onClick: () => {
                        window.open('https://github.com/gamberoillecito/unBLOCHed', '_blank');
                        // Once the user has clicked the button, stop notifying every time
                        preferences.update((x) => { return { ...x, notifications: { ...x.notifications, starOpened: true } } })
                    }
                },
                description: 'Give it a star!',
                duration: NOTIFICATION_DURATION_ms,
                // Increment the counter of how many times the user closed the notification to avoid bombarding every time if not interested
                onDismiss: () => {
                    preferences.update((x) => { return { ...x, notifications: { ...x.notifications, starCancelledTimes: x.notifications.starCancelledTimes + 1 } } })
                }
            });
        },
        TIMEOUT_ms
    );
}


function scheduleIssueNotification() {
    setTimeout(
        () => {
            toast('Have you found any issue?', {
                icon: GitHubIcon,
                action: {
                    label: 'GitHub',
                    onClick: () => {
                        window.open('https://github.com/gamberoillecito/unBLOCHed/issues/new', '_blank');
                        // Once the user has clicked the button, stop notifying every time
                        preferences.update((x) => { return { ...x, notifications: { ...x.notifications, issuesOpened: true } } })
                    }
                },
                description: 'Let me know!',
                duration: NOTIFICATION_DURATION_ms,
                // Increment the counter of how many times the user closed the notification to avoid bombarding every time if not interested
                onDismiss: () => {
                    preferences.update((x) => { return { ...x, notifications: { ...x.notifications, issuesCancelledTimes: x.notifications.issuesCancelledTimes + 1 } } })
                }

            });
        },
        TIMEOUT_ms + DELAY_ms
    );
}

/** Starts timeouts to display relevant informations to the user after a predefined amount of time */
export function scheduleNotifications() {
    if (showStar) {
        scheduleStarNotification();
    }

    if (showIssue) {
        scheduleIssueNotification();
    }
}