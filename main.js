console.log('main.js loaded');

// Theme toggle: respect system preference, allow toggle, persist choice, and swap icon
(function () {
	const root = document.documentElement;
	const key = "bbb-theme";

	function initTheme() {
		const saved = localStorage.getItem(key);
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const prefersDark = mql.matches;
		if (saved === "dark" || (!saved && prefersDark))
			root.setAttribute("data-theme", "dark");

		const btn = document.getElementById("themeToggle");
    if (!btn) {
        // If the button isn't present yet, retry once on DOMContentLoaded.
        document.addEventListener("DOMContentLoaded", initTheme, { once: true });
        return;
    }

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
    const setUI = () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      btn.setAttribute("aria-pressed", String(isDark));

      // Inline, dependency-free icons that inherit currentColor
      const MOON_SVG =
        '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" focusable="false">\n' +
        '  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 1021 12.79z"/>\n' +
        '</svg>';
      const SUN_SVG =
        '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" focusable="false">\n' +
        '  <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.48 0l1.79-1.8 1.41 1.41-1.8 1.79-1.4-1.4zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 12H1v0h3v0zm19 0h-3v0h3v0zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zm10.48 0l1.4 1.4 1.8-1.79-1.41-1.41-1.79 1.8zM12 8a4 4 0 100 8 4 4 0 000-8z"/>\n' +
        '</svg>';

      // Show the action icon (sun when dark, moon when light)
      btn.innerHTML = isDark ? SUN_SVG : MOON_SVG;

      btn.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
      btn.title = isDark ? "Light mode" : "Dark mode";
    };

		setUI();

		// If no saved preference, follow system and live-update on changes
		if (!saved) {
			const syncSystem = () => {
				if (localStorage.getItem(key)) return; // user chose explicitly; stop syncing
				if (mql.matches) root.setAttribute("data-theme", "dark");
				else root.removeAttribute("data-theme");
				setUI();
			};
			// Apply once in case theme changed before JS ran
			syncSystem();
			if (mql.addEventListener) mql.addEventListener("change", syncSystem);
			else if (mql.addListener) mql.addListener(syncSystem);
		}
    btn.addEventListener("click", () => {
        const isDark = root.getAttribute("data-theme") === "dark";
        if (isDark) root.removeAttribute("data-theme");
        else root.setAttribute("data-theme", "dark");
        localStorage.setItem(key, isDark ? "light" : "dark");
        setUI();
        if (!prefersReduced) {
            btn.classList.add("icon-pop");
            btn.addEventListener(
                "animationend",
                () => btn.classList.remove("icon-pop"),
                { once: true }
            );
        }
    });
	}

	// Run immediately; if the button isn't present, initTheme will retry on DOMContentLoaded.
	initTheme();
})();

// Collapse navbar when clicking outside or on a nav link (mobile friendliness)
(function () {
  var navCollapse = document.getElementById("nav");
  var toggler = document.querySelector(".navbar-toggler");

  function isOpen() {
    return navCollapse && navCollapse.classList.contains("show");
  }

  function hideNav() {
    if (!navCollapse) return;
    try {
      if (window.bootstrap && bootstrap.Collapse) {
        var inst = bootstrap.Collapse.getOrCreateInstance(navCollapse, {
          toggle: false,
        });
        inst.hide();
      } else {
        navCollapse.classList.remove("show");
        navCollapse.classList.add("collapse");
      }
    } catch (err) {
      navCollapse.classList.remove("show");
      navCollapse.classList.add("collapse");
    }
    if (toggler) toggler.setAttribute("aria-expanded", "false");
  }

  // Click anywhere outside the expanded menu to collapse
  document.addEventListener("click", function (e) {
    if (!navCollapse) return;
    var clickInsideMenu = navCollapse.contains(e.target);
    var clickOnToggler = toggler && toggler.contains(e.target);
    if (isOpen() && !(clickInsideMenu || clickOnToggler)) hideNav();
  });

  // Click on any nav link collapses the menu (useful on mobile)
  if (navCollapse) {
    navCollapse.addEventListener("click", function (e) {
      var link = e.target && e.target.closest && e.target.closest("a.nav-link");
      if (link) hideNav();
    });
  }
})();

