import {persisted} from 'svelte-persisted-store';

export const preferences = persisted('preferences', {
    showWelcomeAtStart: true,
    notifications: {
        issuesOpened: false,
        issuesCancelledTimes: 0,
        starOpened: false,
        starCancelledTimes: 0,
    }
})
