import {persisted} from 'svelte-persisted-store';

export const preferences = persisted('preferences', {
    /**Wether to show the welcome message when the page is first loaded */
    showWelcomeAtStart: true,
    notifications: {
        //**If the notification that asks the user to report an issue has been opened */
        issuesOpened: false,
        //**How many times the notification that asks user to report issues has been cancelled */
        issuesCancelledTimes: 0,
        //**If the notification that asks the user to star the project has been opened */
        starOpened: false,
        //**How many times the notification that asks user to star the project has been cancelled */
        starCancelledTimes: 0,
    },
    tutorial: {
        //**Whether the tutorial pane is open */
        open: false,
        //**Last opened chapter */
        chapter: '',
    }
})
