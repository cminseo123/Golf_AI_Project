(function () {
    try {
        var savedMode = localStorage.getItem('darkMode');
        var isDark = savedMode === 'true';

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // 모바일 크롬의 강제 다크테마 차단: 라이트일 땐 only light 로 못박는다
        var meta = document.querySelector('meta[name="color-scheme"]');
        if (meta) {
            meta.setAttribute('content', isDark ? 'dark' : 'only light');
        }
    } catch (error) {
        // Ignore storage access issues and fall back to the default theme.
    }
})();
