        let reservations = [];
        let reservationToCancel = null;
document.addEventListener("DOMContentLoaded", () => {
    const staffSession = checkStaffAuth();
    if (!staffSession) return;
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
                staffLogout();
            }
        });
    }
    
    const designBtn = document.getElementById("designBtn");
    const reservationBtn = document.getElementById("reservationBtn");
});
        document.addEventListener('DOMContentLoaded', function() {
            loadReservations();
            setupEventListeners();
        });
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
            
           
            filteredReservations.sort((a, b) => b.id - a.id);
            let tableHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
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
                        <td>${reservation.id}</td>
                        <td>${reservation.name}</td>
                        <td>${reservation.checkIn}</td>
                        <td>${reservation.checkOut}</td>
                        <td>${reservation.stayType}</td>
                        <td>${guestCount}</td>
                        <td>${reservation.totalAmount}</td>
                        <td><span class="status ${reservation.status}">${reservation.status}</span></td>
                        <td>
                            ${reservation.status === 'confirmed' ? 
                                `<button class="action-btn cancel" onclick="openCancelModal(${reservation.id})">Cancel</button>` : 
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

    
        function cancelReservation() {
            if (!reservationToCancel) return;
            
            
            const reservationIndex = reservations.findIndex(r => r.id === reservationToCancel);
            
            if (reservationIndex !== -1) {
               
                reservations[reservationIndex].status = 'cancelled';
                
                
                const reservedDates = JSON.parse(localStorage.getItem("reservedDates") || "[]");
                const checkIn = new Date(reservations[reservationIndex].checkIn).toISOString();
                const checkOut = new Date(reservations[reservationIndex].checkOut).toISOString();
                
                const updatedReservedDates = reservedDates.filter(date => 
                    !(date.checkIn === checkIn && date.checkOut === checkOut)
                );
                
                localStorage.setItem("reservations", JSON.stringify(reservations));
                localStorage.setItem("reservedDates", JSON.stringify(updatedReservedDates));
                
                updateStats();
                renderReservationsTable();
                
                closeModal('cancelModal');
                reservationToCancel = null;
                
                alert("Reservation cancelled successfully. The dates are now available for booking.");
            }
        }
        function setupEventListeners() {
            document.getElementById('dateFilter').addEventListener('change', renderReservationsTable);
            document.getElementById('statusFilter').addEventListener('change', renderReservationsTable);
            document.getElementById('confirmCancel').addEventListener('click', cancelReservation);
            document.querySelectorAll('.admin-nav a').forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.querySelectorAll('.admin-nav a').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    if (this.textContent !== 'Reservations') {
                        alert(`${this.textContent} tab clicked - This functionality would be implemented separately`);
                    }
                });
            });
        }