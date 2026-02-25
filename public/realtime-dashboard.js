// ⚡ REAL-TIME DASHBOARD - Professional Tadbirkor uchun
// WebSocket orqali real-time ma'lumotlar

class RealtimeDashboard {
    constructor() {
        this.socket = null;
        this.charts = {};
        this.data = {
            sales: [],
            branches: [],
            cashiers: [],
            products: [],
            kpis: {}
        };
        this.init();
    }
    
    init() {
        this.render();
        this.connectWebSocket();
        this.loadInitialData();
        this.startAutoRefresh();
        this.setupEventListeners();
    }
    
    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: #0f172a;
                    color: 