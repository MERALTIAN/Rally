# Catálogo de árboles – Biomasa urbana

Aplicación en HTML, CSS y JavaScript con Firebase (Firestore). Muestra un catálogo de árboles y permite publicar actividades de tala programada en un mapa para coordinar el aprovechamiento de la biomasa.

## Archivos
- `index.html`: estructura de la página
- `styles.css`: estilos
- `app.js`: catálogo, filtros, formulario y conexión a Firebase
- `imagenes/rootloop-logo.svg`: logo vectorial del sitio

## Probarlo ya (modo demo)
1. Abre la carpeta en VS Code.
2. Instala la extensión **Live Server** y haz clic derecho en `index.html` > *Open with Live Server*.
   (No funciona con doble clic porque usa módulos de JS.)
3. Mientras `app.js` tenga `TU_API_KEY`, los árboles que agregues se guardan solo en tu navegador.
4. Para previsualizar publicaciones y reclamos sin tocar Firebase, abre la página local con `?modo=demo`. Este modo solo está disponible en `localhost` y guarda sus datos en ese navegador.

## Conectar Firebase
1. Entra a https://console.firebase.google.com y crea un proyecto.
2. Agrega una app web (`</>`) y copia el `firebaseConfig` en `app.js`.
3. En **Build > Authentication > Sign-in method**, habilita el proveedor **Anónimo**. La app usa una cuenta invitada para distinguir a quien publica de quien reclama.
4. En **Build > Firestore Database** crea la base de datos.
5. En la pestaña **Reglas** pega esto y publica:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /arboles/{id} {
      allow read: if true;
      allow create: if request.resource.data.nombre is string
          && request.resource.data.keys().hasAll(["nombre", "cientifico", "categorias", "altura", "alturaMetros", "descripcion", "usos", "tiposUso", "usoMedicinal", "usosPartes", "foto", "autor", "creado"])
          && request.resource.data.keys().hasOnly(["nombre", "cientifico", "categorias", "altura", "alturaMetros", "descripcion", "usos", "tiposUso", "usoMedicinal", "usosPartes", "foto", "autor", "creado"])
          && request.resource.data.nombre is string
          && request.resource.data.nombre.size() <= 60
          && request.resource.data.descripcion.size() <= 300
          && request.resource.data.usos.size() <= 400
          && request.resource.data.categorias is list
          && request.resource.data.categorias.size() > 0
          && request.resource.data.categorias.size() <= 5
          && request.resource.data.categorias.toSet().difference(["frutal", "floral", "medicinal", "sombra", "forraje"].toSet()).size() == 0
          && request.resource.data.altura in ["pequeno", "mediano", "alto"]
          && request.resource.data.alturaMetros is number
          && request.resource.data.alturaMetros > 0
          && request.resource.data.alturaMetros <= 200
          && ((request.resource.data.alturaMetros <= 5 && request.resource.data.altura == "pequeno")
            || (request.resource.data.alturaMetros > 5 && request.resource.data.alturaMetros <= 15 && request.resource.data.altura == "mediano")
            || (request.resource.data.alturaMetros > 15 && request.resource.data.altura == "alto"))
          && request.resource.data.tiposUso is list
          && request.resource.data.tiposUso.toSet().difference(["medicinal"].toSet()).size() == 0
          && request.resource.data.usoMedicinal is string
          && request.resource.data.usoMedicinal.size() <= 300
          && request.resource.data.creado == request.time;
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

    match /actividades_tala/{actividadId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.creadorId == request.auth.uid
        && request.resource.data.keys().hasAll(["empresa", "titulo", "categorias", "altura", "alturaMetros", "fecha", "descripcion", "latitud", "longitud", "creadorId", "estado", "creado"])
        && request.resource.data.keys().hasOnly(["empresa", "titulo", "categorias", "altura", "alturaMetros", "fecha", "descripcion", "latitud", "longitud", "creadorId", "estado", "creado"])
        && request.resource.data.empresa is string
        && request.resource.data.titulo is string
        && request.resource.data.titulo.size() > 0
        && request.resource.data.titulo.size() <= 100
        && request.resource.data.categorias is list
        && request.resource.data.categorias.size() > 0
        && request.resource.data.categorias.size() <= 5
        && request.resource.data.categorias.toSet().difference(["frutal", "floral", "medicinal", "sombra", "forraje"].toSet()).size() == 0
        && request.resource.data.altura in ["pequeno", "mediano", "alto"]
        && request.resource.data.alturaMetros is number
        && request.resource.data.alturaMetros > 0
        && request.resource.data.alturaMetros <= 200
        && ((request.resource.data.alturaMetros <= 5 && request.resource.data.altura == "pequeno")
          || (request.resource.data.alturaMetros > 5 && request.resource.data.alturaMetros <= 15 && request.resource.data.altura == "mediano")
          || (request.resource.data.alturaMetros > 15 && request.resource.data.altura == "alto"))
        && request.resource.data.fecha is string
        && request.resource.data.categorias.toSet().difference(["frutal", "floral", "medicinal", "sombra", "forraje"].toSet()).size() == 0
        && request.resource.data.descripcion.size() > 0
        && request.resource.data.descripcion.size() <= 800
        && request.resource.data.latitud is number
        && request.resource.data.latitud >= -90
        && request.resource.data.latitud <= 90
        && request.resource.data.longitud is number
        && request.resource.data.longitud >= -180
        && request.resource.data.longitud <= 180
        && request.resource.data.estado == "abierta"
        && request.resource.data.creado == request.time;
      allow update: if request.auth != null
        && request.auth.uid == resource.data.creadorId
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(["estado"])
        && request.resource.data.estado in ["abierta", "cerrada"];
      allow delete: if false;

      match /reclamos/{usuarioId} {
        allow read: if request.auth != null
          && (request.auth.uid == usuarioId
            || request.auth.uid == get(/databases/$(database)/documents/actividades_tala/$(actividadId)).data.creadorId);
        allow create: if request.auth != null
          && request.auth.uid == usuarioId
          && request.auth.uid != get(/databases/$(database)/documents/actividades_tala/$(actividadId)).data.creadorId
          && request.resource.data.keys().hasAll(["actividadId", "usuarioId", "nombre", "contacto", "mensaje", "creado"])
          && request.resource.data.keys().hasOnly(["actividadId", "usuarioId", "nombre", "contacto", "mensaje", "creado"])
          && request.resource.data.actividadId == actividadId
          && request.resource.data.usuarioId == request.auth.uid
          && request.resource.data.nombre is string
          && request.resource.data.nombre.size() > 0
          && request.resource.data.nombre.size() <= 80
          && request.resource.data.contacto is string
          && request.resource.data.contacto.size() > 0
          && request.resource.data.contacto.size() <= 120
          && request.resource.data.mensaje is string
          && request.resource.data.mensaje.size() <= 400
          && request.resource.data.creado == request.time;
        allow update, delete: if false;
      }
    }

    match /{path=**}/reclamos/{usuarioId} {
      allow read: if request.auth != null && request.auth.uid == usuarioId;
    }
  }
}
```

Con estas reglas cualquiera puede leer y agregar árboles y usos, pero nadie puede modificar ni borrar desde la web. Las actividades abiertas son públicas; solo la cuenta creadora puede cerrarlas y leer los contactos de sus reclamos. Publica estas reglas y habilita Authentication Anónimo para activar la publicación y los reclamos.

## Estructura de la base de datos
Colección `arboles`, un documento por árbol:

| Campo | Tipo | Ejemplo |
|---|---|---|
| nombre | texto | "Guanábana" |
| cientifico | texto | "Annona muricata" |
| categorias | lista | ["frutal", "medicinal"] |
| alturaMetros | número | 4.5 |
| altura | texto | "pequeno", "mediano" o "alto" (calculado desde la medida) |
| descripcion | texto | "Árbol pequeño..." |
| usos | texto | "Hojas al compost..." |
| tiposUso | lista | ["medicinal"] |
| usoMedicinal | texto | "Uso tradicional de las hojas..." |
| usosPartes | lista de objetos | [{"parte":"Hojas","descripcion":"Se convierten en abono"}] |
| foto | texto (imagen comprimida) | "data:image/jpeg;base64,..." |
| autor | texto | "María" |
| creado | fecha | (automática) |

Los nuevos usos aportados desde el detalle se guardan como documentos separados en `usos_arboles`, con los campos `arbolId`, `parte`, `descripcion` y `creado`.

## Actividades de tala
Las actividades se guardan en `actividades_tala` con empresa, título, fecha, descripción, coordenadas, estado y el ID de la cuenta creadora. Los reclamos se guardan en la subcolección `reclamos` de cada actividad. El nombre y contacto de quien reclama solo pueden leerlos esa persona y la cuenta creadora.

El mapa usa Leaflet y teselas de OpenStreetMap. Para publicar una actividad hay que conceder permiso de ubicación o seleccionar manualmente el punto en el mapa. Firebase Authentication debe tener habilitado el proveedor **Anónimo**; así cada navegador obtiene una identidad que separa las publicaciones y los reclamos. La app muestra las actividades abiertas al público, y la pestaña **Mis actividades** solo muestra las creadas por la sesión actual.

Campos de `actividades_tala`: `empresa`, `titulo`, `categorias` (lista de valores del catálogo), `alturaMetros` (número en metros), `altura` (categoría calculada), `fecha` (texto `AAAA-MM-DD`), `descripcion`, `latitud`, `longitud`, `creadorId`, `estado` (`abierta` o `cerrada`) y `creado`. Los rangos usados son pequeño hasta 5 m, mediano por encima de 5 y hasta 15 m, y alto por encima de 15 m. Cada documento de `reclamos` usa el UID del reclamante como ID y guarda `actividadId`, `usuarioId`, `nombre`, `contacto`, `mensaje` y `creado`, lo que evita que una misma cuenta reclame dos veces la misma actividad.

## Sobre las fotos
Las fotos se redimensionan a 800 px y se guardan como texto dentro del documento, por lo que no hace falta Firebase Storage (que puede requerir el plan de pago Blaze). Si más adelante quieren muchas fotos o de mayor calidad, conviene pasar a Storage o a un servicio como Cloudinary.

La cámara en vivo requiere permiso del navegador y un contexto seguro (HTTPS o `localhost`). La primera clasificación descarga TensorFlow.js y MobileNet; el análisis se realiza en el dispositivo y no envía la imagen al servicio del modelo. La detección busca árboles, plantas, hojas, flores, frutos, ramas, semillas y otros elementos vegetales. Es orientativa: si no reconoce una imagen con claridad, la persona puede confirmar el envío manualmente.

## Publicar
Con Firebase Hosting: `npm install -g firebase-tools`, `firebase login`, `firebase init hosting` y `firebase deploy`.

## Ideas para mejorar
- Moderación: añadir un campo `aprobado` y mostrar solo los aprobados.
- Los usos medicinales son tradicionales y solo informativos.
