// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Active navbar link highlighting on scroll
    window.addEventListener('scroll', function () {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    //Navbar transparent on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar .navbar-expand-lg .navbar-dark .fixed-top');
        const scrollThreshold = 50;
        const maxScroll = 400;

        let opacity = 1;
        if (window.scrollY > scrollThreshold) {
            const scrollProgress = Math.min((window.scrollY - scrollThreshold) / (maxScroll - scrollThreshold), 1);
            opacity = 1 - (scrollProgress * 0.9); // Fade to 10% opacity
        }

        navbar.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
    });

    // Mobile number validation - only numbers, max 10 digits
    const mobileInput = document.getElementById('mobile');
    if (mobileInput) {
        mobileInput.addEventListener('input', function (e) {
            this.value = this.value.replace(/[^0-9]/g, '').substring(0, 10);
        });
    }

    // Form submission handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            const alertContainer = document.getElementById('alertContainer');

            // Validate form
            if (!validateForm()) {
                showAlert('Please fill in all required fields correctly.', 'danger');
                return;
            }

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;

            // Get form data
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Add timestamp
            data.timestamp = new Date().toLocaleString();

            // Simulate form submission
            // In production, replace this with actual Google Sheets API call
            setTimeout(() => {
                // Send data to Google Sheets (implement this function)
                sendToGoogleSheets(data)
                    .then(() => {
                        showAlert('Thank you for your enquiry! We\'ll get back to you within 24 hours.', 'success');
                        contactForm.reset();
                    })
                    .catch(() => {
                        showAlert('Sorry, there was an error sending your message. Please try again.', 'danger');
                    })
                    .finally(() => {
                        // Reset button
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Enquiry';
                        submitBtn.disabled = false;
                    });
            }, 2000);
        });
    }

    // Form validation function
    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const email = document.getElementById('email').value.trim();
        const course = document.getElementById('course').value;

        // Check if required fields are filled
        if (!name || !mobile || !email || !course) {
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        // Validate mobile number (should be 10 digits)
        if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
            return false;
        }

        return true;
    }

    // Show alert function
    function showAlert(message, type) {
        const alertContainer = document.getElementById('alertContainer');
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        alertContainer.innerHTML = alertHTML;
        alertContainer.scrollIntoView({ behavior: 'smooth' });

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                alert.classList.remove('show');
                setTimeout(() => {
                    alertContainer.innerHTML = '';
                }, 150);
            }
        }, 5000);
    }

    // Google Sheets integration function
    async function sendToGoogleSheets(data) {
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGJ6Zcb7OI8szZdWK2i8wyLguuau1gsuj4rLzszkUpfYhqAXywgi664pcOH17avKZX-w/exec';

        return fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            mode: 'no-cors'
        })
            .then(() => {
                // With no-cors, we can only confirm the request was sent
                console.log('Request sent to Google Sheets (status unknown)');
            })
            .catch(error => {
                console.error('Network error sending to Google Sheets:', error);
                throw error; // Re-throw instead of Promise.reject
            });
    }

    // Additional form enhancements

    // Real-time form validation feedback
    const formInputs = document.querySelectorAll('#contactForm input, #contactForm select, #contactForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });

        input.addEventListener('input', function () {
            // Remove error styling on input
            this.classList.remove('is-invalid');
        });
    });

    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        // Check if required field is empty
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }

        // Specific validation for different field types
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    isValid = false;
                }
                break;
            case 'tel':
                if (value && (value.length !== 10 || !/^\d{10}$/.test(value))) {
                    isValid = false;
                }
                break;
        }

        // Add/remove validation classes
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }

        return isValid;
    }

    // Navbar collapse on mobile after clicking a link
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.getElementById('navbarNav');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);

    // Observe course cards and teacher cards
    document.querySelectorAll('.course-card, .teacher-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        observer.observe(card);
    });

});

// Additional utility functions

function formatPhoneNumber(value) {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 10) {
        return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phoneNumber;
}

// Function to scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

//Scroll To Top
window.addEventListener('scroll', function () {
    const scrollButton = document.getElementById('scrollToTop');
    if (scrollButton) {
        if (window.pageYOffset > 300) {
            scrollButton.style.display = 'block';
        } else {
            scrollButton.style.display = 'none';
        }
    }
});

