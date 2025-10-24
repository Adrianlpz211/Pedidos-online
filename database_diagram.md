# 🗄️ Diagrama del MER - Sistema de Catálogo Multi-Negocio

## 📊 Diagrama de Entidad-Relación

```mermaid
erDiagram
    USUARIOS {
        int id PK
        varchar nombre
        varchar apellido
        varchar telefono UK
        varchar ciudad
        text direccion
        varchar email UK
        varchar password
        enum tipo_usuario
        enum estado
        varchar foto_perfil
        varchar google_id UK
        timestamp ultimo_acceso
        timestamp created_at
        timestamp updated_at
    }

    NEGOCIOS {
        int id PK
        varchar nombre
        varchar slogan
        varchar telefono
        varchar whatsapp
        varchar email
        text direccion
        enum logo_tipo
        varchar logo_texto
        varchar logo_imagen
        varchar color_primario
        varchar color_secundario
        varchar color_acento
        json configuracion
        enum estado
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTOS {
        int id PK
        int negocio_id FK
        varchar nombre
        text descripcion
        decimal precio_regular
        decimal precio_oferta
        int stock
        int stock_minimo
        varchar imagen_principal
        json imagenes_adicionales
        boolean destacado
        enum estado
        decimal peso
        varchar dimensiones
        varchar sku UK
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIAS {
        int id PK
        varchar nombre
        text descripcion
        varchar imagen
        varchar icono
        varchar color
        int orden
        enum estado
        timestamp created_at
        timestamp updated_at
    }

    SUBCATEGORIAS {
        int id PK
        varchar nombre
        text descripcion
        int categoria_id FK
        int orden
        enum estado
        timestamp created_at
        timestamp updated_at
    }

    PEDIDOS {
        int id PK
        int usuario_id FK
        int negocio_id FK
        varchar numero_pedido UK
        decimal total
        decimal subtotal
        decimal impuestos
        decimal descuento
        enum estado
        enum metodo_pago
        text direccion_entrega
        varchar telefono_contacto
        text notas
        timestamp fecha_pedido
        timestamp fecha_entrega
        timestamp created_at
        timestamp updated_at
    }

    DETALLE_PEDIDOS {
        int id PK
        int pedido_id FK
        int producto_id FK
        int cantidad
        decimal precio_unitario
        decimal subtotal
        timestamp created_at
    }

    FAVORITOS {
        int id PK
        int usuario_id FK
        int producto_id FK
        timestamp created_at
    }

    METRICAS {
        int id PK
        enum tipo_metrica
        enum entidad_tipo
        int entidad_id
        int usuario_id FK
        int negocio_id FK
        decimal valor
        json metadata
        varchar ip_address
        text user_agent
        timestamp created_at
    }

    PROMOCIONES {
        int id PK
        int negocio_id FK
        varchar titulo
        text descripcion
        varchar imagen
        varchar enlace
        boolean boton_pedir_activo
        boolean boton_whatsapp_activo
        varchar texto_boton_pedir
        varchar texto_boton_whatsapp
        int orden
        enum estado
        timestamp fecha_inicio
        timestamp fecha_fin
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTO_CATEGORIAS {
        int producto_id FK
        int categoria_id FK
        timestamp created_at
    }

    PRODUCTO_SUBCATEGORIAS {
        int producto_id FK
        int subcategoria_id FK
        timestamp created_at
    }

    CATEGORIA_SUBCATEGORIAS {
        int categoria_id FK
        int subcategoria_id FK
        timestamp created_at
    }

    %% Relaciones Principales
    USUARIOS ||--o{ PEDIDOS : "realiza"
    NEGOCIOS ||--o{ PRODUCTOS : "posee"
    NEGOCIOS ||--o{ PROMOCIONES : "tiene"
    PEDIDOS ||--o{ DETALLE_PEDIDOS : "contiene"
    PRODUCTOS ||--o{ DETALLE_PEDIDOS : "incluido_en"
    CATEGORIAS ||--o{ SUBCATEGORIAS : "contiene"

    %% Relaciones Many-to-Many
    USUARIOS ||--o{ FAVORITOS : "tiene"
    PRODUCTOS ||--o{ FAVORITOS : "favorito_de"
    PRODUCTOS ||--o{ PRODUCTO_CATEGORIAS : "pertenece_a"
    CATEGORIAS ||--o{ PRODUCTO_CATEGORIAS : "incluye"
    PRODUCTOS ||--o{ PRODUCTO_SUBCATEGORIAS : "categorizado_en"
    SUBCATEGORIAS ||--o{ PRODUCTO_SUBCATEGORIAS : "incluye"
    CATEGORIAS ||--o{ CATEGORIA_SUBCATEGORIAS : "relacionada_con"
    SUBCATEGORIAS ||--o{ CATEGORIA_SUBCATEGORIAS : "relacionada_con"

    %% Relaciones de Métricas
    USUARIOS ||--o{ METRICAS : "genera"
    NEGOCIOS ||--o{ METRICAS : "registra"
    PRODUCTOS ||--o{ METRICAS : "mide"
    CATEGORIAS ||--o{ METRICAS : "analiza"
```

