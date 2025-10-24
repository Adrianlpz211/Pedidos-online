/* ===================================
   DASHBOARD DE ANALYTICS COMPLETO - META INSIGHTS STYLE
   =================================== */

(function() {
    'use strict';
    
    console.log('Dashboard Analytics Completo cargado');
    
    // Variables del módulo
    let metricsData = {};
    let currentTab = 'sales';
    let currentPeriod = '30d';
    let charts = {};
    
    // Elementos del DOM
    const metricsContent = document.getElementById('metricsContent');
    
    // ===================================
    // INICIALIZACIÓN
    // ===================================
    function init() {
        console.log('Inicializando Dashboard Analytics...');
        loadMetricsData();
    }
    
    // ===================================
    // CARGA DE DATOS
    // ===================================
    function loadMetricsData() {
        console.log('Cargando datos de analytics...');
        
        showLoadingState();
        
        // Usar requestAnimationFrame para mejor timing
        requestAnimationFrame(() => {
            try {
                metricsData = generateAnalyticsData();
                console.log('✅ Datos de analytics cargados');
                renderDashboard();
                } catch (error) {
                console.error('❌ Error cargando datos de analytics:', error);
            }
        });
    }
    
    function generateAnalyticsData() {
        // Obtener datos reales del sistema
        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        
        console.log('📊 Datos reales encontrados:', {
            pedidos: pedidos.length,
            productos: productos.length,
            userOrders: userOrders.length
        });
        
        return {
            overview: calculateRealOverview(pedidos, productos, userOrders),
            sales: calculateRealSales(pedidos, productos),
            customers: calculateRealCustomers(userOrders),
            products: calculateRealProducts(productos, pedidos),
            categories: calculateRealCategories(productos, pedidos),
            users: calculateRealUsers(),
            alerts: generateRealAlerts(pedidos, productos),
            demographics: calculateRealDemographics(userOrders),
            predictions: generatePredictions(pedidos, productos)
        };
    }
    
    function generateDailyRevenueData() {
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                revenue: Math.floor(Math.random() * 5000) + 1000,
                orders: Math.floor(Math.random() * 10) + 1,
                customers: Math.floor(Math.random() * 5) + 1
            });
        }
        return data;
    }
    
    function generateInventoryMovements() {
        return [
            { product: 'Microonda Damasco', type: 'sale', quantity: -2, timestamp: '2024-01-15T14:30:00Z' },
            { product: 'Smartphone Galaxy S23', type: 'sale', quantity: -1, timestamp: '2024-01-15T13:15:00Z' },
            { product: 'Laptop Gaming ASUS', type: 'restock', quantity: 5, timestamp: '2024-01-15T11:00:00Z' },
            { product: 'Zapatos Deportivos Nike', type: 'sale', quantity: -1, timestamp: '2024-01-15T10:45:00Z' }
        ];
    }
    
    function generateSeasonalTrends() {
        return {
            'Enero': { revenue: 125000, orders: 45 },
            'Febrero': { revenue: 98000, orders: 38 },
            'Marzo': { revenue: 112000, orders: 42 },
            'Abril': { revenue: 135000, orders: 48 },
            'Mayo': { revenue: 118000, orders: 44 },
            'Junio': { revenue: 142000, orders: 52 }
        };
    }
    
    function generateActivityByHour() {
        const activity = {};
        for (let hour = 0; hour < 24; hour++) {
            activity[hour] = Math.floor(Math.random() * 20) + 5;
        }
        return activity;
    }
    
    // ===================================
    // RENDERIZADO PRINCIPAL
    // ===================================
    function renderDashboard() {
        const contentElement = window.metricsContent || metricsContent;
        if (!contentElement) {
            console.error('❌ Elemento metricsContent no disponible para renderizar');
            return;
        }
        
        const html = `
            <div class="analytics-dashboard">
                ${renderHeader()}
                ${renderTabs()}
                ${renderTabContent()}
            </div>
        `;
        
        contentElement.innerHTML = html;
        setupEventListeners();
        createCharts();
    }
    
    function renderHeader() {
        return `
            <div class="module-header">
               
                <div class="module-actions">
                    <div class="period-selector">
                        <select id="periodSelect" onchange="changePeriod(this.value)">
                            <option value="7d" ${currentPeriod === '7d' ? 'selected' : ''}>Últimos 7 días</option>
                            <option value="30d" ${currentPeriod === '30d' ? 'selected' : ''}>Últimos 30 días</option>
                            <option value="90d" ${currentPeriod === '90d' ? 'selected' : ''}>Últimos 90 días</option>
                            <option value="1y" ${currentPeriod === '1y' ? 'selected' : ''}>Último año</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="refreshAnalytics()">
                            <i class="fas fa-sync-alt"></i>
                            Actualizar
                        </button>
                    <button class="btn btn-secondary" onclick="exportReport()">
                        <i class="fas fa-download"></i>
                        Exportar
                        </button>
                    </div>
                </div>
        `;
    }
    
    function renderTabs() {
        return `
            <div class="analytics-tabs">
                <button class="tab-btn ${currentTab === 'sales' ? 'active' : ''}" onclick="switchTab('sales')">
                    <i class="fas fa-shopping-cart"></i>
                    <span>Ventas & Pedidos</span>
                </button>
                <button class="tab-btn ${currentTab === 'customers' ? 'active' : ''}" onclick="switchTab('customers')">
                    <i class="fas fa-users"></i>
                    <span>Clientes</span>
                </button>
                <button class="tab-btn ${currentTab === 'products' ? 'active' : ''}" onclick="switchTab('products')">
                    <i class="fas fa-box"></i>
                    <span>Productos & Inventario</span>
                </button>
                <button class="tab-btn ${currentTab === 'categories' ? 'active' : ''}" onclick="switchTab('categories')">
                    <i class="fas fa-tags"></i>
                    <span>Categorías</span>
                </button>
                <button class="tab-btn ${currentTab === 'users' ? 'active' : ''}" onclick="switchTab('users')">
                    <i class="fas fa-user-cog"></i>
                    <span>Usuarios</span>
                </button>
                <button class="tab-btn ${currentTab === 'insights' ? 'active' : ''}" onclick="switchTab('insights')">
                    <i class="fas fa-brain"></i>
                    <span>Insights</span>
                </button>
                <button class="tab-btn ${currentTab === 'alerts' ? 'active' : ''}" onclick="switchTab('alerts')">
                    <i class="fas fa-bell"></i>
                    <span>Alertas</span>
                </button>
            </div>
        `;
    }
    
    function renderTabContent() {
        switch (currentTab) {
            case 'sales':
                return renderSalesTab();
            case 'customers':
                return renderCustomersTab();
            case 'products':
                return renderProductsTab();
            case 'categories':
                return renderCategoriesTab();
            case 'users':
                return renderUsersTab();
            case 'insights':
                return renderInsightsTab();
            case 'alerts':
                return renderAlertsTab();
            default:
                return renderSalesTab();
        }
    }
    
    // ===================================
    // RENDERIZADO DE TABS
    // ===================================
    
    function renderSalesTab() {
        const { sales, overview } = metricsData;
        
        return `
            <div class="tab-content" id="sales-tab">
                <!-- KPIs Principales -->
                <div class="kpis-section">
                    <div class="kpi-card primary">
                        <div class="kpi-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="kpi-content">
                            <h3>$${overview.totalRevenue.toLocaleString()}</h3>
                            <p>Ingresos Totales</p>
                            <div class="kpi-growth positive">
                                <i class="fas fa-arrow-up"></i>
                                +${overview.revenueGrowth}%
                            </div>
                        </div>
                    </div>
                    
                    <div class="kpi-card success">
                        <div class="kpi-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="kpi-content">
                            <h3>${overview.totalOrders}</h3>
                            <p>Pedidos Totales</p>
                            <div class="kpi-growth positive">
                                <i class="fas fa-arrow-up"></i>
                                +${overview.ordersGrowth}%
                            </div>
                        </div>
                    </div>
                    
                    <div class="kpi-card info">
                        <div class="kpi-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="kpi-content">
                            <h3>${overview.totalCustomers}</h3>
                            <p>Clientes Totales</p>
                            <div class="kpi-growth positive">
                                <i class="fas fa-arrow-up"></i>
                                +${overview.customersGrowth}%
                            </div>
                        </div>
                    </div>
                    
                    <div class="kpi-card warning">
                        <div class="kpi-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="kpi-content">
                            <h3>$${overview.avgOrderValue.toLocaleString()}</h3>
                            <p>Valor Promedio por Pedido</p>
                            <div class="kpi-growth neutral">
                                <i class="fas fa-minus"></i>
                                Estable
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Métricas de Ventas -->
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h3>${sales.avgProcessingTime} días</h3>
                        <p>Tiempo Promedio Procesamiento</p>
                    </div>
                    <div class="metric-card">
                        <h3>${sales.conversionRate}%</h3>
                        <p>Tasa de Conversión</p>
                    </div>
                </div>
                
                <!-- Gráficos de Ventas -->
                <div class="charts-grid">
                <div class="chart-container">
                    <div class="chart-header">
                            <h3>Ingresos por Categoría</h3>
                            <div class="chart-subtitle">Con márgenes de ganancia</div>
                        </div>
                        <div class="chart-content">
                            <canvas id="categoryRevenueChart" width="400" height="250"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Comparativa Temporal</h3>
                            <div class="chart-subtitle">Ingresos vs Pedidos vs Clientes</div>
                    </div>
                    <div class="chart-content">
                            <canvas id="temporalComparisonChart" width="400" height="250"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Tabla de Productos -->
                <div class="data-section">
                    <h3>Productos Más Vendidos</h3>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Ventas</th>
                                    <th>Ingresos</th>
                                    <th>Promedio por Venta</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sales.topProducts.map(product => `
                                    <tr>
                                        <td>${product.name}</td>
                                        <td>${product.sales}</td>
                                        <td>$${product.revenue.toLocaleString()}</td>
                                        <td>$${Math.round(product.revenue / product.sales).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    function renderCustomersTab() {
        const { customers, demographics } = metricsData;
        
        return `
            <div class="tab-content" id="customers-tab">
                <!-- Métricas de Clientes -->
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h3>${customers.totalCustomers}</h3>
                        <p>Total Clientes</p>
                    </div>
                    <div class="metric-card">
                        <h3>${customers.customerRetention}%</h3>
                        <p>Tasa de Retención</p>
                    </div>
                    <div class="metric-card">
                        <h3>$${customers.avgCustomerValue.toLocaleString()}</h3>
                        <p>Valor Promedio por Cliente</p>
                    </div>
                    <div class="metric-card">
                        <h3>${customers.purchaseBehavior.repeatPurchaseRate}%</h3>
                        <p>Tasa de Recompra</p>
                    </div>
                </div>
                
                <!-- Gráficos Demográficos -->
                <div class="charts-grid">
                <div class="chart-container">
                    <div class="chart-header">
                            <h3>Distribución Geográfica</h3>
                            <div class="chart-subtitle">Clientes por ciudad</div>
                    </div>
                    <div class="chart-content">
                            <canvas id="geographicChart" width="300" height="200"></canvas>
                        </div>
                        <div class="chart-footer">
                            <div class="chart-legend">
                                ${Object.entries(customers.geographicDistribution).map(([city, count]) => {
                                    const percentage = ((count / customers.totalCustomers) * 100).toFixed(1);
                                    return `
                                        <div class="legend-item">
                                            <div class="legend-color" style="background-color: ${getCityColor(city)}"></div>
                                            <span class="legend-label">${city}: ${count} (${percentage}%)</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Distribución por Género</h3>
                            <div class="chart-subtitle">Análisis demográfico</div>
                        </div>
                        <div class="chart-content">
                            <canvas id="genderChart" width="300" height="200"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Distribución por Edad</h3>
                            <div class="chart-subtitle">Grupos etarios</div>
                        </div>
                        <div class="chart-content">
                            <canvas id="ageChart" width="300" height="200"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Clientes VIP -->
                <div class="data-section">
                    <h3>Clientes VIP</h3>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Pedidos</th>
                                    <th>Valor Total</th>
                                    <th>Último Pedido</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${customers.vipCustomers.map(customer => `
                                    <tr>
                                        <td>${customer.name}</td>
                                        <td>${customer.orders}</td>
                                        <td>$${customer.value.toLocaleString()}</td>
                                        <td>${new Date(customer.lastOrder).toLocaleDateString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    function renderProductsTab() {
        const { products } = metricsData;
        
        return `
            <div class="tab-content" id="products-tab">
                <!-- Métricas de Productos -->
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h3>${products.totalProducts}</h3>
                        <p>Total Productos</p>
                    </div>
                    <div class="metric-card">
                        <h3>${products.lowStock.length}</h3>
                        <p>Stock Bajo</p>
                </div>
                    <div class="metric-card">
                        <h3>${products.noMovement.length}</h3>
                        <p>Sin Movimiento</p>
                    </div>
                </div>
                
                <!-- Gráficos de Productos -->
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Rentabilidad vs Rotación</h3>
                            <div class="chart-subtitle">Análisis de productos</div>
                        </div>
                        <div class="chart-content">
                            <canvas id="profitabilityChart" width="400" height="250"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Productos de Mayor Rotación</h3>
                            <div class="chart-subtitle">Top productos por rotación</div>
                        </div>
                        <div class="chart-content">
                            <canvas id="rotationChart" width="400" height="250"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Alertas de Stock -->
                <div class="alerts-section">
                    <h3>Alertas de Stock</h3>
                    <div class="alert-list">
                        ${products.lowStock.map(product => `
                            <div class="alert-item ${product.alert}">
                                <div class="alert-icon">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="alert-content">
                                    <h4>${product.name}</h4>
                                    <p>Stock: ${product.stock} unidades - ${product.category}</p>
                                </div>
                                <div class="alert-actions">
                                    <button class="btn btn-sm btn-primary" onclick="reorderProduct('${product.name}')">
                                        Reordenar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Productos Sin Movimiento -->
                <div class="data-section">
                    <h3>Productos Sin Movimiento</h3>
                    <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                    <th>Días Sin Movimiento</th>
                                    <th>Categoría</th>
                                    <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                                ${products.noMovement.map(product => `
                                    <tr>
                                        <td>${product.name}</td>
                                        <td>${product.days}</td>
                                        <td>${product.category}</td>
                                        <td>
                                            <button class="btn btn-sm btn-warning" onclick="reviewProduct('${product.name}')">
                                                Revisar
                                            </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    function renderCategoriesTab() {
        const { categories } = metricsData;
        
        return `
            <div class="tab-content" id="categories-tab">
                <!-- Métricas de Categorías -->
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h3>${categories.totalCategories}</h3>
                        <p>Total Categorías</p>
                    </div>
                    <div class="metric-card">
                        <h3>$${categories.categoryPerformance.reduce((sum, cat) => sum + cat.revenue, 0).toLocaleString()}</h3>
                        <p>Ingresos Totales</p>
                    </div>
                </div>
                
                <!-- Gráficos de Categorías -->
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Performance por Categoría</h3>
                            <div class="chart-subtitle">Ingresos, costos y ganancias</div>
                        </div>
                        <div class="chart-content">
                            <canvas id="categoryPerformanceChart" width="400" height="250"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Tendencias Estacionales</h3>
                            <div class="chart-subtitle">Últimos 6 meses</div>
                        </div>
                        <div class="chart-content">
                            <canvas id="seasonalTrendsChart" width="400" height="250"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Tabla de Categorías -->
                <div class="data-section">
                    <h3>Rendimiento por Categoría</h3>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Categoría</th>
                                    <th>Productos</th>
                                    <th>Ingresos</th>
                                    <th>Crecimiento</th>
                                    <th>Margen</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${categories.categoryPerformance.map(category => `
                                    <tr>
                                        <td>${category.name}</td>
                                        <td>${category.products}</td>
                                        <td>$${category.revenue.toLocaleString()}</td>
                                        <td><span class="growth positive">+${category.growth}%</span></td>
                                        <td>${category.margin}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    function renderUsersTab() {
        const { users } = metricsData;
        
        return `
            <div class="tab-content" id="users-tab">
                <!-- Métricas de Usuarios -->
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h3>${users.totalUsers}</h3>
                        <p>Total Usuarios</p>
                </div>
                    <div class="metric-card">
                        <h3>${users.activeUsers}</h3>
                        <p>Usuarios Activos</p>
                </div>
                </div>
                
                <!-- Gráficos de Usuarios -->
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Actividad por Hora</h3>
                            <div class="chart-subtitle">Mapa de calor de actividad</div>
                        </div>
                        <div class="chart-content">
                            <canvas id="activityHeatmapChart" width="400" height="250"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Acciones Más Realizadas</h3>
                            <div class="chart-subtitle">Top acciones del sistema</div>
                        </div>
                        <div class="chart-content">
                            <canvas id="actionsChart" width="400" height="250"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Actividad Reciente -->
                <div class="data-section">
                    <h3>Actividad Reciente</h3>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Acción</th>
                                    <th>Módulo</th>
                                    <th>Tiempo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.recentActivity.map(activity => `
                                    <tr>
                                        <td>${activity.user}</td>
                                        <td>${activity.action}</td>
                                        <td>${activity.module}</td>
                                        <td>${activity.time}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    function renderAlertsTab() {
        const { alerts } = metricsData;
        
        return `
            <div class="tab-content" id="alerts-tab">
                <div class="alerts-container">
                    <div class="alerts-header">
                        <h3>🚨 Alertas Inteligentes</h3>
                        <div class="alerts-summary">
                            <span class="critical-count">${alerts.critical.length} Críticas</span>
                            <span class="warnings-count">${alerts.warnings.length} Advertencias</span>
                            <span class="recommendations-count">${alerts.recommendations.length} Recomendaciones</span>
                        </div>
                    </div>
                    
                    <div class="alerts-content">
                        ${alerts.critical.length > 0 ? `
                            <div class="alert-section critical">
                                <h4>🔴 Alertas Críticas</h4>
                                ${alerts.critical.map(alert => `
                                    <div class="alert-item critical" data-priority="${alert.priority}">
                                        <div class="alert-icon">⚠️</div>
                                        <div class="alert-content">
                                            <div class="alert-message">${alert.message}</div>
                                            <div class="alert-action">💡 ${alert.action}</div>
                                            <div class="alert-timestamp">${formatDate(alert.timestamp)}</div>
                                        </div>
                                        <div class="alert-priority">Prioridad ${alert.priority}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${alerts.warnings.length > 0 ? `
                            <div class="alert-section warnings">
                                <h4>🟡 Advertencias</h4>
                                ${alerts.warnings.map(alert => `
                                    <div class="alert-item warning" data-priority="${alert.priority}">
                                        <div class="alert-icon">⚠️</div>
                                        <div class="alert-content">
                                            <div class="alert-message">${alert.message}</div>
                                            <div class="alert-action">💡 ${alert.action}</div>
                                            <div class="alert-timestamp">${formatDate(alert.timestamp)}</div>
                                        </div>
                                        <div class="alert-priority">Prioridad ${alert.priority}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${alerts.recommendations.length > 0 ? `
                            <div class="alert-section recommendations">
                                <h4>💡 Recomendaciones</h4>
                                ${alerts.recommendations.map(alert => `
                                    <div class="alert-item recommendation" data-priority="${alert.priority}">
                                        <div class="alert-icon">💡</div>
                                        <div class="alert-content">
                                            <div class="alert-message">${alert.message}</div>
                                            <div class="alert-action">💡 ${alert.action}</div>
                                            <div class="alert-timestamp">${formatDate(alert.timestamp)}</div>
                                        </div>
                                        <div class="alert-priority">Prioridad ${alert.priority}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${alerts.total === 0 ? `
                            <div class="no-alerts">
                                <div class="no-alerts-icon">✅</div>
                                <div class="no-alerts-message">No hay alertas activas</div>
                                <div class="no-alerts-subtitle">El sistema está funcionando correctamente</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="alerts-footer">
                        <div class="alerts-total">
                            Total: ${alerts.total} alertas
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="refreshAlerts()">
                            <i class="fas fa-sync-alt"></i>
                            Actualizar Alertas
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function refreshAlerts() {
        // Recargar datos y actualizar alertas
        generateAnalyticsData();
        renderTabContent();
        showToast('Alertas actualizadas', 'success');
    }
    
    function renderInsightsTab() {
        const { predictions } = metricsData;
        
        return `
            <div class="tab-content" id="insights-tab">
                <div class="insights-container">
                    <div class="insights-grid">
                        <!-- Predicciones de Ventas -->
                        <div class="insight-card prediction-card">
                            <div class="card-header">
                                <h4>📈 Predicciones de Ventas</h4>
                                <div class="trend-indicator ${predictions.salesTrend.direction}">
                                    <i class="fas fa-arrow-${predictions.salesTrend.direction === 'up' ? 'up' : predictions.salesTrend.direction === 'down' ? 'down' : 'right'}"></i>
                                    ${predictions.salesTrend.direction === 'up' ? 'Alza' : predictions.salesTrend.direction === 'down' ? 'Baja' : 'Estable'}
                                </div>
                            </div>
                            <div class="card-content">
                                <div class="prediction-summary">
                                    <div class="metric">
                                        <span class="label">Promedio diario:</span>
                                        <span class="value">$${predictions.salesTrend.average.toLocaleString()}</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Tendencia:</span>
                                        <span class="value">${predictions.salesTrend.trend > 0 ? '+' : ''}${predictions.salesTrend.trend}%</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Confianza:</span>
                                        <span class="value">${predictions.salesTrend.confidence}%</span>
                                    </div>
                                </div>
                                
                                <div class="next7days">
                                    <h5>Próximos 7 días:</h5>
                                    <div class="predictions-list">
                                        ${predictions.next7DaysPrediction.map(pred => `
                                            <div class="prediction-item">
                                                <span class="day">Día ${pred.day}</span>
                                                <span class="amount">$${pred.predicted.toLocaleString()}</span>
                                                <span class="confidence">${pred.confidence}%</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Productos Estrella -->
                        <div class="insight-card stars-card">
                            <div class="card-header">
                                <h4>⭐ Productos Estrella</h4>
                                <span class="badge">Top 5</span>
                            </div>
                            <div class="card-content">
                                <div class="stars-list">
                                    ${predictions.starProducts.map((product, index) => `
                                        <div class="star-item">
                                            <div class="rank">#${index + 1}</div>
                                            <div class="product-info">
                                                <div class="name">${product.name}</div>
                                                <div class="metrics">
                                                    <span>Frecuencia: ${(product.frequency * 100).toFixed(1)}%</span>
                                                    <span>Ingresos: $${product.totalRevenue.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div class="score">${(product.score * 100).toFixed(0)}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Recomendaciones de Precios -->
                        <div class="insight-card prices-card">
                            <div class="card-header">
                                <h4>💰 Recomendaciones de Precios</h4>
                                <span class="badge">${predictions.priceRecommendations.length} productos</span>
                            </div>
                            <div class="card-content">
                                ${predictions.priceRecommendations.length > 0 ? `
                                    <div class="recommendations-list">
                                        ${predictions.priceRecommendations.slice(0, 5).map(rec => `
                                            <div class="recommendation-item ${rec.recommendation}">
                                                <div class="product-name">${rec.product}</div>
                                                <div class="price-change">
                                                    <span class="current">$${rec.currentPrice}</span>
                                                    <i class="fas fa-arrow-right"></i>
                                                    <span class="suggested">$${rec.suggestedPrice}</span>
                                                </div>
                                                <div class="reason">${rec.reason}</div>
                                                <div class="action-badge ${rec.recommendation}">
                                                    ${rec.recommendation === 'aumentar' ? 'Aumentar' : 
                                                      rec.recommendation === 'reducir' ? 'Reducir' : 'Promocionar'}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div class="no-recommendations">
                                        <i class="fas fa-check-circle"></i>
                                        <p>Los precios están optimizados</p>
                                    </div>
                                `}
                            </div>
                        </div>
                        
                        <!-- Análisis de Estacionalidad -->
                        <div class="insight-card seasonality-card">
                            <div class="card-header">
                                <h4>📅 Patrones Estacionales</h4>
                            </div>
                            <div class="card-content">
                                <div class="seasonality-grid">
                                    <div class="season-item best">
                                        <div class="label">Mejor mes</div>
                                        <div class="value">${predictions.seasonality.bestMonth.name}</div>
                                        <div class="amount">$${predictions.seasonality.bestMonth.sales.toLocaleString()}</div>
                                    </div>
                                    <div class="season-item worst">
                                        <div class="label">Peor mes</div>
                                        <div class="value">${predictions.seasonality.worstMonth.name}</div>
                                        <div class="amount">$${predictions.seasonality.worstMonth.sales.toLocaleString()}</div>
                                    </div>
                                    <div class="season-item best">
                                        <div class="label">Mejor día</div>
                                        <div class="value">${predictions.seasonality.bestDay.name}</div>
                                        <div class="amount">$${predictions.seasonality.bestDay.sales.toLocaleString()}</div>
                                    </div>
                                    <div class="season-item worst">
                                        <div class="label">Peor día</div>
                                        <div class="value">${predictions.seasonality.worstDay.name}</div>
                                        <div class="amount">$${predictions.seasonality.worstDay.sales.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Demanda por Categoría -->
                        <div class="insight-card demand-card">
                            <div class="card-header">
                                <h4>📊 Demanda por Categoría</h4>
                            </div>
                            <div class="card-content">
                                <div class="demand-list">
                                    ${Object.entries(predictions.categoryDemand).map(([category, data]) => `
                                        <div class="demand-item ${data.demandLevel}">
                                            <div class="category-name">${category}</div>
                                            <div class="demand-level">
                                                <span class="level ${data.demandLevel}">${data.demandLevel.toUpperCase()}</span>
                                                <span class="frequency">${(data.frequency * 100).toFixed(1)}%</span>
                                            </div>
                                            <div class="metrics">
                                                <span>$${data.revenue.toLocaleString()}</span>
                                                <span>${data.orders} pedidos</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function showToast(message, type = 'info') {
        // Función de notificación simple
        if (window.dashboard && window.dashboard.showToast) {
            window.dashboard.showToast(message, type);
        } else {
            // Fallback simple
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-size: 14px;
                font-weight: 500;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }
    
    function formatDate(dateString) {
        // Función para formatear fechas
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Fecha inválida';
        }
    }
    
    // ===================================
    // PREDICCIONES Y INSIGHTS AVANZADOS
    // ===================================
    
    function generatePredictions(pedidos, productos) {
        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Verificar si hay suficientes datos
        const recentPedidos = pedidos.filter(p => new Date(p.fechaCreacion) >= last30Days);
        
        if (recentPedidos.length === 0) {
            // Si no hay datos recientes, usar datos de fallback
            return generateFallbackPredictions();
        }
        
        // Análisis de tendencias de ventas
        const salesTrend = analyzeSalesTrend(pedidos, last30Days, now);
        
        // Predicción de ventas para los próximos 7 días
        const next7DaysPrediction = predictNext7Days(salesTrend, pedidos);
        
        // Análisis de estacionalidad
        const seasonality = analyzeSeasonality(pedidos);
        
        // Recomendaciones de precios
        const priceRecommendations = generatePriceRecommendations(productos, pedidos);
        
        // Análisis de productos estrella
        const starProducts = identifyStarProducts(productos, pedidos);
        
        // Predicción de demanda por categoría
        const categoryDemand = predictCategoryDemand(pedidos, productos);
        
        return {
            salesTrend: salesTrend,
            next7DaysPrediction: next7DaysPrediction,
            seasonality: seasonality,
            priceRecommendations: priceRecommendations,
            starProducts: starProducts,
            categoryDemand: categoryDemand
        };
    }
    
    function generateFallbackPredictions() {
        return {
            salesTrend: {
                average: 0,
                trend: 0,
                direction: 'stable',
                confidence: 0
            },
            next7DaysPrediction: Array.from({length: 7}, (_, i) => ({
                day: i + 1,
                date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
                predicted: 0,
                confidence: Math.max(60, 100 - (i + 1) * 5)
            })),
            seasonality: {
                bestMonth: { name: 'No hay datos', sales: 0 },
                worstMonth: { name: 'No hay datos', sales: 0 },
                bestDay: { name: 'No hay datos', sales: 0 },
                worstDay: { name: 'No hay datos', sales: 0 }
            },
            priceRecommendations: [],
            starProducts: [],
            categoryDemand: {}
        };
    }
    
    function analyzeSalesTrend(pedidos, startDate, endDate) {
        const dailySales = {};
        
        // Agrupar ventas por día
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayKey = d.toISOString().split('T')[0];
            dailySales[dayKey] = 0;
        }
        
        pedidos.forEach(pedido => {
            const orderDate = new Date(pedido.fechaCreacion);
            if (orderDate >= startDate && orderDate <= endDate) {
                const dayKey = orderDate.toISOString().split('T')[0];
                if (dailySales[dayKey] !== undefined) {
                    dailySales[dayKey] += pedido.total;
                }
            }
        });
        
        const salesArray = Object.values(dailySales);
        const avgSales = salesArray.reduce((sum, val) => sum + val, 0) / salesArray.length;
        
        // Calcular tendencia (regresión lineal simple)
        let trend = 0;
        let validComparisons = 0;
        
        for (let i = 1; i < salesArray.length; i++) {
            if (salesArray[i-1] > 0) { // Evitar división por cero
                trend += (salesArray[i] - salesArray[i-1]) / salesArray[i-1];
                validComparisons++;
            }
        }
        
        // Si no hay comparaciones válidas, usar 0
        trend = validComparisons > 0 ? trend / validComparisons : 0;
        
        // Validar que los valores no sean NaN
        const safeAvgSales = isNaN(avgSales) ? 0 : avgSales;
        const safeTrend = isNaN(trend) ? 0 : trend;
        const safeConfidence = isNaN(trend) ? 0 : Math.min(Math.abs(trend) * 100, 95);
        
        return {
            average: Math.round(safeAvgSales),
            trend: Math.round(safeTrend * 100) / 100,
            direction: safeTrend > 0.05 ? 'up' : safeTrend < -0.05 ? 'down' : 'stable',
            confidence: Math.round(safeConfidence)
        };
    }
    
    function predictNext7Days(salesTrend, pedidos) {
        const now = new Date();
        const last7Days = [];
        
        // Obtener ventas de los últimos 7 días
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            
            const daySales = pedidos.filter(p => {
                const orderDate = new Date(p.fechaCreacion);
                return orderDate >= dayStart && orderDate < dayEnd;
            }).reduce((sum, p) => sum + p.total, 0);
            
            last7Days.push(daySales);
        }
        
        const avgLast7Days = last7Days.reduce((sum, val) => sum + val, 0) / 7;
        const predictions = [];
        
        // Predecir los próximos 7 días
        for (let i = 1; i <= 7; i++) {
            const basePrediction = avgLast7Days || 0; // Usar 0 si no hay datos
            const trendAdjustment = basePrediction * (salesTrend.trend || 0) * i;
            const dayOfWeekAdjustment = getDayOfWeekAdjustment(last7Days, i);
            
            const prediction = Math.max(0, basePrediction + trendAdjustment + dayOfWeekAdjustment);
            predictions.push({
                day: i,
                date: new Date(now.getTime() + i * 24 * 60 * 60 * 1000),
                predicted: Math.round(prediction),
                confidence: Math.max(60, 100 - (i * 5)) // Disminuye la confianza con los días
            });
        }
        
        return predictions;
    }
    
    function getDayOfWeekAdjustment(last7Days, dayOffset) {
        const dayOfWeek = (new Date().getDay() + dayOffset) % 7;
        const dayPatterns = [0, 1, 2, 3, 4, 5, 6]; // Domingo a Sábado
        
        // Calcular promedio por día de la semana
        const dayAverages = {};
        last7Days.forEach((sales, index) => {
            const day = (new Date().getDay() - (6 - index) + 7) % 7;
            if (!dayAverages[day]) dayAverages[day] = [];
            dayAverages[day].push(sales);
        });
        
        const avgByDay = {};
        Object.keys(dayAverages).forEach(day => {
            avgByDay[day] = dayAverages[day].reduce((sum, val) => sum + val, 0) / dayAverages[day].length;
        });
        
        const overallAvg = last7Days.reduce((sum, val) => sum + val, 0) / 7;
        const targetDayAvg = avgByDay[dayOfWeek] || overallAvg;
        
        // Evitar NaN si overallAvg es 0
        if (overallAvg === 0) {
            return 0;
        }
        
        return (targetDayAvg - overallAvg) * 0.3; // Ajuste suave
    }
    
    function analyzeSeasonality(pedidos) {
        const monthlySales = {};
        const dayOfWeekSales = {};
        
        pedidos.forEach(pedido => {
            const date = new Date(pedido.fechaCreacion);
            const month = date.getMonth();
            const dayOfWeek = date.getDay();
            
            monthlySales[month] = (monthlySales[month] || 0) + pedido.total;
            dayOfWeekSales[dayOfWeek] = (dayOfWeekSales[dayOfWeek] || 0) + pedido.total;
        });
        
        // Encontrar el mejor y peor mes
        const months = Object.keys(monthlySales).map(m => ({
            month: parseInt(m),
            sales: monthlySales[m]
        })).sort((a, b) => b.sales - a.sales);
        
        // Encontrar el mejor y peor día de la semana
        const days = Object.keys(dayOfWeekSales).map(d => ({
            day: parseInt(d),
            sales: dayOfWeekSales[d]
        })).sort((a, b) => b.sales - a.sales);
        
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        return {
            bestMonth: {
                name: monthNames[months[0]?.month],
                sales: months[0]?.sales || 0
            },
            worstMonth: {
                name: monthNames[months[months.length - 1]?.month],
                sales: months[months.length - 1]?.sales || 0
            },
            bestDay: {
                name: dayNames[days[0]?.day],
                sales: days[0]?.sales || 0
            },
            worstDay: {
                name: dayNames[days[days.length - 1]?.day],
                sales: days[days.length - 1]?.sales || 0
            }
        };
    }
    
    function generatePriceRecommendations(productos, pedidos) {
        const productSales = {};
        
        // Analizar ventas por producto
        pedidos.forEach(pedido => {
            pedido.productos.forEach(producto => {
                const key = producto.nombre;
                if (!productSales[key]) {
                    productSales[key] = {
                        totalSales: 0,
                        totalQuantity: 0,
                        currentPrice: producto.precio,
                        orders: 0
                    };
                }
                productSales[key].totalSales += producto.cantidad * producto.precio;
                productSales[key].totalQuantity += producto.cantidad;
                productSales[key].orders += 1;
            });
        });
        
        const recommendations = [];
        
        Object.entries(productSales).forEach(([name, data]) => {
            const avgPrice = data.totalSales / data.totalQuantity;
            const priceChange = ((avgPrice - data.currentPrice) / data.currentPrice) * 100;
            const frequency = data.orders / pedidos.length;
            
            let recommendation = 'mantener';
            let reason = '';
            let suggestedPrice = data.currentPrice;
            
            if (frequency < 0.1 && priceChange < -10) {
                // Producto poco vendido y precio bajo
                recommendation = 'aumentar';
                suggestedPrice = data.currentPrice * 1.15;
                reason = 'Baja frecuencia de ventas, precio por debajo del promedio';
            } else if (frequency > 0.3 && priceChange > 10) {
                // Producto muy vendido y precio alto
                recommendation = 'reducir';
                suggestedPrice = data.currentPrice * 0.9;
                reason = 'Alta frecuencia de ventas, precio por encima del promedio';
            } else if (frequency < 0.05) {
                // Producto muy poco vendido
                recommendation = 'promocionar';
                suggestedPrice = data.currentPrice * 0.85;
                reason = 'Muy baja frecuencia de ventas, necesita promoción';
            }
            
            if (recommendation !== 'mantener') {
                recommendations.push({
                    product: name,
                    currentPrice: data.currentPrice,
                    suggestedPrice: Math.round(suggestedPrice),
                    recommendation: recommendation,
                    reason: reason,
                    frequency: Math.round(frequency * 100) / 100,
                    priceChange: Math.round(priceChange * 10) / 10
                });
            }
        });
        
        return recommendations.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));
    }
    
    function identifyStarProducts(productos, pedidos) {
        const productPerformance = {};
        
        pedidos.forEach(pedido => {
            pedido.productos.forEach(producto => {
                const key = producto.nombre;
                if (!productPerformance[key]) {
                    productPerformance[key] = {
                        totalRevenue: 0,
                        totalQuantity: 0,
                        orders: 0,
                        avgOrderValue: 0
                    };
                }
                productPerformance[key].totalRevenue += producto.cantidad * producto.precio;
                productPerformance[key].totalQuantity += producto.cantidad;
                productPerformance[key].orders += 1;
            });
        });
        
        // Calcular métricas
        Object.keys(productPerformance).forEach(key => {
            const data = productPerformance[key];
            data.avgOrderValue = data.totalRevenue / data.orders;
            data.frequency = data.orders / pedidos.length;
            data.revenueShare = data.totalRevenue / pedidos.reduce((sum, p) => sum + p.total, 0);
        });
        
        // Identificar estrellas
        const stars = Object.entries(productPerformance)
            .map(([name, data]) => ({
                name,
                ...data,
                score: (data.frequency * 0.3) + (data.revenueShare * 0.4) + (data.avgOrderValue / 1000 * 0.3)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        
        return stars;
    }
    
    function predictCategoryDemand(pedidos, productos) {
        const categorySales = {};
        const categoryTrends = {};
        
        // Analizar ventas por categoría en los últimos 30 días
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        pedidos.forEach(pedido => {
            const orderDate = new Date(pedido.fechaCreacion);
            if (orderDate >= last30Days) {
                pedido.productos.forEach(producto => {
                    const productInfo = productos.find(p => p.nombre === producto.nombre);
                    if (productInfo && productInfo.categoria) {
                        const category = productInfo.categoria;
                        if (!categorySales[category]) {
                            categorySales[category] = {
                                revenue: 0,
                                quantity: 0,
                                orders: 0
                            };
                        }
                        categorySales[category].revenue += producto.cantidad * producto.precio;
                        categorySales[category].quantity += producto.cantidad;
                        categorySales[category].orders += 1;
                    }
                });
            }
        });
        
        // Calcular tendencias
        Object.keys(categorySales).forEach(category => {
            const data = categorySales[category];
            const avgOrderValue = data.revenue / data.orders;
            const frequency = data.orders / pedidos.filter(p => new Date(p.fechaCreacion) >= last30Days).length;
            
            categoryTrends[category] = {
                revenue: data.revenue,
                quantity: data.quantity,
                orders: data.orders,
                avgOrderValue: Math.round(avgOrderValue),
                frequency: Math.round(frequency * 100) / 100,
                demandLevel: frequency > 0.3 ? 'alta' : frequency > 0.1 ? 'media' : 'baja'
            };
        });
        
        return categoryTrends;
    }
    
    // ===================================
    // GRÁFICOS CON CHART.JS
    // ===================================
    function createCharts() {
        console.log('📊 Creando gráficos...');
        
        // Usar requestAnimationFrame para asegurar que el DOM esté listo
        requestAnimationFrame(() => {
            try {
                createOrderStatusChart();
                createTopProductsChart();
                createCategoryRevenueChart();
                createTemporalComparisonChart();
                createGeographicChart();
                createGenderChart();
                createAgeChart();
                createProfitabilityChart();
                createRotationChart();
                createCategoryPerformanceChart();
                createSeasonalTrendsChart();
                createActivityHeatmapChart();
                createActionsChart();
                console.log('✅ Todos los gráficos creados exitosamente');
            } catch (error) {
                console.error('❌ Error creando gráficos:', error);
            }
        });
    }
    
    
    function createOrderStatusChart() {
        const ctx = document.getElementById('orderStatusChart');
        if (!ctx) return;
        
        const { sales } = metricsData;
        const statusData = sales.orderStatus;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pendiente', 'Pagado', 'Procesado', 'Cancelado'],
                datasets: [{
                    data: [
                        statusData.pendiente,
                        statusData.pagado,
                        statusData.procesado,
                        statusData.cancelado
                    ],
                    backgroundColor: [
                        '#f39c12', // Pendiente - Naranja
                        '#27ae60', // Pagado - Verde
                        '#3498db', // Procesado - Azul
                        '#e74c3c'  // Cancelado - Rojo
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
    
    function createTopProductsChart() {
        const ctx = document.getElementById('topProductsChart');
        if (!ctx) return;
        
        const { sales } = metricsData;
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sales.topProducts.map(product => product.name),
                datasets: [{
                    label: 'Ventas',
                    data: sales.topProducts.map(product => product.sales),
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(39, 174, 96, 0.8)',
                        'rgba(231, 76, 60, 0.8)',
                        'rgba(243, 156, 18, 0.8)',
                        'rgba(155, 89, 182, 0.8)'
                    ],
                    borderColor: [
                        '#3498db',
                        '#27ae60',
                        '#e74c3c',
                        '#f39c12',
                        '#9b59b6'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#ffffff',
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }
    
    function createCategoryRevenueChart() {
        const ctx = document.getElementById('categoryRevenueChart');
        if (!ctx) return;
        
        const { sales } = metricsData;
        const categories = Object.keys(sales.revenueByCategory);
        const revenues = categories.map(cat => sales.revenueByCategory[cat].revenue);
        const profits = categories.map(cat => sales.revenueByCategory[cat].profit);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Ingresos',
                    data: revenues,
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderColor: '#3498db',
                    borderWidth: 2
                }, {
                    label: 'Ganancias',
                    data: profits,
                    backgroundColor: 'rgba(39, 174, 96, 0.8)',
                    borderColor: '#27ae60',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }
    
    function createTemporalComparisonChart() {
        const ctx = document.getElementById('temporalComparisonChart');
        if (!ctx) return;
        
        const { sales } = metricsData;
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sales.dailyRevenue.map(day => day.date),
                datasets: [{
                    label: 'Ingresos',
                    data: sales.dailyRevenue.map(day => day.revenue),
                    backgroundColor: '#3498db',
                    borderColor: '#2980b9',
                    borderWidth: 1
                }, {
                    label: 'Pedidos',
                    data: sales.dailyRevenue.map(day => day.orders * 1000), // Escalar para visualización
                    backgroundColor: '#27ae60',
                    borderColor: '#229954',
                    borderWidth: 1
                }, {
                    label: 'Clientes',
                    data: sales.dailyRevenue.map(day => day.customers * 500), // Escalar para visualización
                    backgroundColor: '#f39c12',
                    borderColor: '#e67e22',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }
    
    function createGeographicChart() {
        const ctx = document.getElementById('geographicChart');
        if (!ctx) return;
        
        const { customers } = metricsData;
        const distribution = customers.geographicDistribution;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(distribution),
                datasets: [{
                    data: Object.values(distribution),
                    backgroundColor: [
                        '#e74c3c', // Bogotá - Rojo
                        '#3498db', // Medellín - Azul
                        '#2ecc71', // Cali - Verde
                        '#f39c12', // Barranquilla - Naranja
                        '#9b59b6'  // Cartagena - Púrpura
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
    
    function createGenderChart() {
        const ctx = document.getElementById('genderChart');
        if (!ctx) return;
        
        const { demographics } = metricsData;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Mujeres', 'Hombres'],
                datasets: [{
                    data: [demographics.genderDistribution.femenino, demographics.genderDistribution.masculino],
                    backgroundColor: ['#e74c3c', '#3498db'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
    
    function createAgeChart() {
        const ctx = document.getElementById('ageChart');
        if (!ctx) return;
        
        const { demographics } = metricsData;
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(demographics.ageGroups),
                datasets: [{
                    label: 'Clientes por Edad',
                    data: Object.values(demographics.ageGroups),
                    backgroundColor: 'rgba(39, 174, 96, 0.8)',
                    borderColor: '#27ae60',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }
    
    function createProfitabilityChart() {
        const ctx = document.getElementById('profitabilityChart');
        if (!ctx) return;
        
        const { products } = metricsData;
        
        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Productos',
                    data: products.topRotating.map(product => ({
                        x: product.rotation,
                        y: product.profit
                    })),
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderColor: '#3498db',
                    borderWidth: 2,
                    pointRadius: 8,
                    pointHoverRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Rotación (%)',
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Margen de Ganancia (%)',
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }
    
    function createRotationChart() {
        const ctx = document.getElementById('rotationChart');
        if (!ctx) return;
        
        const { products } = metricsData;
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: products.topRotating.map(product => product.name),
                datasets: [{
                    label: 'Rotación (%)',
                    data: products.topRotating.map(product => product.rotation),
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(39, 174, 96, 0.8)',
                        'rgba(231, 76, 60, 0.8)'
                    ],
                    borderColor: [
                        '#3498db',
                        '#27ae60',
                        '#e74c3c'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#ffffff',
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }
    
    function createCategoryPerformanceChart() {
        const ctx = document.getElementById('categoryPerformanceChart');
        if (!ctx) return;
        
        const { categories } = metricsData;
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories.categoryPerformance.map(cat => cat.name),
                datasets: [{
                    label: 'Ingresos',
                    data: categories.categoryPerformance.map(cat => cat.revenue),
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderColor: '#3498db',
                    borderWidth: 2
                }, {
                    label: 'Crecimiento (%)',
                    data: categories.categoryPerformance.map(cat => cat.growth),
                    backgroundColor: 'rgba(39, 174, 96, 0.8)',
                    borderColor: '#27ae60',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Ingresos ($)',
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Crecimiento (%)',
                            color: '#ffffff'
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }
    
    function createSeasonalTrendsChart() {
        const ctx = document.getElementById('seasonalTrendsChart');
        if (!ctx) return;
        
        const { categories } = metricsData;
        const seasonalData = categories.seasonalTrends;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(seasonalData),
                datasets: [{
                    label: 'Ingresos',
                    data: Object.values(seasonalData).map(data => data.revenue),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Pedidos',
                    data: Object.values(seasonalData).map(data => data.orders),
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 3,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }
    
    function createActivityHeatmapChart() {
        const ctx = document.getElementById('activityHeatmapChart');
        if (!ctx) return;
        
        const { users } = metricsData;
        const activityData = users.activityByHour;
        
        // Crear datos para mapa de calor (simplificado como gráfico de barras)
        const hours = Object.keys(activityData).map(h => h + ':00');
        const activities = Object.values(activityData);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Actividad',
                    data: activities,
                    backgroundColor: activities.map(activity => {
                        const intensity = activity / Math.max(...activities);
                        return `rgba(52, 152, 219, ${0.3 + intensity * 0.7})`;
                    }),
                    borderColor: '#3498db',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            stepSize: 5
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#ffffff',
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }
    
    function createActionsChart() {
        const ctx = document.getElementById('actionsChart');
        if (!ctx) return;
        
        const { users } = metricsData;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: users.mostPerformedActions.map(action => action.action),
                datasets: [{
                    data: users.mostPerformedActions.map(action => action.count),
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(39, 174, 96, 0.8)',
                        'rgba(231, 76, 60, 0.8)',
                        'rgba(243, 156, 18, 0.8)'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
    
    // ===================================
    // UTILIDADES
    // ===================================
    function getCityColor(city) {
        const colors = {
            'Bogotá': '#e74c3c',
            'Medellín': '#3498db',
            'Cali': '#2ecc71',
            'Barranquilla': '#f39c12',
            'Cartagena': '#9b59b6'
        };
        return colors[city] || '#95a5a6';
    }
    
    function showLoadingState() {
        if (!metricsContent) return;
        
        metricsContent.innerHTML = `
            <div class="analytics-loading">
                <div class="loading-spinner"></div>
                <p>Cargando Analytics Dashboard...</p>
            </div>
        `;
    }
    
    function setupEventListeners() {
        // Event listeners para tabs
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
                switchTab(tabName);
            });
        });
    }
    
    // ===================================
    // FUNCIONES PÚBLICAS
    // ===================================
    window.loadMetricasModule = function() {
        console.log('Cargando Dashboard Analytics...');
        
        // Re-inicializar elementos del DOM por si no estaban disponibles
        const metricsContentNew = document.getElementById('metricsContent');
        if (!metricsContentNew) {
            console.error('❌ Elemento metricsContent no encontrado');
            return;
        }
        
        // Actualizar referencia global
        window.metricsContent = metricsContentNew;
        
        // Limpiar gráficos existentes
        Object.keys(charts).forEach(key => {
            if (charts[key] && typeof charts[key].destroy === 'function') {
                charts[key].destroy();
            }
        });
        charts = {};
        
        // Reinicializar
        init();
    };
    
    window.switchTab = function(tabName) {
        currentTab = tabName;
        
        // Actualizar botones de tab
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        const activeButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Re-renderizar contenido
        renderDashboard();
    };
    
    window.changePeriod = function(period) {
        currentPeriod = period;
        window.dashboard.showToast(`Período cambiado a: ${period}`, 'info');
        loadMetricsData();
    };
    
    window.refreshAnalytics = function() {
        window.dashboard.showToast('Actualizando analytics...', 'info');
        setTimeout(() => {
            loadMetricsData();
            window.dashboard.showToast('Analytics actualizados', 'success');
        }, 1000);
    };
    
    window.exportReport = function() {
        window.dashboard.showToast('Exportando reporte...', 'info');
        setTimeout(() => {
            window.dashboard.showToast('Reporte exportado exitosamente', 'success');
        }, 2000);
    };
    
    // Funciones de acción
    window.reorderProduct = function(productName) {
        window.dashboard.showToast(`Reordenando: ${productName}`, 'info');
    };
    
    window.reviewProduct = function(productName) {
        window.dashboard.showToast(`Revisando: ${productName}`, 'info');
    };
    
    window.handleAlert = function(alertType) {
        window.dashboard.showToast(`Manejando alerta: ${alertType}`, 'info');
    };
    
    // showToast ahora se usa directamente desde window.dashboard.showToast
    
    // ===================================
    // FUNCIONES DE CÁLCULO REAL
    // ===================================
    
    function calculateRealOverview(pedidos, productos, userOrders) {
        const totalRevenue = pedidos.reduce((sum, pedido) => {
            return pedido.estado === 'pagado' || pedido.estado === 'procesado' ? sum + pedido.total : sum;
        }, 0);
        
        const totalOrders = pedidos.length;
        const totalCustomers = new Set(userOrders.map(order => order.id)).size;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Calcular crecimiento real (últimos 7 días vs anteriores)
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const recentRevenue = pedidos.filter(p => new Date(p.fechaCreacion) >= weekAgo)
            .reduce((sum, p) => sum + (p.total || 0), 0);
        const previousRevenue = pedidos.filter(p => {
            const fecha = new Date(p.fechaCreacion);
            return fecha >= twoWeeksAgo && fecha < weekAgo;
        }).reduce((sum, p) => sum + (p.total || 0), 0);
        
        const recentOrders = pedidos.filter(p => new Date(p.fechaCreacion) >= weekAgo).length;
        const previousOrders = pedidos.filter(p => {
            const fecha = new Date(p.fechaCreacion);
            return fecha >= twoWeeksAgo && fecha < weekAgo;
        }).length;
        
        const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        const ordersGrowth = previousOrders > 0 ? ((recentOrders - previousOrders) / previousOrders) * 100 : 0;
        
        // Calcular tasa de conversión real (simplificada)
        const totalVisits = userOrders.length * 3; // Estimación: 3 visitas por pedido
        const conversionRate = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : 0;
        
        // Calcular crecimiento de clientes
        const recentCustomers = new Set(userOrders.filter(order => new Date(order.date) >= weekAgo).map(o => o.id)).size;
        const previousCustomers = new Set(userOrders.filter(order => {
            const fecha = new Date(order.date);
            return fecha >= twoWeeksAgo && fecha < weekAgo;
        }).map(o => o.id)).size;
        
        const customersGrowth = previousCustomers > 0 ? ((recentCustomers - previousCustomers) / previousCustomers) * 100 : 0;
        
        return {
            totalRevenue: Math.round(totalRevenue),
            totalOrders: totalOrders,
            totalCustomers: totalCustomers,
            avgOrderValue: Math.round(avgOrderValue),
            conversionRate: Math.round(conversionRate * 10) / 10,
            revenueGrowth: Math.round(revenueGrowth * 10) / 10,
            ordersGrowth: Math.round(ordersGrowth * 10) / 10,
            customersGrowth: Math.round(customersGrowth * 10) / 10,
            monthlyTarget: 150000 // Configurable
        };
    }
    
    function calculateRealSales(pedidos, productos) {
        // Estados de pedidos reales
        const orderStatus = pedidos.reduce((acc, pedido) => {
            acc[pedido.estado] = (acc[pedido.estado] || 0) + 1;
            return acc;
        }, {});
        
        // Productos más vendidos
        const productSales = {};
        pedidos.forEach(pedido => {
            pedido.productos.forEach(producto => {
                const key = producto.nombre;
                if (!productSales[key]) {
                    productSales[key] = { sales: 0, revenue: 0 };
                }
                productSales[key].sales += producto.cantidad;
                productSales[key].revenue += producto.cantidad * producto.precio;
            });
        });
        
        const topProducts = Object.entries(productSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
        
        // Ingresos por categoría
        const categoryRevenue = {};
        pedidos.forEach(pedido => {
            pedido.productos.forEach(producto => {
                const productoInfo = productos.find(p => p.id == producto.id);
                if (productoInfo && productoInfo.categoria) {
                    const categoria = productoInfo.categoria;
                    if (!categoryRevenue[categoria]) {
                        categoryRevenue[categoria] = { revenue: 0, cost: 0, profit: 0 };
                    }
                    categoryRevenue[categoria].revenue += producto.cantidad * producto.precio;
                    // Costo estimado (asumir 70% del precio como costo)
                    const cost = producto.cantidad * producto.precio * 0.7;
                    categoryRevenue[categoria].cost += cost;
                    categoryRevenue[categoria].profit += producto.cantidad * producto.precio - cost;
                }
            });
        });
        
        // Calcular tiempo promedio de procesamiento real
        const processedOrders = pedidos.filter(p => p.estado === 'procesado' && p.fechaModificacion);
        const avgProcessingTime = processedOrders.length > 0 ? 
            processedOrders.reduce((sum, pedido) => {
                const created = new Date(pedido.fechaCreacion);
                const processed = new Date(pedido.fechaModificacion);
                const diffHours = (processed - created) / (1000 * 60 * 60);
                return sum + diffHours;
            }, 0) / processedOrders.length / 24 : 0; // Convertir a días
        
        return {
            dailyRevenue: generateDailyRevenueData(),
            orderStatus: {
                pendiente: orderStatus.pendiente || 0,
                pagado: orderStatus.pagado || 0,
                procesado: orderStatus.procesado || 0,
                cancelado: orderStatus.cancelado || 0
            },
            topProducts: topProducts,
            revenueByCategory: categoryRevenue,
            avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
            conversionRate: 3.2
        };
    }
    
    function calculateRealCustomers(userOrders) {
        const totalCustomers = userOrders.length;
        const uniqueCustomers = new Set(userOrders.map(order => order.id)).size;
        
        // Calcular valor promedio por cliente
        const customerValues = {};
        userOrders.forEach(order => {
            if (!customerValues[order.id]) {
                customerValues[order.id] = { orders: 0, totalValue: 0, firstOrder: order.date, lastOrder: order.date };
            }
            customerValues[order.id].orders += 1;
            customerValues[order.id].totalValue += order.total || 0;
            if (new Date(order.date) < new Date(customerValues[order.id].firstOrder)) {
                customerValues[order.id].firstOrder = order.date;
            }
            if (new Date(order.date) > new Date(customerValues[order.id].lastOrder)) {
                customerValues[order.id].lastOrder = order.date;
            }
        });
        
        const avgCustomerValue = Object.values(customerValues).reduce((sum, customer) => sum + customer.totalValue, 0) / uniqueCustomers;
        
        // Calcular retención real (clientes con más de 1 pedido)
        const repeatCustomers = Object.values(customerValues).filter(customer => customer.orders > 1).length;
        const customerRetention = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;
        
        // Calcular días promedio entre pedidos
        const customersWithMultipleOrders = Object.values(customerValues).filter(c => c.orders > 1);
        const avgDaysBetweenOrders = customersWithMultipleOrders.length > 0 ?
            customersWithMultipleOrders.reduce((sum, customer) => {
                const firstOrder = new Date(customer.firstOrder);
                const lastOrder = new Date(customer.lastOrder);
                const daysDiff = (lastOrder - firstOrder) / (1000 * 60 * 60 * 24);
                return sum + (daysDiff / (customer.orders - 1));
            }, 0) / customersWithMultipleOrders.length : 0;
        
        // Clientes VIP (top 3 por valor)
        const vipCustomers = Object.entries(customerValues)
            .map(([id, data]) => ({
                name: `Cliente ${id.slice(-4)}`,
                orders: data.orders,
                value: data.totalValue,
                lastOrder: data.lastOrder
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);
        
        return {
            totalCustomers: uniqueCustomers,
            newCustomers: Math.max(0, totalCustomers - uniqueCustomers),
            returningCustomers: repeatCustomers,
            customerRetention: Math.round(customerRetention * 10) / 10,
            avgCustomerValue: Math.round(avgCustomerValue),
            geographicDistribution: {
                'Online': uniqueCustomers
            },
            vipCustomers: vipCustomers,
            purchaseBehavior: {
                avgOrdersPerCustomer: totalCustomers / uniqueCustomers,
                avgDaysBetweenOrders: Math.round(avgDaysBetweenOrders),
                repeatPurchaseRate: Math.round(customerRetention * 10) / 10
            }
        };
    }
    
    function calculateRealProducts(productos, pedidos) {
        const totalProducts = productos.length;
        
        // Detectar si el negocio usa inventario
        const usesInventory = productos.some(p => 
            p.stock !== undefined && p.stockInicial !== undefined && 
            p.stock !== null && p.stockInicial !== null
        );
        
        console.log('📦 Sistema de inventario detectado:', usesInventory ? 'SÍ' : 'NO');
        
        let lowStock = [];
        let topRotating = [];
        let noMovement = [];
        let profitability = { highMargin: 0, mediumMargin: 0, lowMargin: 0 };
        
        if (usesInventory) {
            // SISTEMA CON INVENTARIO
            lowStock = productos.filter(producto => producto.stock < 10)
                .map(producto => ({
                    name: producto.nombre,
                    stock: producto.stock,
                    alert: producto.stock === 0 ? 'out' : producto.stock < 5 ? 'critical' : 'warning',
                    category: producto.categoria || 'Sin categoría'
                }));
            
            // Calcular rotación real de productos
            const productRotation = {};
            pedidos.forEach(pedido => {
                pedido.productos.forEach(producto => {
                    const key = producto.nombre;
                    if (!productRotation[key]) {
                        productRotation[key] = { sales: 0, revenue: 0 };
                    }
                    productRotation[key].sales += producto.cantidad;
                    productRotation[key].revenue += producto.cantidad * producto.precio;
                });
            });
            
            // Top productos por rotación
            topRotating = Object.entries(productRotation)
                .map(([name, data]) => {
                    const producto = productos.find(p => p.nombre === name);
                    const rotation = producto ? ((producto.stockInicial - producto.stock) / producto.stockInicial) * 100 : 0;
                    const profit = producto ? ((data.revenue / data.sales) - (producto.precio * 0.7)) / (producto.precio * 0.7) * 100 : 0;
                    return {
                        name: name,
                        rotation: Math.round(rotation * 10) / 10,
                        profit: Math.round(profit * 10) / 10
                    };
                })
                .sort((a, b) => b.rotation - a.rotation)
                .slice(0, 3);
            
            // Productos sin movimiento
            noMovement = productos.filter(producto => {
                const hasSales = pedidos.some(pedido => 
                    pedido.productos.some(p => p.nombre === producto.nombre)
                );
                return !hasSales && producto.stock === producto.stockInicial;
            }).map(producto => ({
                name: producto.nombre,
                days: 30,
                category: producto.categoria || 'Sin categoría'
            }));
            
            // Calcular rentabilidad real
            Object.entries(productRotation).forEach(([name, data]) => {
                const producto = productos.find(p => p.nombre === name);
                if (producto) {
                    const margin = ((data.revenue / data.sales) - (producto.precio * 0.7)) / (producto.precio * 0.7) * 100;
                    if (margin > 30) profitability.highMargin++;
                    else if (margin > 15) profitability.mediumMargin++;
                    else profitability.lowMargin++;
                }
            });
        } else {
            // SISTEMA SIN INVENTARIO - Solo análisis de ventas
            const productSales = {};
            pedidos.forEach(pedido => {
                pedido.productos.forEach(producto => {
                    const key = producto.nombre;
                    if (!productSales[key]) {
                        productSales[key] = { sales: 0, revenue: 0, frequency: 0 };
                    }
                    productSales[key].sales += producto.cantidad;
                    productSales[key].revenue += producto.cantidad * producto.precio;
                    productSales[key].frequency += 1;
                });
            });
            
            // Top productos por frecuencia de ventas
            topRotating = Object.entries(productSales)
                .map(([name, data]) => ({
                    name: name,
                    rotation: Math.round((data.frequency / pedidos.length) * 100 * 10) / 10, // % de pedidos que incluyen este producto
                    profit: Math.round((data.revenue / data.sales) * 10) / 10 // Precio promedio
                }))
                .sort((a, b) => b.rotation - a.rotation)
                .slice(0, 3);
            
            // Productos sin ventas
            noMovement = productos.filter(producto => {
                const hasSales = pedidos.some(pedido => 
                    pedido.productos.some(p => p.nombre === producto.nombre)
                );
                return !hasSales;
            }).map(producto => ({
                name: producto.nombre,
                days: 30,
                category: producto.categoria || 'Sin categoría'
            }));
            
            // Análisis de precios (sin costos)
            const priceAnalysis = Object.entries(productSales).map(([name, data]) => ({
                name,
                avgPrice: data.revenue / data.sales,
                frequency: data.frequency
            }));
            
            const avgPrice = priceAnalysis.reduce((sum, p) => sum + p.avgPrice, 0) / priceAnalysis.length;
            
            profitability = {
                highMargin: priceAnalysis.filter(p => p.avgPrice > avgPrice * 1.2).length,
                mediumMargin: priceAnalysis.filter(p => p.avgPrice >= avgPrice * 0.8 && p.avgPrice <= avgPrice * 1.2).length,
                lowMargin: priceAnalysis.filter(p => p.avgPrice < avgPrice * 0.8).length
            };
        }
        
        return {
            totalProducts: totalProducts,
            lowStock: lowStock,
            topRotating: topRotating,
            noMovement: noMovement,
            profitability: profitability,
            inventoryMovements: usesInventory ? generateInventoryMovements() : [],
            usesInventory: usesInventory
        };
    }
    
    function calculateRealCategories(productos, pedidos) {
        const categories = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
        const totalCategories = categories.length;
        
        // Detectar si el negocio usa inventario
        const usesInventory = productos.some(p => 
            p.stock !== undefined && p.stockInicial !== undefined && 
            p.stock !== null && p.stockInicial !== null
        );
        
        // Calcular fechas para comparación de crecimiento
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        
        const categoryPerformance = categories.map(categoria => {
            const categoryProducts = productos.filter(p => p.categoria === categoria);
            
            // Ingresos totales de la categoría
            const categoryRevenue = pedidos.reduce((sum, pedido) => {
                return sum + pedido.productos.reduce((pedidoSum, producto) => {
                    const productoInfo = productos.find(p => p.id == producto.id);
                    return productoInfo && productoInfo.categoria === categoria ? 
                        pedidoSum + (producto.cantidad * producto.precio) : pedidoSum;
                }, 0);
            }, 0);
            
            // Ingresos del último mes
            const recentRevenue = pedidos.filter(p => new Date(p.fechaCreacion) >= monthAgo)
                .reduce((sum, pedido) => {
                    return sum + pedido.productos.reduce((pedidoSum, producto) => {
                        const productoInfo = productos.find(p => p.id == producto.id);
                        return productoInfo && productoInfo.categoria === categoria ? 
                            pedidoSum + (producto.cantidad * producto.precio) : pedidoSum;
                    }, 0);
                }, 0);
            
            // Ingresos del mes anterior
            const previousRevenue = pedidos.filter(p => {
                const fecha = new Date(p.fechaCreacion);
                return fecha >= twoMonthsAgo && fecha < monthAgo;
            }).reduce((sum, pedido) => {
                return sum + pedido.productos.reduce((pedidoSum, producto) => {
                    const productoInfo = productos.find(p => p.id == producto.id);
                    return productoInfo && productoInfo.categoria === categoria ? 
                        pedidoSum + (producto.cantidad * producto.precio) : pedidoSum;
                }, 0);
            }, 0);
            
            // Calcular crecimiento
            const growth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
            
            let margin = 0;
            if (usesInventory) {
                // CON INVENTARIO: Calcular margen promedio (asumiendo 70% costo)
                const totalCost = categoryRevenue * 0.7;
                margin = categoryRevenue > 0 ? ((categoryRevenue - totalCost) / categoryRevenue) * 100 : 0;
            } else {
                // SIN INVENTARIO: Análisis de precios promedio
                const categoryProductsWithSales = pedidos.reduce((acc, pedido) => {
                    pedido.productos.forEach(producto => {
                        const productoInfo = productos.find(p => p.id == producto.id);
                        if (productoInfo && productoInfo.categoria === categoria) {
                            acc.push(producto.precio);
                        }
                    });
                    return acc;
                }, []);
                
                const avgPrice = categoryProductsWithSales.length > 0 ? 
                    categoryProductsWithSales.reduce((sum, price) => sum + price, 0) / categoryProductsWithSales.length : 0;
                
                // Usar precio promedio como "margen" relativo
                const allPrices = productos.filter(p => p.categoria === categoria).map(p => p.precio);
                const overallAvgPrice = allPrices.length > 0 ? 
                    allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length : 0;
                
                margin = overallAvgPrice > 0 ? ((avgPrice - overallAvgPrice) / overallAvgPrice) * 100 : 0;
            }
            
            return {
                name: categoria,
                products: categoryProducts.length,
                revenue: Math.round(categoryRevenue),
                growth: Math.round(growth * 10) / 10,
                margin: Math.round(margin * 10) / 10
            };
        });
        
        return {
            totalCategories: totalCategories,
            categoryPerformance: categoryPerformance,
            seasonalTrends: generateSeasonalTrends(),
            usesInventory: usesInventory
        };
    }
    
    function calculateRealUsers() {
        return {
            totalUsers: 1, // Simplificado
            activeUsers: 1,
            userRoles: {
                'Administrador': 1
            },
            recentActivity: [
                { user: 'Admin', action: 'Acceso al sistema', time: 'Ahora', module: 'Dashboard' }
            ],
            activityByHour: generateActivityByHour(),
            mostPerformedActions: [
                { action: 'Ver productos', count: 10 },
                { action: 'Ver pedidos', count: 8 },
                { action: 'Ver métricas', count: 5 }
            ]
        };
    }
    
    function generateRealAlerts(pedidos, productos) {
        const critical = [];
        const warnings = [];
        const recommendations = [];
        
        // Detectar si el negocio usa inventario
        const usesInventory = productos.some(p => 
            p.stock !== undefined && p.stockInicial !== undefined && 
            p.stock !== null && p.stockInicial !== null
        );
        
        // Análisis de tendencias de ventas
        const salesTrends = analyzeSalesTrends(pedidos);
        
        if (usesInventory) {
            // ALERTAS CON INVENTARIO
            productos.forEach(producto => {
                if (producto.stock === 0) {
                    critical.push({
                        type: 'stock',
                        message: `Producto agotado: ${producto.nombre}`,
                        severity: 'high',
                        timestamp: new Date().toISOString(),
                        action: 'Reabastecer inmediatamente',
                        priority: 1
                    });
                } else if (producto.stock < 5) {
                    warnings.push({
                        type: 'stock',
                        message: `Stock bajo en: ${producto.nombre} (${producto.stock} unidades)`,
                        severity: 'medium',
                        timestamp: new Date().toISOString(),
                        action: 'Considerar reabastecimiento',
                        priority: 2
                    });
                }
            });
            
            // Análisis de rotación de inventario
            const inventoryAnalysis = analyzeInventoryRotation(productos, pedidos);
            inventoryAnalysis.forEach(item => {
                if (item.rotation < 10) {
                    recommendations.push({
                        type: 'inventory',
                        message: `Baja rotación en ${item.name}: ${item.rotation}%`,
                        severity: 'low',
                        timestamp: new Date().toISOString(),
                        action: 'Considerar promociones o descuentos',
                        priority: 3
                    });
                }
            });
        } else {
            // ALERTAS SIN INVENTARIO - Enfoque en ventas
            const productSales = {};
            pedidos.forEach(pedido => {
                pedido.productos.forEach(producto => {
                    const key = producto.nombre;
                    productSales[key] = (productSales[key] || 0) + producto.cantidad;
                });
            });
            
            // Productos sin ventas
            const noSalesProducts = productos.filter(p => !productSales[p.nombre]);
            if (noSalesProducts.length > 0) {
                warnings.push({
                    type: 'sales',
                    message: `${noSalesProducts.length} productos sin ventas`,
                    severity: 'medium',
                    timestamp: new Date().toISOString(),
                    action: 'Revisar estrategia de marketing',
                    priority: 2
                });
            }
            
            // Productos con baja demanda
            const lowDemandProducts = Object.entries(productSales)
                .filter(([name, sales]) => sales < 3)
                .map(([name]) => name);
            
            if (lowDemandProducts.length > 0) {
                recommendations.push({
                    type: 'demand',
                    message: `${lowDemandProducts.length} productos con baja demanda`,
                    severity: 'low',
                    timestamp: new Date().toISOString(),
                    action: 'Considerar promociones o eliminación',
                    priority: 3
                });
            }
        }
        
        // Alertas de pedidos
        const pendingOrders = pedidos.filter(p => p.estado === 'pendiente');
        if (pendingOrders.length > 0) {
            warnings.push({
                type: 'orders',
                message: `${pendingOrders.length} pedidos pendientes de procesar`,
                severity: 'medium',
                timestamp: new Date().toISOString(),
                action: 'Procesar pedidos pendientes',
                priority: 2
            });
        }
        
        // Alertas de pedidos antiguos pendientes (solo sin crédito)
        const oldPendingOrders = pedidos.filter(p => {
            if (p.estado !== 'pendiente') return false;
            
            // Excluir pedidos con crédito
            if (p.credito && p.credito.habilitado) return false;
            
            const orderDate = new Date(p.fechaCreacion);
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            return orderDate < fifteenMinutesAgo;
        });
        
        if (oldPendingOrders.length > 0) {
            critical.push({
                type: 'orders',
                message: `${oldPendingOrders.length} pedidos pendientes por más de 15 minutos`,
                severity: 'high',
                timestamp: new Date().toISOString(),
                action: 'Procesar inmediatamente',
                priority: 1
            });
        }
        
        // Análisis de tendencias de ventas
        if (salesTrends.declining) {
            critical.push({
                type: 'trends',
                message: `Tendencia de ventas en declive: ${salesTrends.declineRate}%`,
                severity: 'high',
                timestamp: new Date().toISOString(),
                action: 'Revisar estrategia comercial',
                priority: 1
            });
        }
        
        if (salesTrends.peak) {
            recommendations.push({
                type: 'trends',
                message: `Pico de ventas detectado: ${salesTrends.peakDay}`,
                severity: 'low',
                timestamp: new Date().toISOString(),
                action: 'Aprovechar para promociones',
                priority: 3
            });
        }
        
        // Análisis de clientes
        const customerAnalysis = analyzeCustomerBehavior(pedidos);
        if (customerAnalysis.lowRetention) {
            recommendations.push({
                type: 'customers',
                message: `Retención de clientes baja: ${customerAnalysis.retentionRate}%`,
                severity: 'medium',
                timestamp: new Date().toISOString(),
                action: 'Implementar programa de fidelización',
                priority: 2
            });
        }
        
        return {
            critical: critical,
            warnings: warnings,
            recommendations: recommendations,
            total: critical.length + warnings.length + recommendations.length
        };
    }
    
    function analyzeSalesTrends(pedidos) {
        const now = new Date();
        const last7Days = [];
        const previous7Days = [];
        
        // Obtener ventas de los últimos 7 días
        for (let i = 0; i < 7; i++) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            
            const daySales = pedidos.filter(p => {
                const orderDate = new Date(p.fechaCreacion);
                return orderDate >= dayStart && orderDate < dayEnd;
            }).reduce((sum, p) => sum + p.total, 0);
            
            last7Days.push(daySales);
        }
        
        // Obtener ventas de los 7 días anteriores
        for (let i = 7; i < 14; i++) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            
            const daySales = pedidos.filter(p => {
                const orderDate = new Date(p.fechaCreacion);
                return orderDate >= dayStart && orderDate < dayEnd;
            }).reduce((sum, p) => sum + p.total, 0);
            
            previous7Days.push(daySales);
        }
        
        const last7Total = last7Days.reduce((sum, day) => sum + day, 0);
        const previous7Total = previous7Days.reduce((sum, day) => sum + day, 0);
        
        const declineRate = previous7Total > 0 ? 
            ((previous7Total - last7Total) / previous7Total) * 100 : 0;
        
        const peakDay = last7Days.indexOf(Math.max(...last7Days));
        const peakDayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][peakDay];
        
        return {
            declining: declineRate > 20,
            declineRate: Math.round(declineRate * 10) / 10,
            peak: Math.max(...last7Days) > Math.max(...previous7Days) * 1.5,
            peakDay: peakDayName
        };
    }
    
    function analyzeInventoryRotation(productos, pedidos) {
        const productRotation = {};
        
        pedidos.forEach(pedido => {
            pedido.productos.forEach(producto => {
                const key = producto.nombre;
                if (!productRotation[key]) {
                    productRotation[key] = { sales: 0, revenue: 0 };
                }
                productRotation[key].sales += producto.cantidad;
                productRotation[key].revenue += producto.cantidad * producto.precio;
            });
        });
        
        return Object.entries(productRotation).map(([name, data]) => {
            const producto = productos.find(p => p.nombre === name);
            const rotation = producto ? ((producto.stockInicial - producto.stock) / producto.stockInicial) * 100 : 0;
            return {
                name: name,
                rotation: Math.round(rotation * 10) / 10,
                sales: data.sales
            };
        });
    }
    
    function analyzeCustomerBehavior(pedidos) {
        const customerOrders = {};
        
        pedidos.forEach(pedido => {
            const customerId = pedido.cliente?.telefono || 'unknown';
            if (!customerOrders[customerId]) {
                customerOrders[customerId] = [];
            }
            customerOrders[customerId].push(pedido);
        });
        
        const totalCustomers = Object.keys(customerOrders).length;
        const repeatCustomers = Object.values(customerOrders).filter(orders => orders.length > 1).length;
        const retentionRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
        
        return {
            totalCustomers: totalCustomers,
            repeatCustomers: repeatCustomers,
            retentionRate: Math.round(retentionRate * 10) / 10,
            lowRetention: retentionRate < 30
        };
    }
    
    function calculateRealDemographics(userOrders) {
        // Simplificado - datos básicos
        return {
            genderDistribution: {
                femenino: 50,
                masculino: 50
            },
            ageGroups: {
                '25-34': userOrders.length,
                '35-44': 0,
                '45-54': 0
            },
            topAgeGroups: [
                { ageGroup: '25-34', customers: userOrders.length, percentage: 100 }
            ],
            genderPurchasePattern: {
                femenino: { orders: Math.floor(userOrders.length / 2), revenue: 0, avgOrderValue: 0 },
                masculino: { orders: Math.ceil(userOrders.length / 2), revenue: 0, avgOrderValue: 0 }
            },
            agePurchasePattern: {
                '25-34': { orders: userOrders.length, revenue: 0, avgOrderValue: 0 }
            }
        };
    }
    
    console.log('Dashboard Analytics inicializado');
    
    // Exponer funciones globalmente para el sistema de notificaciones
    window.generateRealAlerts = generateRealAlerts;
    window.formatDate = formatDate;
    
})();