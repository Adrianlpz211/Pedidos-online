# 🛒 Sistema de Pedidos Híbrido

Un sistema completo de pedidos online híbrido para negocios físicos, desarrollado con tecnologías web modernas y PWA.

## ✨ Características Principales

### 🏪 **Frontend (Tienda Online)**
- **PWA Completa**: Instalable en dispositivos móviles
- **Diseño Responsive**: Optimizado para móviles y desktop
- **Catálogo Dinámico**: Productos cargados desde dashboard
- **Sistema de Carrito**: Gestión completa de compras
- **Sistema de Cuotas**: Financiamiento a crédito
- **Búsqueda Inteligente**: Filtros por categorías y subcategorías
- **Sistema de Likes**: Interacción tipo TikTok
- **Quick View**: Vista rápida de productos
- **Integración WhatsApp**: Contacto directo

### 🎛️ **Dashboard Administrativo**
- **Gestión de Productos**: CRUD completo
- **Gestión de Categorías**: Organización jerárquica
- **Sistema de Pedidos**: Seguimiento completo
- **Métricas y Analytics**: Estadísticas en tiempo real
- **Configuración Dinámica**: Personalización en vivo
- **Sistema de Usuarios**: Gestión de accesos
- **Gestión de Inventario**: Control de stock
- **Sistema de Devoluciones**: Procesos de devolución

### 🔧 **Características Técnicas**
- **Comunicación en Tiempo Real**: Dashboard ↔ Frontend
- **Configuración Dinámica**: Cambios sin reiniciar
- **Sistema de Notificaciones**: Alertas inteligentes
- **Base de Datos Conceptual**: MER bien estructurado
- **Arquitectura Modular**: Código organizado y mantenible

## 🚀 **Tecnologías Utilizadas**

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **PWA**: Service Worker, Manifest, Offline Support
- **UI/UX**: CSS Grid, Flexbox, Animaciones CSS
- **Comunicación**: PostMessage API, LocalStorage
- **Iconos**: Font Awesome 6.4.0
- **Gráficos**: Chart.js
- **Arquitectura**: Modular, Event-driven

## 📁 **Estructura del Proyecto**

```
pedidos/
├── 📄 index.html              # Frontend principal
├── 📄 dashboard.html          # Panel administrativo
├── 📄 manifest.json           # Configuración PWA
├── 📄 sw.js                   # Service Worker
├── 📁 css/                    # Estilos CSS
│   ├── index.css             # Estilos principales
│   ├── dashboard.css         # Estilos del dashboard
│   ├── productos.css         # Estilos de productos
│   └── ...                   # Otros módulos
├── 📁 js/                     # JavaScript modular
│   ├── index.js              # Lógica principal
│   ├── dashboard.js          # Dashboard principal
│   ├── productos.js          # Gestión de productos
│   ├── carrito.js            # Sistema de carrito
│   ├── pedidos.js            # Gestión de pedidos
│   └── ...                   # Otros módulos
├── 📁 img/                    # Recursos multimedia
│   ├── icons/                # Iconos PWA
│   └── productos/            # Imágenes de productos
└── 📄 database_diagram.md     # Diagrama de base de datos
```

## 🛠️ **Instalación y Configuración**

### **Requisitos**
- Servidor web local (XAMPP, WAMP, etc.)
- Navegador moderno con soporte PWA
- Git (para control de versiones)

### **Configuración Inicial**
1. **Clonar repositorio**:
   ```bash
   git clone https://github.com/Adrianlpz211/Pedidos-online.git
   cd Pedidos-online
   ```

2. **Configurar servidor local**:
   - Copiar carpeta a `htdocs` (XAMPP)
   - Acceder a `http://localhost/pedidos/`

3. **Configurar dashboard**:
   - Acceder a `http://localhost/pedidos/dashboard.html`
   - Usuario: `admin`
   - Contraseña: `admin123`

## 🎯 **Uso del Sistema**

### **Para Clientes (Frontend)**
1. **Navegar productos**: Usar filtros de categorías
2. **Agregar al carrito**: Botón "Pedir" en productos
3. **Ver carrito**: Icono de carrito en header
4. **Realizar pedido**: Proceso de checkout completo
5. **Contactar**: Botones de WhatsApp integrados

### **Para Administradores (Dashboard)**
1. **Gestionar productos**: Agregar, editar, eliminar
2. **Configurar categorías**: Organizar catálogo
3. **Ver pedidos**: Seguimiento en tiempo real
4. **Personalizar**: Logo, colores, visibilidad
5. **Analizar métricas**: Estadísticas de uso

## 🔧 **Configuración Avanzada**

### **Personalización de Colores**
- Ir a Dashboard → Configuración
- Modificar paleta de colores
- Cambios se aplican en tiempo real

### **Gestión de Visibilidad**
- Mostrar/ocultar carrito
- Mostrar/ocultar módulos
- Configuración de menú inferior

### **Sistema de Cuotas**
- Habilitar crédito por producto
- Configurar número de cuotas
- Gestión de pagos

## 📊 **Roadmap de Mejoras**

Ver [ROADMAP_MEJORAS.md](ROADMAP_MEJORAS.md) para el plan detallado de mejoras.

### **Próximas Características**
- [ ] Optimización de rendimiento
- [ ] Mejoras de UX/UI
- [ ] Sistema de notificaciones push
- [ ] Integración con APIs de pago
- [ ] Sistema de cupones y descuentos

## 🤝 **Contribución**

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 **Desarrollador**

**AdrianLpz** - [GitHub](https://github.com/Adrianlpz211)

## 📞 **Soporte**

Para soporte técnico o consultas:
- 📧 Email: adrianlpz211@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/Adrianlpz211/Pedidos-online/issues)

---

## 🎉 **¡Gracias por usar el Sistema de Pedidos Híbrido!**

Si te gusta este proyecto, ¡dale una ⭐ en GitHub!

---

*Última actualización: $(date)*
*Versión: 1.0.0*
