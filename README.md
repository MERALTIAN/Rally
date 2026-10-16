# Catálogo de árboles – Biomasa urbana

Landing en HTML, CSS y JavaScript con Firebase (Firestore). Muestra árboles con foto, descripción, usos de reutilización y categorías (frutal, floral, medicinal, sombra, forraje). Los usuarios pueden añadir árboles nuevos.

## Archivos
- `index.html`: estructura de la página
- `styles.css`: estilos
- `app.js`: catálogo, filtros, formulario y conexión a Firebase

## Probarlo ya (modo demo)
1. Abre la carpeta en VS Code.
2. Instala la extensión **Live Server** y haz clic derecho en `index.html` > *Open with Live Server*.
   (No funciona con doble clic porque usa módulos de JS.)
3. Mientras `app.js` tenga `TU_API_KEY`, los árboles que agregues se guardan solo en tu navegador.

## Conectar Firebase
1. Entra a https://console.firebase.google.com y crea un proyecto.
2. Agrega una app web (`</>`) y copia el `firebaseConfig` en `app.js`.
3. En **Build > Firestore Database** crea la base de datos.
4. En la pestaña **Reglas** pega esto y publica:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /arboles/{id} {
      allow read: if true;
      allow create: if request.resource.data.nombre is string
        && request.resource.data.nombre.size() <= 60
        && request.resource.data.descripcion.size() <= 300
        && request.resource.data.usos.size() <= 400;
      allow update, delete: if false;
    }

    match /usos_arboles/{usoId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(["arbolId", "parte", "descripcion", "creado"])
        && request.resource.data.keys().hasOnly(["arbolId", "parte", "descripcion", "creado"])
        && request.resource.data.arbolId is string
        && request.resource.data.arbolId.size() <= 100
        && request.resource.data.parte in ["Hojas", "Tronco", "Ramas", "Flores", "Frutos", "Semillas", "Raíces", "Otra parte"]
        && request.resource.data.descripcion is string
        && request.resource.data.descripcion.size() > 0
        && request.resource.data.descripcion.size() <= 250
        && request.resource.data.creado == request.time;
      allow update, delete: if false;
    }
  }
}
```

Con estas reglas cualquiera puede leer y agregar árboles y usos, pero nadie puede modificar ni borrar desde la web. Los usos se guardan en `usos_arboles` asociados al ID de la tarjeta. Publica estas reglas en Firebase para activar el botón **Aportar otro uso**. Para borrar o corregir un aporte, hazlo desde la consola de Firebase.

## Estructura de la base de datos
Colección `arboles`, un documento por árbol:

| Campo | Tipo | Ejemplo |
|---|---|---|
| nombre | texto | "Guanábana" |
| cientifico | texto | "Annona muricata" |
| categorias | lista | ["frutal", "medicinal", "desechos"] |
| descripcion | texto | "Árbol pequeño..." |
| usos | texto | "Hojas al compost..." |
| tiposUso | lista | ["desechos", "medicinal"] |
| usoDesechos | texto | "Hojas para compost..." |
| usoMedicinal | texto | "Uso tradicional de las hojas..." |
| usosPartes | lista de objetos | [{"parte":"Hojas","descripcion":"Se convierten en abono"}] |
| foto | texto (imagen comprimida) | "data:image/jpeg;base64,..." |
| autor | texto | "María" |
| creado | fecha | (automática) |

Los nuevos usos aportados desde el detalle se guardan como documentos separados en `usos_arboles`, con los campos `arbolId`, `parte`, `descripcion` y `creado`.

## Sobre las fotos
Las fotos se redimensionan a 800 px y se guardan como texto dentro del documento, por lo que no hace falta Firebase Storage (que puede requerir el plan de pago Blaze). Si más adelante quieren muchas fotos o de mayor calidad, conviene pasar a Storage o a un servicio como Cloudinary.

La cámara en vivo requiere permiso del navegador y un contexto seguro (HTTPS o `localhost`). La primera clasificación descarga TensorFlow.js y MobileNet; el análisis se realiza en el dispositivo y no envía la imagen al servicio del modelo. La detección busca árboles, plantas, hojas, flores, frutos, ramas, semillas y otros elementos vegetales. Es orientativa: si no reconoce una imagen con claridad, la persona puede confirmar el envío manualmente.

## Publicar
Con Firebase Hosting: `npm install -g firebase-tools`, `firebase login`, `firebase init hosting` y `firebase deploy`.

## Ideas para mejorar
- Moderación: añadir un campo `aprobado` y mostrar solo los aprobados.
- Login con Firebase Authentication para que cada persona gestione sus aportes.
- Mapa (Leaflet) con la ubicación de árboles y puntos de acopio de poda.
- Los usos medicinales son tradicionales y solo informativos.
