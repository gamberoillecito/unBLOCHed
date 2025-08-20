import {persisted} from 'svelte-persisted-store';

export const preferences = persisted('preferences', {
    showWelcomeAtStart: true,
})