// Prevent form submission on Enter key (except for textarea)
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.form) {
        e.preventDefault();
    }
});

// Configuration for different sheets
        const SHEET_CONFIGS = {
            course2: {
                sheetId: '1iSq0tfh1Gl9yUosonLwCNIjvljaAD94e8cbBhd8XVjM',
                sheetName: 'C Syllabus',
                title: 'C Programming Course',
                subtitle: 'Master C programming from basics to advanced',
                cache: null,
                lastLoaded: null
            },
            course1: {
                sheetId: '1iSq0tfh1Gl9yUosonLwCNIjvljaAD94e8cbBhd8XVjM',
                sheetName: 'Python Syllabus',
                title: 'Python Course',
                subtitle: 'Learn Python programming step by step',
                cache: null,
                lastLoaded: null
            },
            course3: {
                sheetId: '1iSq0tfh1Gl9yUosonLwCNIjvljaAD94e8cbBhd8XVjM',
                sheetName: 'Web-Dev',
                title: 'Web Development',
                subtitle: 'Build modern web applications',
                cache: null,
                lastLoaded: null
            }
        };

        // Cache duration (5 minutes)
        const CACHE_DURATION = 5 * 60 * 1000;

        let currentCourse = null;

        // Optimized sheet loading with caching
        async function loadSheetData(courseKey) {
            const config = SHEET_CONFIGS[courseKey];
            
            // Check cache first
            if (config.cache && config.lastLoaded && 
                (Date.now() - config.lastLoaded) < CACHE_DURATION) {
                console.log(`Using cached data for ${courseKey}`);
                return config.cache;
            }

            const sheetUrl = `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?tqx=out:json&sheet=${config.sheetName}`;
            
            try {
                console.log(`Loading fresh data for ${courseKey}`);
                const response = await fetch(sheetUrl);
                const text = await response.text();
                
                // Parse Google Sheets JSON response
                const jsonString = text.substring(47).slice(0, -2);
                const data = JSON.parse(jsonString);
                
                const parsedData = parseSheetData(data);
                
                // Cache the result
                config.cache = parsedData;
                config.lastLoaded = Date.now();
                
                return parsedData;
                
            } catch (error) {
                console.error(`Error loading ${courseKey}:`, error);
                return getDefaultData(courseKey);
            }
        }

        function parseSheetData(data) {
            const rows = data.table.rows;
            const topics = [];
            
            // Skip header row (index 0)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.c && row.c[0] && row.c[1]) {
                    const topicName = row.c[0].v;
                    const subtopicsStr = row.c[1].v;
                    
                    // Split subtopics by comma
                    const subtopics = subtopicsStr.split(',').map(s => s.trim()).filter(s => s);
                    
                    topics.push({
                        name: topicName,
                        subtopics: subtopics
                    });
                }
            }
            
            return topics;
        }

        function getDefaultData(courseKey) {
            const defaults = {
                course1: [
                    {
                        name: "Week 1: C Basics",
                        subtopics: ["Variables", "Data Types", "Operators", "Input/Output"]
                    },
                    {
                        name: "Week 2: Control Flow",
                        subtopics: ["Loops", "Conditionals", "Switch Statements"]
                    }
                ],
                course2: [
                    {
                        name: "Python Basics",
                        subtopics: ["Variables", "Data Types", "Functions", "Modules"]
                    },
                    {
                        name: "Advanced Python",
                        subtopics: ["OOP", "File Handling", "Libraries"]
                    }
                ],
                course3: [
                    {
                        name: "Frontend",
                        subtopics: ["HTML", "CSS", "JavaScript", "React"]
                    },
                    {
                        name: "Backend",
                        subtopics: ["Node.js", "Databases", "APIs"]
                    }
                ]
            };
            
            return defaults[courseKey] || [];
        }

        async function openPopup(courseKey) {
            const backdrop = document.getElementById('backdrop');
            const popup = document.getElementById('popup');
            const body = document.body;
            
            currentCourse = courseKey;
            const config = SHEET_CONFIGS[courseKey];
            
            // Update popup title and subtitle
            document.getElementById('popupTitle').textContent = config.title;
            document.getElementById('popupSubtitle').textContent = config.subtitle;
            
            // Show popup with loading state
            backdrop.style.display = 'block';
            popup.style.display = 'flex';
            body.style.overflow = 'hidden';
            
            // Reset content
            document.getElementById('popupContent').innerHTML = `
                <div class="loading-message">
                    <div style="font-size: 18px; margin-bottom: 10px;">📊</div>
                    <div>Loading ${config.title} content...</div>
                </div>
            `;
            
            // Trigger animation
            setTimeout(() => {
                popup.classList.add('active');
            }, 10);
            
            // Load and generate content
            const topicsData = await loadSheetData(courseKey);
            generateDropdowns(topicsData);
        }

        function generateDropdowns(topicsData) {
            const popupContent = document.getElementById('popupContent');
            
            if (!topicsData || topicsData.length === 0) {
                popupContent.innerHTML = `
                    <div class="error-message">
                        <div style="font-size: 18px; margin-bottom: 10px;">⚠️</div>
                        <div>Could not load topics from Google Sheet.</div>
                        <div style="font-size: 12px; margin-top: 10px; opacity: 0.7;">
                            Please check your Sheet ID and permissions.
                        </div>
                    </div>
                `;
                return;
            }
            
            // Clear loading message
            popupContent.innerHTML = '';
            
            // Generate dropdown for each topic
            topicsData.forEach((topic, index) => {
                const dropdownContainer = document.createElement('div');
                dropdownContainer.className = 'dropdown-container';
                
                const dropdown = document.createElement('div');
                dropdown.className = 'dropdown';
                
                const button = document.createElement('button');
                button.className = 'dropdown-btn';
                button.onclick = () => toggleDropdown(button);
                button.innerHTML = `
                    ${topic.name}
                    <span class="dropdown-icon">▼</span>
                `;
                
                const content = document.createElement('div');
                content.className = 'dropdown-content';
                
                // Add subtopics
                topic.subtopics.forEach(subtopic => {
                    const item = document.createElement('div');
                    item.className = 'dropdown-item';
                    item.textContent = subtopic;
                    item.onclick = () => handleSubtopicClick(topic.name, subtopic);
                    content.appendChild(item);
                });
                
                dropdown.appendChild(button);
                dropdown.appendChild(content);
                dropdownContainer.appendChild(dropdown);
                popupContent.appendChild(dropdownContainer);
            });
        }

        function toggleDropdown(button) {
            const dropdown = button.nextElementSibling;
            const isActive = dropdown.classList.contains('active');
            
            // Close all other dropdowns
            const allDropdowns = document.querySelectorAll('.dropdown-content');
            const allButtons = document.querySelectorAll('.dropdown-btn');
            
            allDropdowns.forEach(d => d.classList.remove('active'));
            allButtons.forEach(b => b.classList.remove('active'));
            
            // Toggle current dropdown
            if (!isActive) {
                dropdown.classList.add('active');
                button.classList.add('active');
            }
        }

        function handleSubtopicClick(topicName, subtopic) {
            console.log(`${currentCourse}: ${topicName} > ${subtopic}`);
            // You can add custom logic here for different courses
            alert(`Course: ${SHEET_CONFIGS[currentCourse].title}\nTopic: ${topicName}\nSubtopic: ${subtopic}`);
        }

        function closePopup() {
            const backdrop = document.getElementById('backdrop');
            const popup = document.getElementById('popup');
            const body = document.body;
            
            popup.classList.remove('active');
            
            setTimeout(() => {
                backdrop.style.display = 'none';
                popup.style.display = 'none';
                body.style.overflow = 'auto';
                
                // Close all dropdowns
                const dropdowns = document.querySelectorAll('.dropdown-content');
                const buttons = document.querySelectorAll('.dropdown-btn');
                dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
                buttons.forEach(button => button.classList.remove('active'));
                
                currentCourse = null;
            }, 300);
        }


        // Close popup when pressing Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closePopup();
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.dropdown')) {
                const dropdowns = document.querySelectorAll('.dropdown-content');
                const buttons = document.querySelectorAll('.dropdown-btn');
                dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
                buttons.forEach(button => button.classList.remove('active'));
            }
        });

        // Preload popular sheets (optional optimization)
        window.addEventListener('DOMContentLoaded', function() {
            // Preload the first course data
            setTimeout(() => {
                loadSheetData('course1');
            }, 1000);
        });
