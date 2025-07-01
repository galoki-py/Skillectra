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
