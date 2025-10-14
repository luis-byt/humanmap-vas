# 🩺 HumanMap VAS

**Librería web interactiva para visualización anatómica y selección de zonas VAS+**

---

## 🚀 Descripción general

**HumanMap VAS** es un *Web Component* reutilizable, moderno y autónomo (`<human-map-vas>`)
que permite visualizar zonas anatómicas del cuerpo humano (Cabeza, Cuello y Tórax por ahora)
y seleccionar o mostrar interactivamente zonas codificadas según el estándar **VAS+**.

Diseñado para integrarse fácilmente en entornos médicos o de evaluación física,
ya sea dentro de proyectos **HTML**, **Django**, **VueJS** u otras plataformas web.

---

## 🧠 Características principales

✅ **Componente 100% autónomo** — No requiere frameworks ni dependencias externas.

✅ **Interactividad total** — Selección de zonas por clic, hover y resaltado dinámico.

✅ **Modo solo lectura** (`read-only="true"`) — Permite mostrar sin permitir interacción.

✅ **Vista global (“all”)** — Muestra todas las vistas anatómicas simultáneamente.

✅ **Cargar zonas desde backend** (`sync-url`) — Trae datos de zonas seleccionadas vía GET.

✅ **Exportar/Importar zonas** — Permite guardar y cargar archivos `.json` de selección.

✅ **Impresión y zoom modal** — Visualiza o imprime las vistas actuales o globales.

✅ **Toolbar inteligente** — Navegación, reinicio, selección de vistas y menú contextual.

✅ **Integrable en Django, Vue o HTML** sin modificaciones.

---

## 📦 Estructura de carpetas recomendada

```
humanmap-vas/
├── src/
│   └── img/
│       ├── head_right.svg
│       ├── head_left.svg
│       ├── neck_right.svg
│       ├── neck_left.svg
│       ├── torax_front.svg
│       ├── torax_back.svg
├── humanmap-vas-standalone.js
└── index.html  (demo o test local)
```

---

## 🧩 Uso básico en HTML

Solo necesitas importar el archivo principal y colocar el componente:

```html
<script src="humanmap-vas-standalone.js"></script>

<human-map-vas
  id="map"
  view="head_right"
  img-root="src/img/"
  sync-url="/api/vas/12/zones/"
></human-map-vas>

<script>
  const map = document.querySelector('#map');

  // Escuchar zonas seleccionadas
  map.addEventListener('human-map-vas:select', e => {
    console.log("Zonas seleccionadas:", e.detail.selected);
  });
</script>
```

---

## ⚙️ Atributos disponibles

| Atributo    | Tipo         | Descripción                                                                      |
| ----------- | ------------ | -------------------------------------------------------------------------------- |
| `view`      | `string`     | Define la vista inicial (`head_right`, `neck_left`, `thorax_front`, `all`, etc.) |
| `img-root`  | `string`     | Ruta base donde se encuentran las imágenes SVG                                   |
| `read-only` | `true/false` | Si está en `true`, el usuario no puede seleccionar zonas                         |
| `sync-url`  | `string`     | URL del backend que devuelve zonas seleccionadas (GET)                           |
| `columns`   | `number`     | (solo vista `all`) Define la cantidad de columnas visibles en modo global        |

---

## 🗂️ Métodos públicos (JS API)

| Método                               | Descripción                                            |
| ------------------------------------ | ------------------------------------------------------ |
| `map.getSelected()`                  | Devuelve un array de objetos `{id, code, label, view}` |
| `map.clear()`                        | Limpia la selección actual                             |
| `map.setAttribute('view', 'all')`    | Cambia dinámicamente la vista actual                   |
| `map.selectedZones = [...]`          | Asigna zonas seleccionadas manualmente                 |
| `map.selectedIds = [...]`            | Asigna directamente por ID                             |
| `map.syncUrl = '/api/vas/12/zones/'` | Cambia la URL del backend y recarga zonas              |
| `map.printCanvasOnly()`              | Imprime el área visible (vista actual o global)        |
| `map.openZoomModal()`                | Abre una vista ampliada modal de las gráficas          |

---

## 🔄 Carga automática desde backend

