(function () {
    try {
        var savedMode = localStorage.getItem('darkMode');
        var isDark = savedMode === 'true';

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    } catch (error) {
        // Ignore storage access issues and fall back to the default theme.
    }
})();