// Reveal-on-scroll + gentle orb drift (reduced-motion aware)
(function () {
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const els = document.querySelectorAll(
		".card-soft, .section h2, .icon-circle"
	);
	els.forEach((el) => el.classList.add("reveal"));
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) e.target.classList.add("revealed");
			});
		},
		{ threshold: 0.12 }
	);
	els.forEach((el) => io.observe(el));

	if (reduce) return;
	const o1 = document.querySelector(".orb.one");
	const o2 = document.querySelector(".orb.two");
	let t = 0;
	function frame() {
		t += 0.005;
		if (o1)
			o1.style.transform = `translate(${Math.sin(t) * 6}px, ${
				Math.cos(t * 0.8) * 6
			}px)`;
		if (o2)
			o2.style.transform = `translate(${Math.cos(t * 0.7) * 8}px, ${
				Math.sin(t * 0.9) * 8
			}px)`;
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
})();

// Nav highlighting + scroll progress
(function () {
	var ids = ["top", "services", "about", "faq", "contact"];
	var links = ids.map(function (id) {
		return [id, document.querySelector('a.nav-link[href="#' + id + '"]')];
	});

	var navEl = document.querySelector(".navbar");
	function navHeight() {
		if (navEl) return navEl.getBoundingClientRect().height || 0;
		var css = getComputedStyle(document.documentElement).getPropertyValue(
			"--nav-h"
		);
		return css ? parseFloat(css) : 0;
	}

	function clearActive() {
		links.forEach(function (p) {
			if (p[1]) {
				p[1].classList.remove("active");
				p[1].removeAttribute("aria-current");
			}
		});
	}

	function setActiveById(id) {
		clearActive();
		var idx = ids.indexOf(id);
		if (idx === -1) return;
		var link = links[idx] && links[idx][1];
		if (!link) return;
		link.classList.add("active");
		link.setAttribute("aria-current", "page");
	}

	function findNearest() {
		var h = navHeight();
		var viewportTop = h;
		var viewportBottom = window.innerHeight;

		var best = { id: null, overlap: 0 };
		ids.forEach(function (id) {
			var el = document.getElementById(id);
			if (!el) return;
			var rect = el.getBoundingClientRect();
			var overlap =
				Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop);
			if (overlap > best.overlap) best = { id: id, overlap: overlap };
		});

		if (best.id && best.overlap > 0) {
			setActiveById(best.id);
			return;
		}

		var y = h + 2;
		var passed = [];
		var upcoming = [];
		ids.forEach(function (id) {
			var el = document.getElementById(id);
			if (!el) return;
			var rect = el.getBoundingClientRect();
			if (rect.top <= y) passed.push({ id: id, top: rect.top });
			else upcoming.push({ id: id, top: rect.top });
		});
		if (passed.length) {
			passed.sort(function (a, b) {
				return b.top - a.top;
			});
			setActiveById(passed[0].id);
			return;
		}
		if (upcoming.length) {
			upcoming.sort(function (a, b) {
				return a.top - b.top;
			});
			setActiveById(upcoming[0].id);
			return;
		}
	}

	var ticking = false;
	function onScroll() {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(function () {
				findNearest();
				ticking = false;
			});
		}
	}

	window.addEventListener("scroll", onScroll, { passive: true });
	window.addEventListener(
		"resize",
		function () {
			requestAnimationFrame(findNearest);
		},
		{ passive: true }
	);
	requestAnimationFrame(findNearest);

	/* Scroll progress indicator logic */
	var fill = document.querySelector(".nav-progress .fill");
	if (fill) {
		var t2 = false;
		function update() {
			var doc = document.documentElement;
			var scrollTop = window.scrollY || doc.scrollTop;
			var scrollHeight = doc.scrollHeight - window.innerHeight;
			var pct =
				scrollHeight > 0
					? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100))
					: 0;
			fill.style.width = pct + "%";
			t2 = false;
		}
		window.addEventListener(
			"scroll",
			function () {
				if (!t2) {
					t2 = true;
					requestAnimationFrame(update);
				}
			},
			{ passive: true }
		);
		window.addEventListener(
			"resize",
			function () {
				requestAnimationFrame(update);
			},
			{ passive: true }
		);
		requestAnimationFrame(update);
	}
})();

