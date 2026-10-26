
async function loadSchoolConfig() {
  try {
    const response = await fetch("config/school.json");

    if (!response.ok) {
      throw new Error("Could not load school configuration.");
    }

    const config = await response.json();

    // Apply school details
    document.title = config.schoolName;
    document.getElementById("schoolName").textContent =
      config.schoolName;

    document.getElementById("schoolTagline").textContent =
      config.tagline;

    document.getElementById("schoolBadge").src =
      config.badge;

    // Apply colors from JSON
    const root = document.documentElement;

    root.style.setProperty(
      "--school-blue",
      config.colors.primary
    );

    root.style.setProperty(
      "--school-blue-dark",
      config.colors.primaryDark
    );

    root.style.setProperty(
      "--school-accent",
      config.colors.accent
    );

    root.style.setProperty(
      "--school-text",
      config.colors.text
    );

    // Apply compact header settings
    root.style.setProperty(
      "--compact-logo-size",
      `${config.header.compactLogoSize}px`
    );

    root.style.setProperty(
      "--compact-title-size",
      config.header.compactTitleSize
    );

    // Enable scrolling behavior
    initializeHeader(config.header.scrollThreshold);

  } catch (error) {
    console.error("School configuration error:", error);
    initializeHeader(80);
  }
}

function initializeHeader(threshold) {
  const header = document.getElementById("mainHeader");
  const body = document.body;

  if (!header || header.dataset.initialized === "true") {
    return;
  }

  header.dataset.initialized = "true";

  function updateHeader() {
    const compact = window.scrollY > threshold;

    if (compact && !header.classList.contains("scrolled")) {
      const height = header.offsetHeight;

      document.documentElement.style.setProperty(
        "--header-height",
        `${height}px`
      );

      header.classList.add("scrolled");
      body.classList.add("has-scrolled-header");

    } else if (
      !compact &&
      header.classList.contains("scrolled")
    ) {
      header.classList.remove("scrolled");
      body.classList.remove("has-scrolled-header");
    }
  }

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });

  window.addEventListener("resize", updateHeader);

  updateHeader();
}

loadSchoolConfig();


function fitHeading() {
  document.querySelectorAll(".pha").forEach(heading => {
    const parentWidth = heading.parentElement.clientWidth;

    let fontSize = 32;
    const minFontSize = 10;

    heading.style.fontSize = `${fontSize}px`;

    while (
      heading.scrollWidth > parentWidth &&
      fontSize > minFontSize
    ) {
      fontSize -= 0.5;
      heading.style.fontSize = `${fontSize}px`;
    }
  });
}

window.addEventListener("load", fitHeading);
window.addEventListener("resize", fitHeading);


document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector("#campus-navigation");

  if (!nav) return;

  const currentPage = window.location.pathname
    .split("/")
    .pop()
    .toLowerCase();

  nav.querySelectorAll("a").forEach(link => {
    const linkPage = new URL(link.href).pathname
      .split("/")
      .pop()
      .toLowerCase();

    const isActive = linkPage === currentPage;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
});



function setupContinuousGalleries() {
  const header = document.querySelector(".main-header");
  const footer = document.querySelector("footer");
  const galleries = document.querySelectorAll(".side-gallery");

  if (!header || !footer || !galleries.length) return;

  // 1. Calculate the available height between header and footer.
  function calculateGalleryHeight() {
    const headerBottom = header.getBoundingClientRect().bottom;
    const footerTop = footer.getBoundingClientRect().top;
    const availableHeight = Math.max(0, footerTop - headerBottom);

    galleries.forEach(gallery => {
      gallery.style.height = `${availableHeight}px`;
    });

    return availableHeight;
  }

  // 2. Build each gallery after its height has been calculated.
  function buildGallery(gallery) {
    const track = gallery.querySelector(".gallery-track");
    if (!track) return;

    // Save only the original image sequence once.
    if (!gallery._originalImages) {
      gallery._originalImages = [...track.children].map(img =>
        img.cloneNode(true)
      );
    }

    const originals = gallery._originalImages;
    if (!originals.length) return;

    track.classList.remove("gallery-ready");
    track.replaceChildren(...originals.map(img => img.cloneNode(true)));

    // Ensure the original sequence is available before measuring.
    const imagePromises = originals.map(img => {
      const src = img.getAttribute("src");
      if (!src) return Promise.resolve();

      return new Promise(resolve => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = resolve;
        image.src = src;
        if (image.complete) resolve();
      });
    });

    Promise.all(imagePromises).then(() => {
      requestAnimationFrame(() => {
        // Recalculate in case the page layout changed while images loaded.
        calculateGalleryHeight();

        // Repeat the original sequence until it fills the container.
        let safety = 0;
        while (
          track.scrollHeight < gallery.clientHeight * 1.5 &&
          safety < 50
        ) {
          originals.forEach(img =>
            track.appendChild(img.cloneNode(true))
          );
          safety++;
        }

        // Duplicate the complete first group for seamless looping.
        const firstGroup = [...track.children].map(img =>
          img.cloneNode(true)
        );
        firstGroup.forEach(img => track.appendChild(img));

        // Start animation only after the track is ready.
        track.style.animation = "none";
        void track.offsetHeight;
        track.style.animation = "";
        track.classList.add("gallery-ready");
      });
    });
  }

  // 3. Set heights first, then prepare the galleries.
  calculateGalleryHeight();

  galleries.forEach(gallery => buildGallery(gallery));
}

// Run after page resources load.
window.addEventListener("load", setupContinuousGalleries);

// Recalculate and rebuild when the browser is resized.
let galleryResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(galleryResizeTimer);
  galleryResizeTimer = setTimeout(() => {
    setupContinuousGalleries();
  }, 150);
});


