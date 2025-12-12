class ThemeManager {
    constructor() {
        this.toggle = document.getElementById('theme-toggle');
        if (!this.toggle) return;

        this.icon = document.getElementById('theme-icon');
        const { iconBase, iconDark, iconLight, soundSrc } = this.toggle.dataset;
        this.iconBase = iconBase;
        this.iconDark = iconDark;
        this.iconLight = iconLight;

        // Create audio element lazily only when needed
        this.sound = null;
        this.soundSrc = soundSrc;

        this.init();
    }

    init() {
        this.setInitialTheme();
        this.toggle.addEventListener('click', () => this.toggleTheme());
    }

    setInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', initialTheme);
        this.updateIcon(initialTheme === 'dark');
    }

    toggleTheme() {
        document.body.classList.add('theme-transition');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        this.updateIcon(!isDark);
        this.updateGiscus(newTheme);
        localStorage.setItem('theme', newTheme);

        // Lazy load sound only when needed
        if (!this.sound && this.soundSrc) {
            this.sound = new Audio(this.soundSrc);
        }

        if (this.sound) {
            this.sound.play().catch(() => {});
        }

        // Use requestAnimationFrame for better performance on transition
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.body.classList.remove('theme-transition');
            }, 300);
        });
    }

    updateIcon(isDark) {
        if (this.icon) {
            this.icon.setAttribute('href',
                `${this.iconBase}${isDark ? this.iconDark : this.iconLight}`);
        }
    }

    updateGiscus(newTheme) {
        const message = { setConfig: {theme: newTheme} };        
        const sendGiscusTheme = theme =>
            document.querySelector(".giscus iframe")
                    ?.contentWindow
                    ?.postMessage({ giscus: message }, "https://giscus.app");
        
        sendGiscusTheme(newTheme === "dark" ? "dark" : "light")
    }
}

class LightboxManager {
    constructor() {
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightbox-img');

        if (!this.lightbox || !this.lightboxImg) return;

        this.init();
    }

    init() {
        this.attachTriggerListeners();
        this.registerCloseHandler();
    }

    attachTriggerListeners() {
        document.querySelectorAll('.lightbox-trigger').forEach((img) => {
            img.addEventListener('click', (event) => {
                this.open(event.target.src);
            });
        });
    }

    registerCloseHandler() {
        this.lightbox.addEventListener('click', () => this.close());
    }

    open(src) {
        this.lightboxImg.src = src;
        this.lightbox.style.display = 'flex';
        document.body.classList.add('lightbox-open');
    }

    close() {
        this.lightbox.style.display = 'none';
        this.lightboxImg.removeAttribute('src');
        document.body.classList.remove('lightbox-open');
    }
}

class GiscusManager {
    constructor() {
        // We look for the container we created in HTML
        this.container = document.getElementById('giscus-container');
        
        // If the container doesn't exist (e.g., on a page without comments), stop here
        if (!this.container) return;

        this.init();
    }

    init() {
        const getInitialTheme = () => {
            const htmlTheme = document.documentElement.getAttribute('data-theme');
            if (htmlTheme === 'dark' || htmlTheme === 'light') {
                return htmlTheme;
            }
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme === 'dark' || storedTheme === 'light') {
                return storedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        };

        const giscusScript = document.createElement("script");
        const config = this.container.dataset;

        giscusScript.src = "https://giscus.app/client.js";
        
        // We pull the values from the dataset (data-attributes)
        giscusScript.setAttribute("data-repo", config.repo);
        giscusScript.setAttribute("data-repo-id", config.repoId);
        giscusScript.setAttribute("data-category", config.category);
        giscusScript.setAttribute("data-category-id", config.categoryId);
        giscusScript.setAttribute("data-mapping", config.mapping);
        giscusScript.setAttribute("data-strict", config.strict);
        giscusScript.setAttribute("data-reactions-enabled", config.reactionsEnabled);
        giscusScript.setAttribute("data-emit-metadata", config.emitMetadata);
        giscusScript.setAttribute("data-input-position", config.inputPosition);
        giscusScript.setAttribute("data-lang", config.lang);
        
        giscusScript.setAttribute("data-loading", "lazy");
        giscusScript.setAttribute("crossorigin", "anonymous");
        giscusScript.async = true;
        giscusScript.setAttribute("data-theme", getInitialTheme());

        this.container.appendChild(giscusScript);
    }
}

// Initialize when content is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeManager();
        new LightboxManager();
        new GiscusManager();
    });
} else {
    new ThemeManager();
    new LightboxManager();
    new GiscusManager();
}