Si defines el atributo `sync-url`, el componente realizará un `GET` automático y marcará las zonas devueltas.
Ejemplo de respuesta esperada del backend:

```json
{
  "status": "ok",
  "zones": [
    { "id": "head_right-r1c3", "code": "1.1.1.1", "label": "1.1.1.1", "view": "head_right" },
    { "id": "thorax_back-r2c2", "code": "3.1.2.2.1", "label": "3.1.2.2.1", "view": "thorax_back" }
  ]
}
```

### Vista Django (ejemplo)

```python
from django.http import JsonResponse

def get_vas_zones(request, exam_id):
    zones = [
        {"id": "head_right-r1c3", "code": "1.1.1.1", "label": "1.1.1.1", "view": "head_right"},
        {"id": "thorax_back-r2c2", "code": "3.1.2.2.1", "label": "3.1.2.2.1", "view": "thorax_back"},
    ]
    return JsonResponse({"status": "ok", "zones": zones})
```

---

## 🧱 Integración con Django

1. Copia la carpeta `humanmap-vas` dentro de tu `static/`
2. En tu template Django:

```html
{% load static %}
<script src="{% static 'humanmap-vas/humanmap-vas-standalone.js' %}"></script>

<human-map-vas
  id="map"
  view="all"
  read-only="true"
  img-root="{% static 'humanmap-vas/src/img/' %}"
  sync-url="{% url 'get_vas_zones' exam.id %}"
></human-map-vas>

<script>
  const map = document.querySelector('#map');
  map.addEventListener('human-map-vas:select', e => {
    document.getElementById('id_vas_zones').value = JSON.stringify(e.detail.selected);
  });
</script>
```

---

## 🧩 Integración con VueJS

1. Instala la librería como dependencia (o impórtala desde tu carpeta local):

   ```bash
   npm install humanmap-vas
   ```

   o

   ```js
   import '/path/to/humanmap-vas-standalone.js';
   ```

2. Usa el componente dentro de tu template Vue:

```vue
<template>
  <div>
    <human-map-vas
      ref="map"
      view="head_right"
      img-root="/static/humanmap-vas/src/img/"
      sync-url="/api/vas/1/zones/"
    ></human-map-vas>
  </div>
</template>

<script>
export default {
  mounted() {
    const map = this.$refs.map;
    map.addEventListener('human-map-vas:select', e => {
      console.log('Zonas seleccionadas:', e.detail.selected);
    });
  }
};
</script>
```

---

## 💾 Exportar / Importar zonas

Desde el menú de tres puntos verticales (⋮) puedes:

* **Exportar** → descarga un archivo `.json` con las zonas seleccionadas.
* **Importar** → carga un `.json` guardado y aplica automáticamente la selección.

Ejemplo del contenido exportado:

```json
[
  {"id":"head_right-r2c3","code":"1.1.1.2","view":"head_right"},
  {"id":"neck_left-r1c2","code":"2.2.2.1","view":"neck_left"}
]
```

---

## 🧭 Modos de vista

| Vista                          | Descripción                              |
| ------------------------------ | ---------------------------------------- |
| `head_right` / `head_left`     | Cabeza lateral derecha / izquierda       |
| `neck_right` / `neck_left`     | Cuello lateral derecho / izquierdo       |
| `thorax_front` / `thorax_back` | Tórax anterior y posterior               |
| `all`                          | Muestra todas las vistas simultáneamente |

---

## 🎨 Personalización

Puedes modificar el estilo del contenedor directamente desde CSS externo:

```css
human-map-vas {
  --hm-height: 720px;
}
```

O integrarlo dentro de un layout responsive con `width: 100%; height: auto;`.

---

## 🖨️ Funcionalidades especiales

* **🖨️ Imprimir solo el área de las gráficas**
  Usa `map.printCanvasOnly()` para abrir el área actual lista para impresión (modo PDF).

* **🔍 Zoom modal (solo lectura)**
  En modo `read-only="true"`, el botón inferior derecho abre una vista ampliada interactiva con zoom por rueda.

* **🌀 Loader de carga**
  Cuando hay conexión al backend (`sync-url`), muestra un spinner y el texto *“Cargando zonas…”*.

---

## ⚙️ Licencia

MIT © 2025 — Desarrollado por [tu nombre o compañía]