## 🔗 **Descripción de Relaciones**

### **Relaciones 1:N (Uno a Muchos)**
- **USUARIOS → PEDIDOS**: Un usuario puede tener múltiples pedidos
- **NEGOCIOS → PRODUCTOS**: Un negocio puede tener múltiples productos
- **NEGOCIOS → PROMOCIONES**: Un negocio puede tener múltiples promociones
- **PEDIDOS → DETALLE_PEDIDOS**: Un pedido puede tener múltiples detalles
- **PRODUCTOS → DETALLE_PEDIDOS**: Un producto puede estar en múltiples detalles
- **CATEGORIAS → SUBCATEGORIAS**: Una categoría puede tener múltiples subcategorías

### **Relaciones N:M (Muchos a Muchos)**
- **USUARIOS ↔ PRODUCTOS** (FAVORITOS): Un usuario puede tener múltiples favoritos, un producto puede ser favorito de múltiples usuarios
- **PRODUCTOS ↔ CATEGORIAS**: Un producto puede pertenecer a múltiples categorías, una categoría puede tener múltiples productos
- **PRODUCTOS ↔ SUBCATEGORIAS**: Un producto puede estar en múltiples subcategorías, una subcategoría puede tener múltiples productos
- **CATEGORIAS ↔ SUBCATEGORIAS**: Una categoría puede estar relacionada con múltiples subcategorías, una subcategoría puede estar relacionada con múltiples categorías

### **Relaciones de Métricas**
- **USUARIOS → METRICAS**: Un usuario puede generar múltiples métricas
- **NEGOCIOS → METRICAS**: Un negocio puede registrar múltiples métricas
- **PRODUCTOS → METRICAS**: Un producto puede tener múltiples métricas
- **CATEGORIAS → METRICAS**: Una categoría puede tener múltiples métricas

## 📊 **Cardinalidades**

| Entidad A | Relación | Entidad B | Cardinalidad |
|-----------|----------|-----------|--------------|
| USUARIOS | realiza | PEDIDOS | 1:N |
| NEGOCIOS | posee | PRODUCTOS | 1:N |
| NEGOCIOS | tiene | PROMOCIONES | 1:N |
| PEDIDOS | contiene | DETALLE_PEDIDOS | 1:N |
| PRODUCTOS | incluido_en | DETALLE_PEDIDOS | 1:N |
| CATEGORIAS | contiene | SUBCATEGORIAS | 1:N |
| USUARIOS | tiene | FAVORITOS | 1:N |
| PRODUCTOS | favorito_de | FAVORITOS | 1:N |
| PRODUCTOS | pertenece_a | CATEGORIAS | N:M |
| PRODUCTOS | categorizado_en | SUBCATEGORIAS | N:M |
| CATEGORIAS | relacionada_con | SUBCATEGORIAS | N:M |

## 🎯 **Flujo de Datos Principal**

```
USUARIO → PEDIDO → DETALLE_PEDIDOS → PRODUCTOS
    ↓
FAVORITOS → PRODUCTOS
    ↓
METRICAS (registra interacciones)
```

## 🏪 **Flujo Multi-Negocio**

```
NEGOCIO → PRODUCTOS → CATEGORIAS/SUBCATEGORIAS
    ↓
PROMOCIONES (hero slider)
    ↓
PEDIDOS (de usuarios)
```

---

*Diagrama creado para el Sistema de Catálogo Multi-Negocio MVP*
*Versión: 1.0 | Fecha: $(date)*