// Testimonials carousel auto-advance
(function () {
	const carousel = document.getElementById('testimonialsCarousel');
	if (!carousel) return;
	
	new bootstrap.Carousel(carousel, {
		interval: 8000, // auto-advance every 8 seconds
		wrap: true,
		pause: 'hover', // pause on hover for better UX
		touch: true
	});
})();

// Button ripple effect (respects reduced motion)
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
      ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    }, { passive: true });
  });
})();

// Footer year
(function () {
    var el = document.getElementById("year");
    var y = new Date().getFullYear();
    if (el) el.textContent = y;
})();

// Custom dropdown (replaces native <select>) — syncs selection to hidden input
(function () {
    function initDropdowns() {
        document.querySelectorAll('.contact-dropdown').forEach(function (wrapper) {
            var toggle = wrapper.querySelector('.contact-dropdown-toggle');
            var label = wrapper.querySelector('.contact-dropdown-label');
            var input = wrapper.querySelector('.contact-dropdown-input');
            var items = wrapper.querySelectorAll('.dropdown-item');

            items.forEach(function (item) {
                item.addEventListener('click', function () {
                    input.value = this.dataset.value;
                    label.textContent = this.textContent;
                    label.classList.add('selected');
                    items.forEach(function (i) { i.classList.remove('active'); });
                    this.classList.add('active');
                });
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDropdowns);
    } else {
        initDropdowns();
    }
})();

// Bootstrap form validation with reCAPTCHA v3
(function () {
    'use strict';
    var RECAPTCHA_SITE_KEY = '6LcT4n0sAAAAACmXbW8jkaQ6zVW6mwKsWV2o684K';
    
    function clearForms() {
        var forms = document.querySelectorAll('.needs-validation');
        forms.forEach(function (form) {
            form.reset();
            form.classList.remove('was-validated');
        });
        // Reset custom dropdowns — form.reset() clears the hidden input value
        // but the visible label and active item state must be reset manually
        document.querySelectorAll('.contact-dropdown').forEach(function (wrapper) {
            var label = wrapper.querySelector('.contact-dropdown-label');
            var items = wrapper.querySelectorAll('.dropdown-item');
            if (label) {
                label.textContent = 'Select...';
                label.classList.remove('selected');
            }
            items.forEach(function (i) { i.classList.remove('active'); });
        });
    }
    
    function initFormHandlers() {
        console.log('Initializing form handlers');
        var forms = document.querySelectorAll('.needs-validation');
        console.log('Found ' + forms.length + ' form(s)');
        
        forms.forEach(function (form) {
            console.log('Attaching submit handler to form');
            form.addEventListener('submit', function (event) {
            // Prevent default submission to handle reCAPTCHA first
            event.preventDefault();
            
            if (!form.checkValidity()) {
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
            }
            
            form.classList.add('was-validated');
            
            // Add loading state to button
            var submitBtn = form.querySelector('button[type="submit"]');
            var originalText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
            }
            
            // Get reCAPTCHA token and submit
            console.log('grecaptcha available:', typeof grecaptcha !== 'undefined');
            if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
                console.log('Calling grecaptcha.ready()');
                grecaptcha.ready(function () {
                    console.log('grecaptcha ready, executing...');
                    grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' })
                        .then(function (token) {
                            console.log('reCAPTCHA token generated successfully:', token.substring(0, 20) + '...');
                            var tokenField = document.getElementById('recaptcha-token');
                            console.log('Token field element:', tokenField);
                            if (tokenField) {
                                tokenField.value = token;
                                console.log('Token field value set. Final value:', tokenField.value.substring(0, 20) + '...');
                            } else {
                                console.error('Token field not found - element with id "recaptcha-token" does not exist');
                            }
                            // Small delay to ensure token is set before submission
                            setTimeout(function () {
                                console.log('Submitting form now');
                                form.submit();
                            }, 100);
                        })
                        .catch(function (err) {
                            console.error('reCAPTCHA execute error:', err);
                            // Restore button on error
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.innerHTML = originalText;
                            }
                        });
                });
            } else {
                console.warn('grecaptcha not available - typeof grecaptcha:', typeof grecaptcha);
                // If reCAPTCHA not loaded, restore button and show error
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
                alert('reCAPTCHA is not loaded. Please refresh the page and try again.');
            }
        }, false);
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            clearForms();
            initFormHandlers();
        });
    } else {
        clearForms();
        initFormHandlers();
    }
})();
