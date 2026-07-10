const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = [...document.querySelectorAll(".main-nav a")];

window.addEventListener("load", () => {
  body.classList.add("is-loaded");
});

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const closeMobileNav = () => {
  header?.classList.remove("nav-active");
  body.classList.remove("nav-open");
  menuToggle?.setAttribute("aria-label", "Otwórz menu");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("nav-active");
  body.classList.toggle("nav-open", isOpen);
  menuToggle.setAttribute("aria-label", isOpen ? "Zamknij menu" : "Otwórz menu");
});

const currentPage = () => {
  const file = window.location.pathname.split("/").pop();
  return file || "index.html";
};

const pageFromHref = (href) => {
  const url = new URL(href, window.location.href);
  return url.pathname.split("/").pop() || "index.html";
};

navLinks.forEach((link) => {
  link.classList.toggle("is-active", pageFromHref(link.getAttribute("href")) === currentPage());
  link.addEventListener("click", closeMobileNav);
});

const hashSections = navLinks
  .map((link) => link.getAttribute("href"))
  .filter((href) => href?.startsWith("#"))
  .map((href) => document.querySelector(href))
  .filter(Boolean);

const revealTargets = [...document.querySelectorAll(".reveal")];
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
  );

  revealTargets.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 35, 220)}ms`;
    revealObserver.observe(el);
  });
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

const countFormatter = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 1,
});

const animateCount = (element) => {
  const target = Number(element.dataset.count);
  const decimals = Number(element.dataset.decimals || 0);
  const duration = 1300;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    element.textContent = countFormatter.format(Number(value.toFixed(decimals)));
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const stats = [...document.querySelectorAll(".hero-stats")];
if (stats.length && "IntersectionObserver" in window) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll("[data-count]").forEach(animateCount);
        statObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 },
  );

  stats.forEach((el) => statObserver.observe(el));
}

if (hashSections.length && "IntersectionObserver" in window) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    { threshold: [0.2, 0.4, 0.65], rootMargin: "-20% 0px -52% 0px" },
  );

  hashSections.forEach((section) => activeObserver.observe(section));
}

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const menuItems = [...document.querySelectorAll(".menu-item")];

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    menuItems.forEach((item, index) => {
      const shouldShow = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("is-filtered", !shouldShow);
      item.style.animation = "none";
      item.offsetHeight;
      if (shouldShow) {
        item.style.animation = `menuPop 360ms ease ${Math.min(index * 35, 160)}ms both`;
      }
    });
  });
});

const style = document.createElement("style");
style.textContent = `
  @keyframes menuPop {
    from { opacity: 0; transform: translateY(10px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;
document.head.append(style);

const localLinks = [...document.querySelectorAll("a[href]")];
localLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== "_self") return;

    const url = new URL(link.getAttribute("href"), window.location.href);
    const sameHost = url.protocol === window.location.protocol && url.origin === window.location.origin;
    const sameDocument = url.pathname === window.location.pathname && url.hash;
    const isLocalPage = sameHost && url.pathname.endsWith(".html");

    if (!isLocalPage || sameDocument || url.href === window.location.href) return;

    closeMobileNav();
    body.classList.add("is-navigating");
  });
});

const shareButton = document.querySelector("[data-share]");
const shareStatus = document.querySelector("[data-share-status]");
const shareData = {
  title: "OMA - Radna 13",
  text: "OMA, Radna 13, 00-341 Warszawa",
  url: "https://www.google.com/maps/search/?api=1&query=Radna%2013%2C%2000-341%20Warszawa",
};

shareButton?.addEventListener("click", async () => {
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      shareStatus.textContent = "Link do lokalu został udostępniony.";
      return;
    }

    await navigator.clipboard.writeText(shareData.url);
    shareStatus.textContent = "Link do mapy skopiowany.";
  } catch {
    shareStatus.textContent = "Nie udało się udostępnić linku w tej przeglądarce.";
  }
});