// Check authentication on page load
document.addEventListener("DOMContentLoaded", () => {
    // Check if staff is authenticated
    const staffSession = checkStaffAuth();
    if (!staffSession) return;
    
    // Add logout functionality
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
                staffLogout();
            }
        });
    }
    
    // Rest of your existing code...
    // Navigation
    const designBtn = document.getElementById("designBtn");
    const reservationBtn = document.getElementById("reservationBtn");
    // ... rest of your existing code
});
document.addEventListener("DOMContentLoaded", () => {
    // Navigation
    const designBtn = document.getElementById("designBtn");
    const reservationBtn = document.getElementById("reservationBtn");

    if (designBtn) {
        designBtn.addEventListener("click", () => {
            window.location.href = "/WEBSYS/FinalProj/AdminPanel/admin-design.html";
        });
    }

    if (reservationBtn) {
        reservationBtn.addEventListener("click", () => {
            window.location.href = "/WEBSYS/FinalProj/AdminPanel/admin-reservation.html";
        });
    }

    // Tab functionality
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            tabContents.forEach(content => {
                content.classList.remove("active");
                if (content.id === `${tab.dataset.tab}-tab`) {
                    content.classList.add("active");
                }
            });
        });
    });

    // Initialize file upload functionality
    initializeFileUploads();
    
    // Load existing data
    loadWebsiteData();
    renderCarouselImages();
    renderGalleryImages();
});

// Global variables
let websiteData = {
    carousel: [],
    gallery: [],
    content: {
        title: "Everpeak",
        price: "Starts at ₱8,400.00/night",
        tagline: "Your one step to tranquility 🌴",
        location: "Purok 6, Pintong Bocaue, San Mateo Rizal, San Mateo, Philippines",
        amenitiesLeft: "Mountain View\nSea of Clouds (Seasonal)\nStar Gazing (Seasonal)\nDipping Pool with Jacuzzi\nTable Tennis\nBingo\nGazebo",
        amenitiesRight: "Unlimited Videoko\nUnlimited Wifi\nNetflix\nBilliards\nBluetooth Speakers\nTwo Pool Bed",
        accessLeft: "Sofabed and Airbeds\nFour Camping Tent\n55\" TV for Netflix and Karaoke\nKitchenwares and Utensils\nRefrigerator\nNo Corkage Fee",
        accessRight: "Free Use of Griller (bring own charcoal)\nToilet and Bathroom\nFully Functional Kitchen\nHot and Cold Water Dispenser\nDinnerwares\nFree One Gallon of Mineral Water",
        transportation: "Bike, Motorcycle, Sedan, SUV"
    },
    footer: {
        title: "Everpeak Philippines",
        description: "Connects campers to campgrounds and stores, making every camping adventure seamless and memorable.",
        facebookUrl: "https://www.facebook.com/profile.php?id=61574611928823",
        copyright: "© 2025 Everpeak P.H. All Rights Reserved."
    }
};

// Initialize file upload functionality
function initializeFileUploads() {
    // Carousel file upload
    const carouselUploadArea = document.getElementById('carouselUploadArea');
    const carouselFileInput = document.getElementById('carouselFileInput');
    
    if (carouselUploadArea && carouselFileInput) {
        setupFileUpload(carouselUploadArea, carouselFileInput, 'carousel');
    }
    
    // Gallery file upload
    const galleryUploadArea = document.getElementById('galleryUploadArea');
    const galleryFileInput = document.getElementById('galleryFileInput');
    
    if (galleryUploadArea && galleryFileInput) {
        setupFileUpload(galleryUploadArea, galleryFileInput, 'gallery');
    }
}

// Setup file upload with drag and drop
function setupFileUpload(uploadArea, fileInput, type) {
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileUpload(e.target.files, type);
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFileUpload(e.dataTransfer.files, type);
    });
}

// Handle file upload
function handleFileUpload(files, type) {
    if (files.length === 0) return;
    
    const progressBar = document.getElementById(`${type}ProgressFill`);
    const progressText = document.getElementById(`${type}ProgressText`);
    const progressContainer = document.getElementById(`${type}Progress`);
    
    progressContainer.style.display = 'block';
    
    Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith('image/')) {
            alert(`File "${file.name}" is not an image. Please select image files only.`);
            return;
        }
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Uploading ${file.name}... ${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                
                // Convert image to base64 for storage
                const reader = new FileReader();
                reader.onload = function(e) {
                    websiteData[type].push({
                        url: e.target.result,
                        alt: file.name.split('.')[0], // Use filename without extension as alt text
                        filename: file.name
                    });
                    
                    if (type === 'carousel') {
                        renderCarouselImages();
                    } else {
                        renderGalleryImages();
                    }
                    
                    if (index === files.length - 1) {
                        progressContainer.style.display = 'none';
                        progressBar.style.width = '0%';
                        saveToLocalStorage();
                    }
                };
                reader.readAsDataURL(file);
            }
        }, 100);
    });
}

