let reservations = [];
let reservationToCancel = null;

document.addEventListener("DOMContentLoaded", async () => {
    const staffSession = checkStaffAuth();
    if (!staffSession) return;
    
    // Navigation
    const designBtn = document.getElementById("designBtn");
    const reservationBtn = document.getElementById("reservationBtn");

    if (designBtn) {
        designBtn.addEventListener("click", () => {
            window.location.href = "admin-design.html";
        });
    }

    if (reservationBtn) {
        reservationBtn.addEventListener("click", () => {
            window.location.href = "admin-reservation.html";
        });
    }

    await loadReservationsFromFirebase();
    setupEventListeners();
});

// Enhanced reservations with Firebase
async function loadReservationsFromFirebase() {
    try {
        const snapshot = await db.collection('reservations')
            .orderBy('createdAt', 'desc')
            .get();
        
        reservations = [];
        snapshot.forEach(doc => {
            reservations.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        updateStats();
        renderReservationsTable();
        
    } catch (error) {
        console.error('Error loading reservations from Firebase:', error);
        // Fallback to localStorage
        loadReservations();
    }
}

async function saveReservationToFirebase(reservation) {
    try {
        const docRef = await db.collection('reservations').add({
            ...reservation,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'confirmed'
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving reservation to Firebase:', error);
        throw error;
    }
}

async function updateReservationStatus(reservationId, status) {
    try {
        await db.collection('reservations').doc(reservationId).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating reservation in Firebase:', error);
        return false;
    }
}

// Fallback to localStorage
function loadReservations() {
    const storedReservations = localStorage.getItem('reservations');
    reservations = storedReservations ? JSON.parse(storedReservations) : [];
    updateStats();
    renderReservationsTable();
}

function updateStats() {
    const total = reservations.length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;
    const revenue = reservations
        .filter(r => r.status === 'confirmed')
        .reduce((sum, r) => {
            const amount = parseFloat(r.totalAmount.replace('P', '').replace(',', ''));
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
    
    document.getElementById('totalReservations').textContent = total;
    document.getElementById('confirmedReservations').textContent = confirmed;
    document.getElementById('cancelledReservations').textContent = cancelled;
    document.getElementById('totalRevenue').textContent = `P${revenue.toFixed(2)}`;
}

function renderReservationsTable() {
    const container = document.getElementById('reservationsTable');
    
    if (reservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Reservations Yet</h3>
                <p>When customers complete bookings, they will appear here.</p>
            </div>
        `;
        return;
    }
    
    const dateFilter = document.getElementById('dateFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    let filteredReservations = [...reservations];
    
    if (statusFilter !== 'all') {
        filteredReservations = filteredReservations.filter(r => r.status === statusFilter);
    }
    
    if (dateFilter !== 'all') {
        const today = new Date();
        filteredReservations = filteredReservations.filter(r => {
            const checkInDate = new Date(r.checkIn);
            
            if (dateFilter === 'today') {
                return checkInDate.toDateString() === today.toDateString();
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                return checkInDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                return checkInDate >= monthAgo;
            }
            return true;
        });
    }
    
    filteredReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Stay Type</th>
                    <th>Guests</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    filteredReservations.forEach(reservation => {
        const guestCount = reservation.guests ? 
            `${reservation.guests.adults} adult(s), ${reservation.guests.children} child(ren)` : 
            '1 adult, 0 children';
        
        tableHTML += `
            <tr>
                <td>${reservation.id.substring(0, 8)}...</td>
                <td>${reservation.name}</td>
                <td>${reservation.email}</td>
                <td>${reservation.checkIn}</td>
                <td>${reservation.checkOut || 'N/A'}</td>
                <td>${reservation.stayType}</td>
                <td>${guestCount}</td>
                <td>${reservation.totalAmount}</td>
                <td><span class="status ${reservation.status}">${reservation.status}</span></td>
                <td>
                    ${reservation.status === 'confirmed' ? 
                        `<button class="action-btn cancel" onclick="openCancelModal('${reservation.id}')">Cancel</button>` : 
                        '<span class="status cancelled">Cancelled</span>'
                    }
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

function openCancelModal(reservationId) {
    reservationToCancel = reservationId;
    document.getElementById('cancelModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function cancelReservation() {
    if (!reservationToCancel) return;
    
    try {
        const success = await updateReservationStatus(reservationToCancel, 'cancelled');
        
        if (success) {
            // Update local data
            const reservationIndex = reservations.findIndex(r => r.id === reservationToCancel);
            if (reservationIndex !== -1) {
                reservations[reservationIndex].status = 'cancelled';
            }
            
            // Update reserved dates
            const reservation = reservations.find(r => r.id === reservationToCancel);
            if (reservation) {
                await removeReservedDates(reservation.checkIn, reservation.checkOut);
            }
            
            updateStats();
            renderReservationsTable();
            closeModal('cancelModal');
            reservationToCancel = null;
            
            alert("Reservation cancelled successfully. The dates are now available for booking.");
        } else {
            alert("Failed to cancel reservation. Please try again.");
        }
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert("Error cancelling reservation. Please try again.");
    }
}

async function removeReservedDates(checkIn, checkOut) {
    try {
        const snapshot = await db.collection('reservedDates')
            .where('checkIn', '==', checkIn)
            .where('checkOut', '==', checkOut)
            .get();
        
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
    } catch (error) {
        console.error('Error removing reserved dates:', error);
    }
}

function setupEventListeners() {
    document.getElementById('dateFilter').addEventListener('change', renderReservationsTable);
    document.getElementById('statusFilter').addEventListener('change', renderReservationsTable);
    document.getElementById('confirmCancel').addEventListener('click', cancelReservation);
}
