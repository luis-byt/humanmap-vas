# 🧠 HumanMap VAS — Anatomical Interactive Mapper

**HumanMap VAS** es una librería web que permite graficar el cuerpo humano con vistas anatómicas interactivas para identificar zonas según el sistema VAS.
Desarrollada como *Web Component standalone*, puede integrarse fácilmente en proyectos **HTML**, **Django**, o **Vue.js**.

---

## 📂 Estructura del proyecto

humanmap-vas/
├── src/
│ ├── img/
│ │ ├── head_right.svg
│ │ ├── head_left.svg
│ │ ├── neck_right.svg
│ │ ├── neck_left.svg
│ │ ├── torax_front.svg
│ │ └── torax_back.svg
│
├── humanmap-vas-standalone.js
└── index.html ← demo (opcional)


---

## 🚀 Uso rápido (en HTML)

Copia los archivos o enlázalos desde GitHub Pages:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>HumanMap VAS Demo</title>
  <script src="https://luis-byt.github.io/humanmap-vas/humanmap-vas-standalone.js"></script>
</head>
<body>
  <h1>Demo de HumanMap VAS</h1>
  <human-map-vas></human-map-vas>

  <script>
    document.querySelector('human-map-vas').addEventListener('human-map-vas:select', e => {
      console.log('Zonas seleccionadas:', e.detail.selected);
    });
  </script>
</body>
</html>
```
---

# 🧩 Integración en Django

## Copia la carpeta humanmap-vas/ dentro de tu directorio static/

myproject/
└── static/
    └── humanmap-vas/
        ├── humanmap-vas-standalone.js
        ├── src/img/...

## En tu template Django:

```
{% load static %}
<script src="{% static 'humanmap-vas/humanmap-vas-standalone.js' %}"></script>

<human-map-vas></human-map-vas>

<script>
  document.querySelector('human-map-vas').addEventListener('human-map-vas:select', e => {
    console.log(e.detail.selected);
  });
</script>
```

## Verifica que los archivos estáticos estén habilitados:
```
python manage.py collectstatic
```
---

# ⚛️ Integración en Vue.js

## Copia humanmap-vas-standalone.js dentro de public/ (o instala desde NPM

```
npm install humanmap-vas
```

## En tu componente Vue:

```
<template>
  <div>
    <human-map-vas @human-map-vas:select="onSelect"></human-map-vas>
  </div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = '/humanmap-vas-standalone.js';
    document.head.appendChild(script);
  },
  methods: {
    onSelect(e) {
      console.log('Zonas seleccionadas:', e.detail.selected);
    }
  }
}
</script>
```

---

## Ahora puedes disfrutar e interactar con una [demo](https://luis-byt.github.io/humanmap-vas/) de la herramienta.