// Render carousel images
function renderCarouselImages() {
    const container = document.getElementById('carouselImages');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (websiteData.carousel.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No carousel images uploaded yet.</p></div>';
        return;
    }
    
    websiteData.carousel.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${image.url}" alt="${image.alt}">
            <div class="image-actions">
                <button class="btn btn-secondary btn-sm" onclick="editImage('carousel', ${index})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="removeImage('carousel', ${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(imageItem);
    });
}

// Render gallery images
function renderGalleryImages() {
    const container = document.getElementById('galleryImages');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (websiteData.gallery.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No gallery images uploaded yet.</p></div>';
        return;
    }
    
    websiteData.gallery.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${image.url}" alt="${image.alt}">
            <div class="image-actions">
                <button class="btn btn-secondary btn-sm" onclick="editImage('gallery', ${index})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="removeImage('gallery', ${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(imageItem);
    });
}

// Edit image
function editImage(section, index) {
    const image = websiteData[section][index];
    
    document.getElementById('modalTitle').textContent = `Edit ${section} Image`;
    document.getElementById('imageAlt').value = image.alt;
    document.getElementById('previewImg').src = image.url;
    document.getElementById('imagePreview').style.display = 'block';
    
    document.getElementById('imageModal').style.display = 'flex';
    
    // Set up save button
    document.getElementById('saveImageBtn').onclick = function() {
        const alt = document.getElementById('imageAlt').value;
        
        if (alt) {
            websiteData[section][index].alt = alt;
            if (section === 'carousel') {
                renderCarouselImages();
            } else {
                renderGalleryImages();
            }
            saveToLocalStorage();
            closeModal('imageModal');
        } else {
            alert('Please provide alt text for the image');
        }
    };
}

// Remove image
function removeImage(section, index) {
    if (confirm('Are you sure you want to remove this image?')) {
        websiteData[section].splice(index, 1);
        if (section === 'carousel') {
            renderCarouselImages();
        } else {
            renderGalleryImages();
        }
        saveToLocalStorage();
    }
}

// Load website data from localStorage
function loadWebsiteData() {
    const storedData = localStorage.getItem('everpeakWebsiteData');
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        websiteData = { ...websiteData, ...parsedData };
        populateFormFields();
    }
}

// Populate form fields with current data
function populateFormFields() {
    // Content tab
    document.getElementById('title').value = websiteData.content.title || '';
    document.getElementById('price').value = websiteData.content.price || '';
    document.getElementById('tagline').value = websiteData.content.tagline || '';
    document.getElementById('location').value = websiteData.content.location || '';
    document.getElementById('amenitiesLeft').value = websiteData.content.amenitiesLeft || '';
    document.getElementById('amenitiesRight').value = websiteData.content.amenitiesRight || '';
    document.getElementById('accessLeft').value = websiteData.content.accessLeft || '';
    document.getElementById('accessRight').value = websiteData.content.accessRight || '';
    document.getElementById('transportation').value = websiteData.content.transportation || '';
    
    // Footer tab
    document.getElementById('footerTitle').value = websiteData.footer.title || '';
    document.getElementById('footerDescription').value = websiteData.footer.description || '';
    document.getElementById('facebookUrl').value = websiteData.footer.facebookUrl || '';
    document.getElementById('copyright').value = websiteData.footer.copyright || '';
}

// Save all changes
window.saveAllChanges = function() {
    // Update content data
    websiteData.content.title = document.getElementById('title').value;
    websiteData.content.price = document.getElementById('price').value;
    websiteData.content.tagline = document.getElementById('tagline').value;
    websiteData.content.location = document.getElementById('location').value;
    websiteData.content.amenitiesLeft = document.getElementById('amenitiesLeft').value;
    websiteData.content.amenitiesRight = document.getElementById('amenitiesRight').value;
    websiteData.content.accessLeft = document.getElementById('accessLeft').value;
    websiteData.content.accessRight = document.getElementById('accessRight').value;
    websiteData.content.transportation = document.getElementById('transportation').value;
    
    // Update footer data
    websiteData.footer.title = document.getElementById('footerTitle').value;
    websiteData.footer.description = document.getElementById('footerDescription').value;
    websiteData.footer.facebookUrl = document.getElementById('facebookUrl').value;
    websiteData.footer.copyright = document.getElementById('copyright').value;
    
    saveToLocalStorage();
    alert('All changes saved successfully!');
};

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('everpeakWebsiteData', JSON.stringify(websiteData));
}

// Close modal
window.closeModal = function(modalId) {
    document.getElementById(modalId).style.display = 'none';
};

// Open modal (for compatibility)
window.openModal = function() {
    document.getElementById("imageModal").style.display = "flex";
};