let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDates = { checkIn: null, checkOut: null };
let guestCount = { adults: 1, children: 0 }; 
const MAX_GUESTS = 15; 
const BASE_GUESTS = 12;
const EXTRA_GUEST_FEE = 300.00;
const MIN_ADULTS = 1;

const today = new Date();
today.setHours(0, 0, 0, 0);

const STAY_PRICES = {
    'day': 800.00,
    'night': 1200.00,
    'whole': 1800.00
};

const formatCurrency = (amount) => {
    return 'P' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Firebase integration for bookings
async function saveBookingToFirebase(bookingData) {
    try {
        const docRef = await db.collection('bookings').add({
            ...bookingData,
            status: 'confirmed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            totalGuests: guestCount.adults + guestCount.children
        });
        
        // Also save to reservations collection for admin
        await db.collection('reservations').add({
            ...bookingData,
            status: 'confirmed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            totalGuests: guestCount.adults + guestCount.children
        });
        
        return docRef.id;
    } catch (error) {
        console.error('Error saving booking to Firebase:', error);
        throw error;
    }
}

async function getReservedDatesFromFirebase() {
    try {
        const snapshot = await db.collection('reservedDates').get();
        const reservedDates = [];
        snapshot.forEach(doc => {
            reservedDates.push(doc.data());
        });
        return reservedDates;
    } catch (error) {
        console.error('Error loading reserved dates from Firebase:', error);
        return [];
    }
}

async function reserveDatesInFirebase(checkIn, checkOut) {
    try {
        await db.collection('reservedDates').add({
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            reservedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error reserving dates in Firebase:', error);
        throw error;
    }
}

// Save to localStorage as fallback
function saveBookingToLocalStorage(bookingData) {
    const storedBookings = localStorage.getItem('bookings');
    const bookings = storedBookings ? JSON.parse(storedBookings) : [];
    bookings.push({
        ...bookingData,
        id: Date.now().toString(),
        status: 'confirmed'
    });
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function openGuestModal() {
    document.getElementById("guestModal").style.display = "flex";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function updateGuestCounts(type, action) {
    let count = guestCount[type];
    const totalGuests = guestCount.adults + guestCount.children;

    if (action === 'plus') {
        if (totalGuests < MAX_GUESTS) {
            count++;
        }
    } else if (action === 'minus') {
        if (type === 'adults' && count > MIN_ADULTS) {
            count--;
        } else if (type === 'children' && count > 0) {
            count--;
        }
    }

    guestCount[type] = count;
    document.getElementById(`${type}Count`).textContent = count;
    updateGuestButtonStates();
    updateSummaryDisplay();
    updateDisplay();
}

function updateGuestButtonStates() {
    const totalGuests = guestCount.adults + guestCount.children;
    const disablePlus = totalGuests >= MAX_GUESTS;

    document.querySelector('.count-btn[data-type="adults"][data-action="plus"]').disabled = disablePlus;
    document.querySelector('.count-btn[data-type="adults"][data-action="minus"]').disabled = guestCount.adults <= MIN_ADULTS;
    document.querySelector('.count-btn[data-type="children"][data-action="plus"]').disabled = disablePlus;
    document.querySelector('.count-btn[data-type="children"][data-action="minus"]').disabled = guestCount.children <= 0;
}

function updateSummaryDisplay() {
    const { checkIn, checkOut } = selectedDates;
    const dateFormat = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

    document.getElementById("guestCountDisplay").textContent = 
        `${guestCount.adults} ${guestCount.adults === 1 ? 'adult' : 'adults'}, ${guestCount.children} ${guestCount.children === 1 ? 'child' : 'children'}`;

    document.getElementById("checkInDisplay").textContent = checkIn 
        ? checkIn.toLocaleDateString('en-US', dateFormat)
        : 'Select Date';
    
    document.getElementById("checkOutDisplay").textContent = checkOut 
        ? checkOut.toLocaleDateString('en-US', dateFormat)
        : (checkIn ? 'Select Date' : 'N/A');
}

function highlightDateRange() {
    const allCells = document.querySelectorAll(".calendar td");
    allCells.forEach(cell => {
        cell.classList.remove("selected", "range-highlight");
    });
    
    const { checkIn, checkOut } = selectedDates;

    if (!checkIn) return;

    const checkInCell = document.querySelector(`[data-date="${checkIn.toISOString().split('T')[0]}"]`);
    if (checkInCell) checkInCell.classList.add("selected");

    if (checkIn && checkOut) {
        const checkOutCell = document.querySelector(`[data-date="${checkOut.toISOString().split('T')[0]}"]`);
        if (checkOutCell) checkOutCell.classList.add("selected");
        
        let currentDate = new Date(checkIn);
        currentDate.setDate(currentDate.getDate() + 1);

        while (currentDate < checkOut) {
            const dateString = currentDate.toISOString().split('T')[0];
            const cell = document.querySelector(`[data-date="${dateString}"]`);
            if (cell) cell.classList.add("range-highlight");
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
}

function renderSingleMonth(month, year, containerId) {
    const monthContainer = document.getElementById(containerId);
    monthContainer.innerHTML = '';

    const header = document.createElement('h3');
    header.textContent = `${new Date(year, month).toLocaleString("default", { month: "long" })} ${year}`;
    monthContainer.appendChild(header);

    const calendar = document.createElement('table');
    calendar.classList.add('calendar');
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const headerRow = document.createElement("tr");
    ["S", "M", "T", "W", "T", "F", "S"].forEach(day => {
        const th = document.createElement("th");
        th.textContent = day;
        headerRow.appendChild(th);
    });
    calendar.appendChild(headerRow);

    let date = 1;
    for (let i = 0; i < 6; i++) {
        let row = document.createElement("tr");

        for (let j = 0; j < 7; j++) {
            let cell = document.createElement("td");

            if (i === 0 && j < firstDay) {
                cell.textContent = "";
            } else if (date > daysInMonth) {
                break;
            } else {
                let currentDate = new Date(year, month, date);
                currentDate.setHours(0, 0, 0, 0);
                const dateString = currentDate.toISOString().split('T')[0];

                cell.innerHTML = `<span class="date-number">${date}</span>`; 
                cell.setAttribute('data-date', dateString);

                if (currentDate < today) {
                    cell.classList.add("reserved");
                } else {
                    cell.addEventListener("click", function () {
                        selectDate(currentDate);
                    });
                }

                date++;
            }
            row.appendChild(cell);
        }
        calendar.appendChild(row);
    }

    monthContainer.appendChild(calendar);
}

function renderTwoMonths() {
    const container = document.getElementById("calendarsContainer");
    container.innerHTML = '';

    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
    }

    const month1Div = document.createElement('div');
    month1Div.id = 'month1';
    month1Div.classList.add('calendar-month');
    
    const month2Div = document.createElement('div');
    month2Div.id = 'month2';
    month2Div.classList.add('calendar-month');

    container.appendChild(month1Div);
    container.appendChild(month2Div);

    renderSingleMonth(currentMonth, currentYear, 'month1');
    renderSingleMonth(nextMonth, nextYear, 'month2');

    highlightDateRange();
}

function selectDate(date) {
    const { checkIn, checkOut } = selectedDates;

    if (!checkIn || (checkIn && checkOut)) {
        selectedDates.checkIn = date;
        selectedDates.checkOut = null;
    } else if (checkIn && !checkOut) {
        if (date.getTime() === checkIn.getTime()) {
            selectedDates.checkIn = null;
            selectedDates.checkOut = null;
        } else if (date < checkIn) {
            selectedDates.checkIn = date;
            selectedDates.checkOut = null;
        } else {
            selectedDates.checkOut = date;
        }
    }

    renderTwoMonths(); 
    updateDisplay();
    updateSummaryDisplay(); 
}

function prevMonths() {
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
        return; 
    }

    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    
    if (currentYear < today.getFullYear() || (currentYear === today.getFullYear() && currentMonth < today.getMonth())) {
         currentMonth = today.getMonth();
         currentYear = today.getFullYear();
    }
    
    renderTwoMonths();
}

function nextMonths() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderTwoMonths();
}

function calculateNightsAndDays(checkIn, checkOut) {
    if (!checkIn) return { nights: 0, days: 0 };
    
    if (!checkOut) {
        return { nights: 1, days: 1 };
    }
    
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
    
    const nights = Math.max(0, diffDays);
    const days = diffDays > 0 ? diffDays : 0;
    
    return { nights, days };
}

function updateDisplay() {
    const { checkIn, checkOut } = selectedDates;
    const stayType = document.getElementById("stayType").value;
    
    const { nights, days } = calculateNightsAndDays(checkIn, checkOut);
    
    let count = 0;
    if (stayType === 'day') {
        count = days;
    } else if (stayType === 'night' || stayType === 'whole') {
        count = nights;
    }
    
    let baseStayCost = 0;
    if (stayType && count > 0) {
        baseStayCost = STAY_PRICES[stayType] * count;
    }
    
    const totalGuests = guestCount.adults + guestCount.children;
    let extraGuests = Math.max(0, totalGuests - BASE_GUESTS);
    let extraGuestCost = extraGuests * EXTRA_GUEST_FEE * Math.max(1, count);
    
    let totalAmount = baseStayCost + extraGuestCost;
    
    document.getElementById("totalAmount").textContent = formatCurrency(totalAmount);
}

async function confirmPayment() {
    const { checkIn, checkOut } = selectedDates;
    const stayType = document.getElementById("stayType").value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const accountNumber = document.getElementById("accountNumber").value;
    const totalAmount = document.getElementById("totalAmount").textContent;

    // Validation
    if (!checkIn) {
        alert("Please select a Check-in date.");
        return;
    }
    if (!stayType) {
        alert("Please select a stay type.");
        return;
    }
    
    const requiresRange = stayType === 'night' || stayType === 'whole';
    if (requiresRange && !checkOut) {
        alert("For Night Tour and Whole Day Stay, please select both a Check-in and Check-out date.");
        return;
    }

    if (!paymentMethod) {
        alert("Please select a payment method.");
        return;
    }
    if (!accountNumber.trim()) {
        alert("Please enter your account number.");
        return;
    }

    // Prepare booking data
    const bookingData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("number").value,
        guests: { ...guestCount },
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut ? checkOut.toISOString().split('T')[0] : null,
        stayType: stayType,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        accountNumber: accountNumber
    };

    try {
        // Save to Firebase
        const bookingId = await saveBookingToFirebase(bookingData);
        
        // Reserve dates
        if (checkOut) {
            await reserveDatesInFirebase(checkIn, checkOut);
        }

        // Show receipt
        showReceipt(bookingData, bookingId);
        
    } catch (error) {
        console.error('Error saving booking:', error);
        // Fallback to localStorage
        saveBookingToLocalStorage(bookingData);
        showReceipt(bookingData, 'local-' + Date.now());
    }
}

function showReceipt(bookingData, bookingId) {
    const details = `
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Name:</strong> ${bookingData.name}</p>
        <p><strong>Email:</strong> ${bookingData.email}</p>
        <p><strong>Phone:</strong> ${bookingData.phone}</p>
        <p><strong>Guests:</strong> ${bookingData.guests.adults} adult(s), ${bookingData.guests.children} child(ren)</p>
        <p><strong>Check-in:</strong> ${new Date(bookingData.checkIn).toDateString()}</p>
        <p><strong>Check-out:</strong> ${bookingData.checkOut ? new Date(bookingData.checkOut).toDateString() : 'N/A'}</p>
        <p><strong>Stay Type:</strong> ${bookingData.stayType}</p>
        <p><strong>Total Due:</strong> <span style="color:var(--accent-gold);">${bookingData.totalAmount}</span></p>
        <hr style="border-color:#444; margin:10px 0;">
        <p><strong>Payment Method:</strong> ${bookingData.paymentMethod}</p>
        <p><strong>Account Number:</strong> ${bookingData.accountNumber}</p>
        <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <p style="color: #4CAF50; font-weight: bold; text-align: center;">✅ Booking Confirmed!</p>
            <p style="font-size: 12px; text-align: center; color: #ccc;">You will receive a confirmation email shortly.</p>
        </div>
    `;
    document.getElementById("receiptDetails").innerHTML = details;
    document.getElementById("receiptModal").style.display = "flex";
}

function isValidPhilippineMobile(number) {
    const s = number.replace(/\D/g, "");
    return (
        /^09\d{9}$/.test(s) ||      
        /^639\d{9}$/.test(s) ||     
        /^\+639\d{9}$/.test(number)
    );
}

document.getElementById("step1Confirm").addEventListener("click", function () {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const number = document.getElementById("number").value.trim();
    const numberError = document.getElementById("numberError");
    
    document.getElementById("name").classList.remove("error-field");
    document.getElementById("email").classList.remove("error-field");
    document.getElementById("number").classList.remove("error-field");
    numberError.textContent = "";

    if (!name) {
        document.getElementById("name").classList.add("error-field");
        alert("Please enter your name.");
        return;
    }
    if (!email) {
        document.getElementById("email").classList.add("error-field");
        alert("Please enter your email.");
        return;
    }
    if (!number || !isValidPhilippineMobile(number)) {
        document.getElementById("number").classList.add("error-field");
        numberError.textContent = "Enter a valid Philippine mobile number.";
        return;
    }

    document.getElementById("step1").classList.remove("active");
    document.getElementById("step2").classList.add("active");
});

document.addEventListener("DOMContentLoaded", () => {
    const guestSummaryItem = document.querySelector('.summary-item:first-child');
    guestSummaryItem.classList.add('clickable');
    guestSummaryItem.addEventListener('click', openGuestModal);

    document.querySelectorAll('.count-btn').forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const action = this.getAttribute('data-action');
            updateGuestCounts(type, action);
        });
    });

    renderTwoMonths();
    updateDisplay();
    updateSummaryDisplay();
    updateGuestButtonStates();
});

document.getElementById("stayType").addEventListener("change", updateDisplay);
