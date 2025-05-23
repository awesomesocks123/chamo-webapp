// This script handles dark mode detection and application
// It runs before the React app loads to prevent flash of wrong theme
export function setInitialColorMode() {
  function getInitialColorMode() {
    // Check for saved theme preference in localStorage
    const persistedColorPreference = window.localStorage.getItem('theme');
    const hasPersistedPreference = typeof persistedColorPreference === 'string';

    // If the user has explicitly chosen light or dark mode
    if (hasPersistedPreference) {
      return persistedColorPreference;
    }

    // If they haven't been explicit, check the media query
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const hasMediaQueryPreference = typeof mql.matches === 'boolean';

    if (hasMediaQueryPreference) {
      return mql.matches ? 'dark' : 'light';
    }

    // Default to 'light' if no preference found
    return 'light';
  }

  const colorMode = getInitialColorMode();
  
  // Apply the right class to the HTML element
  if (colorMode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// This function will be stringified and inserted into the HTML
export function createColorModeScript() {
  const functionString = setInitialColorMode.toString();
  return `(${functionString})()`;
}
