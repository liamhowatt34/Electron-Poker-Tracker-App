const Chart = window.Chart;


document.addEventListener("DOMContentLoaded", () => {

    loadSessions();
    loadAggregateData();

    const saveButton = document.getElementById("saveSession");

    saveButton.addEventListener("click", () => {
        const session = {
            date: document.getElementById("date").value,
            stakes: document.getElementById("stakes").value,
            buyIn: parseFloat(document.getElementById("buyIn").value),
            cashOut: parseFloat(document.getElementById("cashOut").value),
            hours: parseFloat(document.getElementById("hours").value),
        };        

        window.electronAPI.saveSession(session);
    });

    window.electronAPI.onSessionSaved((data) => {

        if (data.success) {
            alert("Session saved!");
            loadSessions();
            loadAggregateData();
        } else {
            alert("Error: " + data.error);
        }
    });

    function loadSessions() {
        window.electronAPI.getSessions();
    }

    window.electronAPI.onSessionsReceived((data) => {
    
        if (!data.success || !data.sessions || data.sessions.length === 0) {
            console.warn("[Renderer] No session data received!");
            return;
        }

        sessions = data.sessions;
        currentSessionIndex = 0;
        updateSessionDisplay();
        updateChart(sessions);
    });

    function loadAggregateData() {
        window.electronAPI.getAggregateData();
    }

    window.electronAPI.onAggregateReceived((data) => {

        if (data.success) {
            document.getElementById("totalSessions").innerText = "Total Sessions: " + data.data.total_sessions;
            document.getElementById("totalProfit").innerText = "Total Profit: $" + data.data.total_profit;
            document.getElementById("totalHours").innerText = "Total Hours Played: " + data.data.total_hours;
            document.getElementById("totalHands").innerText = "Total Hands Played: " + data.data.total_hands;
        }
    });

    /** CHART HANDLING **/

    let myChart;

    function updateChart(sessions) {

        const canvas = document.getElementById("profitChart");
        if (!canvas) {
            console.error("[Renderer] Chart canvas not found!");
            return;
        }

        const ctx = canvas.getContext("2d");

        // Destroy existing chart before creating a new one
        if (myChart) {
            myChart.destroy();
        }

        if (sessions.length === 0) {
            console.warn("[Renderer] No sessions available for chart.");
            return;
        }

        // Calculate cumulative total profit
        let cumulativeProfit = sessions.reduce((acc, session, index) => {
            acc.push((index === 0 ? session.profit : acc[index - 1] + session.profit));
            return acc;
        }, []);
        

        myChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: sessions.map((s, i) => "Session " + (i + 1)),
                datasets: [{
                    label: "Total Profit",
                    data: cumulativeProfit,
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.2)",
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: "Sessions" } },
                    y: { title: { display: true, text: "Total Profit ($)" } }
                }
            }
        });
        
    }

    /** SESSION VIEWER HANDLING **/

    let sessions = [];
    let currentSessionIndex = 0;

    function updateSessionDisplay() {
        if (sessions.length === 0) {
            document.getElementById("sessionDate").innerText = "Date: --";
            document.getElementById("sessionStakes").innerText = "Stakes: --";
            document.getElementById("sessionBuyIn").innerText = "Buy-in: --";
            document.getElementById("sessionCashOut").innerText = "Cash-out: --";
            document.getElementById("sessionProfit").innerText = "Profit: --";
            document.getElementById("sessionHours").innerText = "Hours: --";
            document.getElementById("sessionHands").innerText = "Hands: --";
            return;
        }

        const session = sessions[currentSessionIndex];

        document.getElementById("sessionDate").innerText = "Date: " + session.date;
        document.getElementById("sessionStakes").innerText = "Stakes: " + session.stakes;
        document.getElementById("sessionBuyIn").innerText = "Buy-in: $" + session.buy_in;
        document.getElementById("sessionCashOut").innerText = "Cash-out: $" + session.cash_out;
        document.getElementById("sessionProfit").innerText = "Profit: $" + session.profit;
        document.getElementById("sessionHours").innerText = "Hours: " + session.hours;
        document.getElementById("sessionHands").innerText = "Hands: " + (session.hours * 30);
    }

    document.getElementById("prevSession").addEventListener("click", () => {
        if (sessions.length === 0) return;
        currentSessionIndex = (currentSessionIndex > 0) ? currentSessionIndex - 1 : sessions.length - 1;
        updateSessionDisplay();
    });

    document.getElementById("nextSession").addEventListener("click", () => {
        if (sessions.length === 0) return;
        currentSessionIndex = (currentSessionIndex < sessions.length - 1) ? currentSessionIndex + 1 : 0;
        updateSessionDisplay();
    });

    document.getElementById("deleteSession").addEventListener("click", () => {
        if (sessions.length === 0) return;
    
        const sessionToDelete = sessions[currentSessionIndex];
    
        if (confirm(`Are you sure you want to delete this session from ${sessionToDelete.date}?`)) {
            window.electronAPI.deleteSession(sessionToDelete.id);
        }
    });
    
    // Listen for session deleted confirmation
    window.electronAPI.onSessionDeleted((data) => {
    
        if (data.success) {
            alert("Session deleted successfully!");
            loadSessions();
            loadAggregateData();
        } else {
            alert("Error: " + data.error);
        }
    });
    
});
