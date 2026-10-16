// ============================================================
//  CONFIGURACIÓN DE FIREBASE
//  Pega aquí el objeto firebaseConfig de tu proyecto
//  (Consola de Firebase > Configuración del proyecto > Tus apps > Web).
//  Mientras diga "TU_API_KEY", la página funciona en MODO DEMO:
//  los árboles nuevos se guardan solo en el navegador (localStorage).
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDKumFZHzg0WF-c18lRjUMFkv5Xly5Ai8A",
  authDomain: "rootloop-96901.firebaseapp.com",
  projectId: "rootloop-96901",
  storageBucket: "rootloop-96901.firebasestorage.app",
  messagingSenderId: "772328652029",
  appId: "1:772328652029:web:df452929cd2faee7b81294",
  measurementId: "G-7YCBLEJEPC"
};

const COLECCION = "arboles";
const COLECCION_USOS = "usos_arboles";
const COLECCION_ACTIVIDADES = "actividades_tala";
const MODO_DEMO = firebaseConfig.apiKey === "TU_API_KEY" ||
  (location.hostname === "localhost" && new URLSearchParams(location.search).get("modo") === "demo");

const CATEGORIAS = {
  frutal: "🍎 Frutal",
  floral: "🌸 Floral",
  medicinal: "🌿 Medicinal",
  sombra: "⛱️ Sombra",
  forraje: "🐄 Forraje / abono"
};

const ALTURAS = {
  pequeno: "🌱 Pequeño",
  mediano: "🌳 Mediano",
  alto: "🌲 Alto"
};

function convertirAlturaAMetros(valor, unidad) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) return null;
  const metros = unidad === "cm" ? numero / 100 : numero;
  return metros <= 200 ? metros : null;
}

function clasificarAltura(metros) {
  if (!Number.isFinite(metros) || metros <= 0 || metros > 200) return null;
  if (metros <= 5) return "pequeno";
  if (metros <= 15) return "mediano";
  return "alto";
}

function mostrarClasificacionAltura(valor, unidad, salida) {
  const metros = convertirAlturaAMetros(valor, unidad);
  const categoria = clasificarAltura(metros);
  salida.textContent = categoria
    ? `Clasificación: ${ALTURAS[categoria]} · ${metros.toLocaleString("es", { maximumFractionDigits: 2 })} m`
    : "Ingresa una altura mayor que 0 y hasta 200 m.";
  salida.classList.toggle("altura-invalida", !categoria && Boolean(valor));
  return { metros, categoria };
}

function conectarControlAltura(formulario, nombreMedida, nombreUnidad, selectorSalida) {
  const form = $(formulario);
  const medida = form.querySelector(`[name='${nombreMedida}']`);
  const unidad = form.querySelector(`[name='${nombreUnidad}']`);
  const salida = $(selectorSalida);
  const actualizar = () => mostrarClasificacionAltura(medida.value, unidad.value, salida);
  form.addEventListener("input", (evento) => {
    if (evento.target === medida || evento.target === unidad) actualizar();
  });
  form.addEventListener("change", (evento) => {
    if (evento.target === medida || evento.target === unidad) actualizar();
  });
  form.addEventListener("reset", () => requestAnimationFrame(actualizar));
}

// Árboles de ejemplo (siempre visibles). Los usos medicinales son tradicionales.
const ARBOLES_BASE = [
  {
    nombre: "Neem", cientifico: "Azadirachta indica",
    categorias: ["medicinal", "sombra"],
    altura: "alto", alturaMetros: 18,
    descripcion: "Árbol de crecimiento rápido, resistente a la sequía y con buena sombra.",
    usos: "Las hojas trituradas van al compost o se usan para preparar un biopesticida casero. Tradicionalmente se usa en infusiones y lavados. Las ramas sirven de leña."
  },
  {
    nombre: "Guanábana", cientifico: "Annona muricata",
    categorias: ["frutal", "medicinal"],
    altura: "pequeno", alturaMetros: 4,
    descripcion: "Árbol pequeño de hojas brillantes que da frutos grandes y aromáticos.",
    usos: "El fruto se aprovecha en refrescos y helados. Las hojas se usan tradicionalmente en infusión, y las hojas secas pueden ir al compost."
  },
  {
    nombre: "Moringa", cientifico: "Moringa oleifera",
    categorias: ["medicinal", "forraje"],
    altura: "mediano", alturaMetros: 8,
    descripcion: "Árbol de rápido rebrote que tolera podas frecuentes, con hojas pequeñas y nutritivas.",
    usos: "La poda genera mucha biomasa verde para forraje y abono. Las hojas se consumen frescas o secas y las semillas se usan para clarificar agua de forma tradicional."
  },
  {
    nombre: "Madero negro", cientifico: "Gliricidia sepium",
    categorias: ["forraje", "floral"],
    altura: "mediano", alturaMetros: 10,
    descripcion: "Árbol que se usa como cerco vivo y que florece de rosado en la época seca.",
    usos: "Su follaje, rico en nitrógeno, sirve de abono verde y forraje. Las ramas se usan como estacas para nuevos cercos y como leña."
  },
  {
    nombre: "Cortez amarillo", cientifico: "Tabebuia ochracea",
    categorias: ["floral", "sombra"],
    altura: "alto", alturaMetros: 18,
    descripcion: "Árbol que cubre su copa de flores amarillas al final de la época seca.",
    usos: "Las flores y hojas caídas se pueden compostar o dejar como cobertura (mulch) bajo el árbol. Las ramas gruesas se astillan para acolchar parques y jardines."
  },
  {
    nombre: "Mango", cientifico: "Mangifera indica",
    categorias: ["frutal", "sombra"],
    altura: "alto", alturaMetros: 20,
    descripcion: "Árbol grande y frondoso, muy común en patios y calles.",
    usos: "Además del fruto, las ramas podadas se astillan para mulch o leña. Sus hojas son coriáceas y tardan en descomponerse, por lo que conviene triturarlas antes de compostarlas."
  },
  {
    nombre: "Guácimo", cientifico: "Guazuma ulmifolia",
    categorias: ["forraje", "sombra", "medicinal"],
    altura: "alto", alturaMetros: 18,
    descripcion: "Árbol de copa amplia, común en potreros y zonas secas.",
    usos: "Hojas y frutos se usan como forraje para el ganado. La corteza y las hojas tienen usos tradicionales en infusión. La poda se composta o se astilla."
  },
  {
    nombre: "Malinche", cientifico: "Delonix regia",
    categorias: ["floral", "sombra"],
    altura: "mediano", alturaMetros: 10,
    descripcion: "Árbol de copa en forma de sombrilla con flores rojo intenso.",
    usos: "Sus hojas pequeñas se descomponen rápido y mejoran el compost. Las flores caídas sirven de cobertura y las vainas secas, de leña."
  }
];

let arboles = [...ARBOLES_BASE];
let categoriaActiva = "todas";
let textoBusqueda = "";
let arbolSeleccionado = null;
let usosAportados = [];
let usosArbolActual = null;
let detenerEscuchaUsos = null;
let authSdk = null;
let auth = null;
let usuarioActual = null;
let actividadesAbiertas = [];
let misActividades = [];
let reclamosMios = new Set();
let detenerEscuchaActividadesPublicas = null;
let uidEscuchadoActividades = null;
let mapaExplorar = null;
let capaActividades = null;
let mapaPublicar = null;
let mapaDetalleActividad = null;
let marcadorUbicacionActividad = null;
let ubicacionActividad = null;

// ---------- utilidades ----------
const $ = (sel) => document.querySelector(sel);

function esc(texto) {
  const d = document.createElement("div");
  d.textContent = texto ?? "";
  return d.innerHTML;
}

function fotoSegura(url) {
  return typeof url === "string" && url.startsWith("data:image/") ? url : "";
}

function emojiDe(arbol) {
  const c = arbol.categorias || [];
  if (c.includes("frutal")) return "🍎";
  if (c.includes("floral")) return "🌸";
  if (c.includes("medicinal")) return "🌿";
  return "🌳";
}

function claveArbol(arbol, indice) {
  return arbol.id ? `comunidad-${arbol.id}` : `base-${indice}`;
}

function htmlEtiquetasArbol(arbol) {
  const categorias = (arbol.categorias || [])
    .filter((categoria) => CATEGORIAS[categoria])
    .map((categoria) => `<span class="etiqueta">${CATEGORIAS[categoria]}</span>`);
  if (ALTURAS[arbol.altura]) {
    const medida = Number.isFinite(Number(arbol.alturaMetros))
      ? ` · ${Number(arbol.alturaMetros).toLocaleString("es", { maximumFractionDigits: 2 })} m`
      : "";
    categorias.push(`<span class="etiqueta etiqueta-altura">${ALTURAS[arbol.altura]}${medida}</span>`);
  }
  return categorias.join("");
}

function renderUsosPartes(arbol, clave) {
  const usosBase = Array.isArray(arbol.usosPartes)
    ? arbol.usosPartes.filter((item) => item && item.parte && item.descripcion)
    : [];
  const usos = [...usosBase, ...usosAportados.filter((item) => item.arbolId === clave)];
  const contenido = usos.length
    ? usos.map((item) => `<p><span>${esc(item.parte)}:</span> ${esc(item.descripcion)}</p>`).join("")
    : `<p class="usos-sin-detalle">Aún no se agregaron usos específicos para este árbol.</p>`;
  return `<section class="usos-adicionales" aria-label="Usos de las partes del árbol">
    <strong>Usos de hojas, tronco y otras partes</strong>
    ${contenido}
    <button class="btn-secundario abrir-form-uso" type="button">+ Aportar otro uso</button>
    <form class="form-uso-inline" hidden>
      <label>Parte del árbol
        <select name="parte">
          <option>Hojas</option>
          <option>Tronco</option>
          <option>Ramas</option>
          <option>Flores</option>
          <option>Frutos</option>
          <option>Semillas</option>
          <option>Raíces</option>
          <option>Otra parte</option>
        </select>
      </label>
      <label>¿Cómo se aprovecha?
        <input name="descripcion" required maxlength="250" placeholder="Describe el uso">
      </label>
      <div class="uso-form-acciones">
        <button class="btn" type="submit">Guardar uso</button>
        <button class="cancelar-form-uso" type="button">Cancelar</button>
      </div>
      <p class="uso-form-mensaje" role="status"></p>
    </form>
  </section>`;
}

function renderTipoUsos(arbol) {
  const tipos = Array.isArray(arbol.tiposUso) ? arbol.tiposUso : [];
  if (!tipos.includes("medicinal") && !arbol.usoMedicinal) return "";
  return `<section class="clasificacion-usos" aria-label="Uso medicinal tradicional">
    <strong>Uso medicinal tradicional</strong>
    <p>${esc(arbol.usoMedicinal || "Sin detalle agregado.")}</p>
  </section>`;
}

function renderDetalle(arbol, clave) {
  const panel = $("#detalle-arbol");
  if (!arbol) {
    if (panel instanceof HTMLDialogElement) {
      if (panel.open) panel.close();
    } else {
      panel.hidden = true;
      panel.innerHTML = "";
    }
    return;
  }

  const foto = fotoSegura(arbol.foto);
  const etiquetas = htmlEtiquetasArbol(arbol);
  panel.innerHTML = `
    <button class="detalle-cerrar" type="button" aria-label="Cerrar detalle">Cerrar</button>
    <div class="detalle-foto">${foto ? `<img src="${foto}" alt="Foto de ${esc(arbol.nombre || "árbol")}">` : emojiDe(arbol)}</div>
    <div class="detalle-cuerpo">
      <p class="detalle-kicker">Árbol seleccionado</p>
      <h3 id="detalle-titulo">${esc(arbol.nombre || "Árbol sin nombre")}</h3>
      ${arbol.cientifico ? `<p class="cientifico">${esc(arbol.cientifico)}</p>` : ""}
      <div class="etiquetas">${etiquetas}</div>
      <p>${esc(arbol.descripcion || "Sin descripción disponible.")}</p>
      <p class="usos"><strong>Reutilización:</strong> ${esc(arbol.usos || "Sin información de reutilización.")}</p>
      ${renderTipoUsos(arbol)}
      ${renderUsosPartes(arbol, clave)}
      ${arbol.origen === "comunidad" ? `<p class="autor">Aportado por ${esc(arbol.autor || "Anónimo")}</p>` : ""}
    </div>`;
  if (panel instanceof HTMLDialogElement) {
    if (!panel.open) panel.showModal();
  } else {
    panel.hidden = false;
  }
}

function escucharUsosArbol(clave) {
  if (usosArbolActual !== clave) {
    detenerEscuchaUsos?.();
    detenerEscuchaUsos = null;
    usosArbolActual = clave;
    usosAportados = [];
  }

  if (MODO_DEMO) {
    const guardados = JSON.parse(localStorage.getItem("usos_arboles_comunidad") || "[]");
    usosAportados = guardados.filter((uso) => uso.arbolId === clave);
    return;
  }

  if (!fb || detenerEscuchaUsos) return;
  const consulta = fb.query(
    fb.collection(fb.db, COLECCION_USOS),
    fb.where("arbolId", "==", clave)
  );
  detenerEscuchaUsos = fb.onSnapshot(consulta, (snap) => {
    usosAportados = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    render();
  }, (err) => {
    console.error(err);
  });
}

function dejarDeEscucharUsos() {
  detenerEscuchaUsos?.();
  detenerEscuchaUsos = null;
  usosArbolActual = null;
  usosAportados = [];
}

// ---------- render ----------
function render() {
  const q = textoBusqueda.trim().toLowerCase();
  const visibles = arboles.map((arbol, indice) => ({
    ...arbol,
    claveVista: claveArbol(arbol, indice)
  })).filter((a) => {
    const filtroAltura = categoriaActiva.startsWith("altura-") ? categoriaActiva.slice("altura-".length) : null;
    const coincideCat = categoriaActiva === "todas" ||
      (filtroAltura ? a.altura === filtroAltura : (a.categorias || []).includes(categoriaActiva));
    const otrosUsos = (a.usosPartes || []).map((item) => `${item.parte} ${item.descripcion}`).join(" ");
    const tiposUso = `${(a.tiposUso || []).filter((tipo) => tipo === "medicinal").join(" ")} ${a.usoMedicinal || ""}`;
    const altura = ALTURAS[a.altura] || "";
    const texto = `${a.nombre || ""} ${a.cientifico || ""} ${a.descripcion || ""} ${a.usos || ""} ${otrosUsos} ${tiposUso} ${altura}`.toLowerCase();
    return coincideCat && (!q || texto.includes(q));
  });

  $("#lista").innerHTML = visibles.map((a) => {
    const foto = fotoSegura(a.foto);
    const etiquetas = htmlEtiquetasArbol(a);
    return `
      <article class="card" data-tree-id="${esc(a.claveVista)}" tabindex="0" role="button" aria-haspopup="dialog">
        <div class="foto">${foto ? `<img src="${foto}" alt="Foto de ${esc(a.nombre)}" loading="lazy">` : emojiDe(a)}</div>
        <div class="cuerpo">
          <h3>${esc(a.nombre || "Árbol sin nombre")}</h3>
          ${a.cientifico ? `<p class="cientifico">${esc(a.cientifico)}</p>` : ""}
          <div class="etiquetas">${etiquetas}</div>
          <p>${esc(a.descripcion || "Sin descripción disponible.")}</p>
          <p class="usos"><strong>Reutilización:</strong> ${esc(a.usos || "Sin información de reutilización.")}</p>
          ${a.origen === "comunidad" ? `<p class="autor">Aportado por ${esc(a.autor || "Anónimo")}</p>` : ""}
        </div>
      </article>`;
  }).join("");

  const indiceSeleccionado = arboles.findIndex((arbol, indice) => claveArbol(arbol, indice) === arbolSeleccionado);
  const seleccionado = indiceSeleccionado < 0 ? null : arboles[indiceSeleccionado];
  if (seleccionado) escucharUsosArbol(arbolSeleccionado);
  else dejarDeEscucharUsos();
  renderDetalle(seleccionado, arbolSeleccionado);

  $("#vacio").hidden = visibles.length > 0;

  $("#stat-total").textContent = arboles.length;
  $("#stat-medicinal").textContent = arboles.filter((a) => (a.categorias || []).includes("medicinal")).length;
  $("#stat-usuarios").textContent = arboles.filter((a) => a.origen === "comunidad").length;
}

// ---------- filtros ----------
$("#filtros").addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  categoriaActiva = btn.dataset.cat;
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("activo", c === btn));
  render();
});

$("#buscar").addEventListener("input", (e) => {
  textoBusqueda = e.target.value;
  render();
});

function alternarSeleccion(card) {
  arbolSeleccionado = card.dataset.treeId;
  render();
}

$("#lista").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) alternarSeleccion(card);
});

$("#lista").addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches(".card")) {
    e.preventDefault();
    alternarSeleccion(e.target);
  }
});

$("#detalle-arbol").addEventListener("click", (e) => {
  if (e.target.closest(".abrir-form-uso")) {
    const form = $(".form-uso-inline");
    form.hidden = false;
    form.querySelector("input[name='descripcion']").focus();
    return;
  }
  if (e.target.closest(".cancelar-form-uso")) {
    const form = e.target.closest(".form-uso-inline");
    form.reset();
    form.hidden = true;
    return;
  }
  if (e.target.closest(".detalle-cerrar") || e.target === e.currentTarget) {
    arbolSeleccionado = null;
    if (e.currentTarget instanceof HTMLDialogElement && e.currentTarget.open) {
      e.currentTarget.close();
    }
    render();
  }
});

$("#detalle-arbol").addEventListener("close", () => {
  const clave = arbolSeleccionado;
  arbolSeleccionado = null;
  dejarDeEscucharUsos();
  const tarjeta = [...$("#lista").querySelectorAll(".card")]
    .find((card) => card.dataset.treeId === clave);
  tarjeta?.focus({ preventScroll: true });
});

const botonAportar = $("#abrir-aporte");
if (botonAportar) {
  botonAportar.addEventListener("click", () => {
    const formulario = $("#aportar");
    if (formulario instanceof HTMLDialogElement) formulario.showModal();
    else formulario.scrollIntoView({ behavior: "smooth" });
  });
}

$("#aportar").addEventListener("click", (e) => {
  if (e.target.closest(".form-cerrar") || e.target === e.currentTarget) {
    if (e.currentTarget instanceof HTMLDialogElement && e.currentTarget.open) {
      e.currentTarget.close();
    }
  }
});

$("#aportar").addEventListener("close", detenerCamara);

// ---------- imagen: redimensionar y comprimir ----------
// Se guarda como texto (data URL) dentro del documento de Firestore,
// así no hace falta Firebase Storage. Límite de Firestore: 1 MB por documento.
function comprimirImagen(archivo, maxLado = 800, calidad = 0.7) {
  return new Promise((resolve, reject) => {
    if (!archivo) return resolve("");
    const lector = new FileReader();
    lector.onerror = () => reject(new Error("No se pudo leer la imagen."));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("El archivo no es una imagen válida."));
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", calidad));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

// ---------- almacenamiento ----------
let fb = null; // funciones de Firestore cuando hay configuración real

function activarVistaActividades(vista) {
  document.querySelectorAll(".actividad-tab").forEach((boton) => {
    const activa = boton.dataset.vista === vista;
    boton.classList.toggle("activo", activa);
    boton.setAttribute("aria-selected", String(activa));
  });
  document.querySelectorAll(".actividad-vista").forEach((panel) => {
    panel.hidden = panel.id !== `vista-${vista}`;
  });

  requestAnimationFrame(() => {
    if (vista === "explorar") {
      iniciarMapaExplorar();
      mapaExplorar?.invalidateSize();
    }
    if (vista === "publicar") {
      iniciarMapaPublicar();
      mapaPublicar?.invalidateSize();
    }
  });
}

function formatoFecha(fecha) {
  if (!fecha) return "Fecha por confirmar";
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(new Date(anio, mes - 1, dia));
}

function htmlCategoriasActividad(categorias, altura, alturaMetros) {
  const etiquetas = (Array.isArray(categorias) ? categorias : [])
    .filter((categoria) => CATEGORIAS[categoria])
    .map((categoria) => `<span class="etiqueta">${CATEGORIAS[categoria]}</span>`);
  if (ALTURAS[altura]) {
    const medida = Number.isFinite(Number(alturaMetros))
      ? ` · ${Number(alturaMetros).toLocaleString("es", { maximumFractionDigits: 2 })} m`
      : "";
    etiquetas.push(`<span class="etiqueta etiqueta-altura">${ALTURAS[altura]}${medida}</span>`);
  }
  return etiquetas.join("");
}

function iniciarMapaExplorar() {
  if (mapaExplorar || !window.L || !$("#mapa-actividades")) return;
  mapaExplorar = L.map("mapa-actividades", { scrollWheelZoom: false }).setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(mapaExplorar);
  capaActividades = L.layerGroup().addTo(mapaExplorar);
  renderMarcadoresActividades();
}

function iniciarMapaPublicar() {
  if (mapaPublicar || !window.L || !$("#mapa-publicacion")) return;
  mapaPublicar = L.map("mapa-publicacion").setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(mapaPublicar);
  mapaPublicar.on("click", (evento) => ponerUbicacionActividad(evento.latlng));
}

function abrirDetalleActividad(actividad) {
  const propia = actividad.creadorId === usuarioActual?.uid;
  const reclamada = reclamosMios.has(actividad.id);
  const acciones = propia
    ? `<div class="actividad-acciones">
        <button class="btn-secundario ver-reclamos-detalle" type="button" data-id="${esc(actividad.id)}">Ver reclamos</button>
        <button class="btn-secundario cambiar-estado-actividad" type="button" data-id="${esc(actividad.id)}">${actividad.estado === "abierta" ? "Cerrar actividad" : "Reabrir actividad"}</button>
      </div>
      <div id="detalle-reclamos-actividad" class="reclamos-actividad" hidden></div>`
    : `<button class="btn-secundario reclamar-actividad" type="button" data-id="${esc(actividad.id)}" ${reclamada || !usuarioActual ? "disabled" : ""}>${reclamada ? "Ya enviaste tu interés" : "Me interesa reclamar"}</button>`;
  const categorias = htmlCategoriasActividad(actividad.categorias, actividad.altura, actividad.alturaMetros);
  const latitud = Number(actividad.latitud);
  const longitud = Number(actividad.longitud);
  const mapaDetalle = Number.isFinite(latitud) && Number.isFinite(longitud)
    ? `<div id="mapa-detalle-actividad" class="mapa-detalle-actividad" aria-label="Mapa con la ubicación de la tala"></div>`
    : `<p>Ubicación no disponible.</p>`;
  const dialogo = $("#detalle-actividad");
  mapaDetalleActividad?.remove();
  mapaDetalleActividad = null;
  dialogo.innerHTML = `
    <button class="detalle-cerrar" type="button" aria-label="Cerrar actividad">Cerrar</button>
    <div class="detalle-cuerpo detalle-cuerpo-actividad">
      <p class="detalle-kicker">${actividad.estado === "abierta" ? "Actividad abierta" : "Actividad cerrada"}</p>
      <h3 id="detalle-actividad-titulo">${esc(actividad.titulo)}</h3>
      <div class="actividad-meta"><span>${esc(actividad.empresa)}</span><span>${esc(formatoFecha(actividad.fecha))}</span></div>
      ${categorias ? `<div class="etiquetas">${categorias}</div>` : actividad.especies ? `<p><strong>Especies:</strong> ${esc(actividad.especies)}</p>` : `<p>Tipo de árbol no especificado.</p>`}
      <p>${esc(actividad.descripcion)}</p>
      ${mapaDetalle}
      ${acciones}
    </div>`;
  if (!dialogo.open) dialogo.showModal();
  if (Number.isFinite(latitud) && Number.isFinite(longitud)) {
    requestAnimationFrame(() => {
      const elementoMapa = $("#mapa-detalle-actividad");
      if (!elementoMapa || !window.L) return;
      const punto = [latitud, longitud];
      mapaDetalleActividad = L.map(elementoMapa, { scrollWheelZoom: false }).setView(punto, 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(mapaDetalleActividad);
      L.marker(punto).addTo(mapaDetalleActividad);
      mapaDetalleActividad.invalidateSize();
    });
  }
}

function abrirFormularioReclamo(actividad) {
  $("#form-reclamo").reset();
  $("#form-reclamo [name='actividadId']").value = actividad.id;
  $("#actividad-reclamo-nombre").textContent = `${actividad.titulo} · ${actividad.empresa}`;
  $("#mensaje-reclamo").textContent = "";
  $("#dialogo-reclamo").showModal();
}

function ponerUbicacionActividad(latlng) {
  ubicacionActividad = { latitud: latlng.lat, longitud: latlng.lng };
  $("#form-actividad [name='latitud']").value = latlng.lat;
  $("#form-actividad [name='longitud']").value = latlng.lng;
  $("#estado-ubicacion").textContent = `Punto seleccionado: ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}.`;
  if (marcadorUbicacionActividad) marcadorUbicacionActividad.remove();
  marcadorUbicacionActividad = L.marker(latlng).addTo(mapaPublicar).bindPopup("Ubicación de la actividad").openPopup();
}

function renderMarcadoresActividades() {
  if (!capaActividades || !window.L) return;
  capaActividades.clearLayers();
  const puntos = [];
  actividadesAbiertas.forEach((actividad) => {
    const latitud = Number(actividad.latitud);
    const longitud = Number(actividad.longitud);
    if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return;
    const punto = [latitud, longitud];
    puntos.push(punto);
    const icono = L.divIcon({
      className: "",
      html: '<div class="marcador-actividad"><span>🌳</span></div>',
      iconSize: [30, 38],
      iconAnchor: [15, 38]
    });
    L.marker(punto, { icon: icono }).addTo(capaActividades)
      .on("click", () => abrirDetalleActividad(actividad));
  });
  if (puntos.length === 1) mapaExplorar.setView(puntos[0], 12);
  else if (puntos.length > 1) mapaExplorar.fitBounds(puntos, { padding: [28, 28], maxZoom: 13 });
}

function htmlActividad(actividad) {
  const categorias = htmlCategoriasActividad(actividad.categorias, actividad.altura, actividad.alturaMetros);
  return `<article class="actividad-item">
    <button class="actividad-resumen" type="button" data-id="${esc(actividad.id)}" aria-haspopup="dialog">
      <span class="actividad-resumen-titulo">${esc(actividad.titulo)}</span>
      <span class="actividad-meta"><span>${esc(actividad.empresa)}</span><span>${esc(formatoFecha(actividad.fecha))}</span><span>${esc(actividad.estado === "cerrada" ? "Cerrada" : "Abierta")}</span></span>
      ${categorias ? `<span class="etiquetas">${categorias}</span>` : ""}
      <span class="actividad-resumen-hint">Toca para ver los detalles</span>
    </button>
  </article>`;
}

function renderActividades() {
  const abiertas = [...actividadesAbiertas].sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));
  $("#lista-actividades").innerHTML = abiertas.map((actividad) => htmlActividad(actividad)).join("");
  $("#sin-actividades").hidden = abiertas.length > 0;
  if (abiertas.length === 0) $("#sin-actividades").textContent = "Todavía no hay actividades abiertas.";
  $("#cuenta-actividades").textContent = abiertas.length;

  const propias = [...misActividades].sort((a, b) => (b.creado?.seconds || 0) - (a.creado?.seconds || 0));
  $("#lista-mias").innerHTML = propias.map((actividad) => htmlActividad(actividad)).join("");
  $("#sin-mias").hidden = propias.length > 0;
  $("#cuenta-mias").textContent = propias.length;
  renderMarcadoresActividades();
}

function guardarActividadesDemo(actividades) {
  localStorage.setItem("actividades_tala_demo", JSON.stringify(actividades));
}

function escucharActividades() {
  if (MODO_DEMO) {
    const todas = JSON.parse(localStorage.getItem("actividades_tala_demo") || "[]");
    actividadesAbiertas = todas.filter((actividad) => actividad.estado === "abierta");
    misActividades = usuarioActual ? todas.filter((actividad) => actividad.creadorId === usuarioActual.uid) : [];
    const reclamos = JSON.parse(localStorage.getItem("reclamos_tala_demo") || "[]");
    reclamosMios = new Set(usuarioActual ? reclamos.filter((reclamo) => reclamo.usuarioId === usuarioActual.uid).map((reclamo) => reclamo.actividadId) : []);
    renderActividades();
    return;
  }

  if (!fb) return;
  const actividadesRef = fb.collection(fb.db, COLECCION_ACTIVIDADES);
  if (!detenerEscuchaActividadesPublicas) {
    detenerEscuchaActividadesPublicas = fb.onSnapshot(fb.query(actividadesRef, fb.where("estado", "==", "abierta")), (snapshot) => {
      actividadesAbiertas = snapshot.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
      renderActividades();
    }, (error) => {
      console.error("No se pudieron cargar las actividades abiertas:", error);
      $("#sin-actividades").hidden = false;
      $("#sin-actividades").textContent = "No se pudieron cargar las actividades. Revisa las reglas de lectura pública de Firestore.";
    });
  }

  if (!usuarioActual) {
    misActividades = [];
    reclamosMios = new Set();
    renderActividades();
    return;
  }
  if (uidEscuchadoActividades === usuarioActual.uid) return;
  uidEscuchadoActividades = usuarioActual.uid;

  fb.onSnapshot(fb.query(actividadesRef, fb.where("creadorId", "==", usuarioActual.uid)), (snapshot) => {
    misActividades = snapshot.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
    renderActividades();
  }, (error) => console.error("No se pudieron cargar tus actividades:", error));
}

async function publicarActividad(datos) {
  if (MODO_DEMO) {
    const actividades = JSON.parse(localStorage.getItem("actividades_tala_demo") || "[]");
    actividades.push({ ...datos, id: `demo-${Date.now()}`, creado: { seconds: Date.now() / 1000 } });
    guardarActividadesDemo(actividades);
    escucharActividades();
    return;
  }
  await fb.addDoc(fb.collection(fb.db, COLECCION_ACTIVIDADES), {
    ...datos,
    creado: fb.serverTimestamp()
  });
}

async function enviarReclamo(actividadId, datos) {
  if (MODO_DEMO) {
    const reclamos = JSON.parse(localStorage.getItem("reclamos_tala_demo") || "[]");
    if (reclamos.some((reclamo) => reclamo.actividadId === actividadId && reclamo.usuarioId === usuarioActual.uid)) {
      throw new Error("Ya enviaste tu interés por esta actividad.");
    }
    reclamos.push({ ...datos, actividadId, usuarioId: usuarioActual.uid, creado: new Date().toISOString() });
    localStorage.setItem("reclamos_tala_demo", JSON.stringify(reclamos));
    escucharActividades();
    return;
  }
  const referencia = fb.doc(fb.db, COLECCION_ACTIVIDADES, actividadId, "reclamos", usuarioActual.uid);
  await fb.setDoc(referencia, { ...datos, actividadId, usuarioId: usuarioActual.uid, creado: fb.serverTimestamp() });
}

async function cambiarEstadoActividad(actividad, estado) {
  if (MODO_DEMO) {
    const todas = JSON.parse(localStorage.getItem("actividades_tala_demo") || "[]");
    guardarActividadesDemo(todas.map((item) => item.id === actividad.id ? { ...item, estado } : item));
    escucharActividades();
    return;
  }
  await fb.updateDoc(fb.doc(fb.db, COLECCION_ACTIVIDADES, actividad.id), { estado });
}

async function cargarReclamosActividad(actividadId, selector = `#reclamos-${CSS.escape(actividadId)}`) {
  const contenedor = $(selector);
  if (!contenedor) return;
  contenedor.hidden = false;
  contenedor.innerHTML = "<p>Cargando reclamos...</p>";
  let reclamos;
  if (MODO_DEMO) {
    reclamos = JSON.parse(localStorage.getItem("reclamos_tala_demo") || "[]").filter((reclamo) => reclamo.actividadId === actividadId);
  } else {
    const referencia = fb.collection(fb.db, COLECCION_ACTIVIDADES, actividadId, "reclamos");
    const snapshot = await fb.getDocs(referencia);
    reclamos = snapshot.docs.map((documento) => documento.data());
  }
  contenedor.innerHTML = reclamos.length
    ? reclamos.map((reclamo) => `<div class="reclamo-mensaje"><strong>${esc(reclamo.nombre)}</strong> · ${esc(reclamo.contacto)}${reclamo.mensaje ? `<p>${esc(reclamo.mensaje)}</p>` : ""}</div>`).join("")
    : "<p>Aún no hay reclamos.</p>";
}

function mostrarVistaPrincipal(vista, desplazar = true) {
  const actividadesActivas = vista === "actividades";
  $("#catalogo").hidden = actividadesActivas;
  $("#actividades").hidden = !actividadesActivas;
  $("#estadisticas").hidden = actividadesActivas;
  document.querySelectorAll("[data-vista-principal]").forEach((enlace) => {
    const activo = enlace.dataset.vistaPrincipal === vista;
    enlace.classList.toggle("activo", activo);
    if (enlace.closest(".nav")) {
      if (activo) enlace.setAttribute("aria-current", "page");
      else enlace.removeAttribute("aria-current");
    }
  });

  if (actividadesActivas) {
    requestAnimationFrame(() => {
      iniciarMapaExplorar();
      mapaExplorar?.invalidateSize();
    });
  }
  if (desplazar) $(actividadesActivas ? "#actividades" : "#catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
}

function inicializarNavegacionPrincipal() {
  document.querySelectorAll("[data-vista-principal]").forEach((enlace) => {
    enlace.addEventListener("click", (evento) => {
      evento.preventDefault();
      const vista = enlace.dataset.vistaPrincipal;
      history.replaceState(null, "", `#${vista}`);
      mostrarVistaPrincipal(vista);
    });
  });
  mostrarVistaPrincipal(location.hash === "#actividades" ? "actividades" : "catalogo", false);
}

function inicializarInterfazActividades() {
  document.querySelectorAll(".actividad-tab").forEach((boton) => {
    boton.addEventListener("click", () => activarVistaActividades(boton.dataset.vista));
  });

  $("#form-actividad [name='fecha']").min = new Date().toISOString().slice(0, 10);
  $("#detalle-actividad").addEventListener("close", () => {
    mapaDetalleActividad?.remove();
    mapaDetalleActividad = null;
  });

  $("#usar-ubicacion").addEventListener("click", () => {
    if (!navigator.geolocation) {
      $("#estado-ubicacion").textContent = "Tu navegador no permite obtener la ubicación; selecciónala en el mapa.";
      return;
    }
    navigator.geolocation.getCurrentPosition((posicion) => {
      const punto = { lat: posicion.coords.latitude, lng: posicion.coords.longitude };
      mapaPublicar?.setView(punto, 15);
      ponerUbicacionActividad(punto);
    }, () => {
      $("#estado-ubicacion").textContent = "No se obtuvo permiso de ubicación; selecciónala directamente en el mapa.";
    }, { enableHighAccuracy: true, timeout: 10000 });
  });

  ["#lista-actividades", "#lista-mias"].forEach((selector) => {
    $(selector).addEventListener("click", (e) => {
      const boton = e.target.closest(".actividad-resumen");
      if (!boton) return;
      const actividad = [...actividadesAbiertas, ...misActividades].find((item) => item.id === boton.dataset.id);
      if (actividad) abrirDetalleActividad(actividad);
    });
  });

  $("#detalle-actividad").addEventListener("click", async (e) => {
    const dialogo = e.currentTarget;
    if (e.target.closest(".detalle-cerrar")) {
      dialogo.close();
      return;
    }
    const botonReclamo = e.target.closest(".reclamar-actividad");
    if (botonReclamo && !botonReclamo.disabled) {
      const actividad = actividadesAbiertas.find((item) => item.id === botonReclamo.dataset.id);
      if (actividad && actividad.creadorId !== usuarioActual?.uid) {
        dialogo.close();
        abrirFormularioReclamo(actividad);
      }
      return;
    }
    const botonVerReclamos = e.target.closest(".ver-reclamos-detalle");
    if (botonVerReclamos) {
      try { await cargarReclamosActividad(botonVerReclamos.dataset.id, "#detalle-reclamos-actividad"); }
      catch (error) {
        console.error(error);
        $("#detalle-reclamos-actividad").textContent = "No se pudieron cargar los reclamos.";
      }
      return;
    }
    const botonEstado = e.target.closest(".cambiar-estado-actividad");
    if (botonEstado) {
      const actividad = misActividades.find((item) => item.id === botonEstado.dataset.id);
      if (actividad) {
        await cambiarEstadoActividad(actividad, actividad.estado === "abierta" ? "cerrada" : "abierta");
        dialogo.close();
      }
    }
  });

  $("#form-actividad").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const mensaje = $("#mensaje-actividad");
    const boton = form.querySelector("button[type=submit]");
    const categorias = data.getAll("categorias");
    const altura = data.get("alturaActividad");
    if (!usuarioActual) {
      mensaje.textContent = "Espera a que se conecte tu sesión de invitado.";
      return;
    }
    if (categorias.length === 0) {
      mensaje.textContent = "Selecciona al menos una categoría de árbol.";
      return;
    }
    if (!altura) {
      mensaje.textContent = "Elige una clasificación de altura.";
      return;
    }
    if (!ubicacionActividad) {
      mensaje.textContent = "Selecciona el punto de tala en el mapa.";
      $("#estado-ubicacion").focus?.();
      return;
    }
    boton.disabled = true;
    mensaje.textContent = "Publicando actividad...";
    try {
      await publicarActividad({
        empresa: data.get("empresa").trim(),
        titulo: data.get("titulo").trim(),
        categorias,
        altura,
        fecha: data.get("fecha"),
        descripcion: data.get("descripcion").trim(),
        latitud: ubicacionActividad.latitud,
        longitud: ubicacionActividad.longitud,
        creadorId: usuarioActual.uid,
        estado: "abierta"
      });
      form.reset();
      ubicacionActividad = null;
      marcadorUbicacionActividad?.remove();
      marcadorUbicacionActividad = null;
      $("#estado-ubicacion").textContent = "Selecciona el punto exacto en el mapa.";
      mensaje.textContent = "Actividad publicada. Ya aparece en el mapa.";
      activarVistaActividades("mias");
    } catch (error) {
      console.error(error);
      mensaje.textContent = error.message || "No se pudo publicar la actividad.";
    } finally {
      boton.disabled = false;
    }
  });

  $("#form-reclamo").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const boton = form.querySelector("button[type=submit]");
    const mensaje = $("#mensaje-reclamo");
    boton.disabled = true;
    mensaje.textContent = "Enviando interés...";
    try {
      await enviarReclamo(data.get("actividadId"), {
        nombre: data.get("nombre").trim(),
        contacto: data.get("contacto").trim(),
        mensaje: data.get("mensaje").trim()
      });
      $("#dialogo-reclamo").close();
      mensaje.textContent = "";
    } catch (error) {
      console.error(error);
      mensaje.textContent = error.message || "No se pudo enviar el reclamo.";
    } finally {
      boton.disabled = false;
    }
  });

  document.querySelectorAll(".form-cerrar").forEach((boton) => {
    boton.addEventListener("click", () => boton.closest("dialog")?.close());
  });
}

async function iniciarAlmacenamiento() {
  inicializarInterfazActividades();
  if (MODO_DEMO) {
    let uidDemo = localStorage.getItem("rootloop_usuario_demo");
    if (!uidDemo) {
      uidDemo = `demo-${crypto.randomUUID()}`;
      localStorage.setItem("rootloop_usuario_demo", uidDemo);
    }
    usuarioActual = { uid: uidDemo };
    $("#estado-cuenta-actividades").textContent = "Modo de prueba: esta cuenta solo existe en este navegador.";
    const guardados = JSON.parse(localStorage.getItem("arboles_comunidad") || "[]");
    arboles = [...ARBOLES_BASE, ...guardados];
    render();
    escucharActividades();
    mostrarMensaje("Modo demo: los aportes se guardan solo en este navegador. Configura Firebase en app.js.", "ok");
    return;
  }

  const base = "https://www.gstatic.com/firebasejs/10.12.0";
  const [{ initializeApp }, firestore, firebaseAuth] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-firestore.js`),
    import(`${base}/firebase-auth.js`)
  ]);
  const app = initializeApp(firebaseConfig);
  const db = firestore.getFirestore(app);
  fb = { db, ...firestore };
  authSdk = firebaseAuth;
  auth = firebaseAuth.getAuth(app);
  escucharActividades();

  firebaseAuth.onAuthStateChanged(auth, (usuario) => {
    usuarioActual = usuario;
    if (!usuario) {
      $("#estado-cuenta-actividades").textContent = "Iniciando sesión de invitado...";
      return;
    }
    $("#estado-cuenta-actividades").textContent = "Sesión de invitado activa. Puedes publicar o reclamar actividades.";
    escucharActividades();
  }, (error) => {
    console.error(error);
    $("#estado-cuenta-actividades").textContent = "No se pudo iniciar sesión. Activa el proveedor Anónimo en Firebase Authentication.";
  });

  if (!auth.currentUser) {
    firebaseAuth.signInAnonymously(auth).catch((error) => {
      console.error(error);
      $("#estado-cuenta-actividades").textContent = "Activa el proveedor Anónimo en Firebase Authentication para usar actividades.";
    });
  }

  const consulta = fb.collection(db, COLECCION);
  fb.onSnapshot(consulta, (snap) => {
    const comunidad = snap.docs.map((d) => ({ id: d.id, ...d.data(), origen: "comunidad" }));
    arboles = [...ARBOLES_BASE, ...comunidad];
    render();
  }, (err) => {
    console.error(err);
    mostrarMensaje("No se pudo leer la base de datos. Revisa las reglas de Firestore.", "error");
  });
}

async function guardarArbol(datos) {
  if (MODO_DEMO) {
    const guardados = JSON.parse(localStorage.getItem("arboles_comunidad") || "[]");
    const nuevo = { ...datos, origen: "comunidad" };
    guardados.unshift(nuevo);
    localStorage.setItem("arboles_comunidad", JSON.stringify(guardados));
    arboles = [...ARBOLES_BASE, ...guardados];
    render();
    return;
  }
  await fb.addDoc(fb.collection(fb.db, COLECCION), { ...datos, creado: fb.serverTimestamp() });
}

async function guardarUsoArbol(datos) {
  if (MODO_DEMO) {
    const guardados = JSON.parse(localStorage.getItem("usos_arboles_comunidad") || "[]");
    const nuevo = { ...datos, id: `uso-${Date.now()}` };
    guardados.push(nuevo);
    localStorage.setItem("usos_arboles_comunidad", JSON.stringify(guardados));
    usosAportados = guardados.filter((uso) => uso.arbolId === datos.arbolId);
    render();
    return;
  }
  if (!fb) throw new Error("La conexión con Firebase todavía está iniciando.");
  await fb.addDoc(fb.collection(fb.db, COLECCION_USOS), {
    ...datos,
    creado: fb.serverTimestamp()
  });
}

// ---------- formulario ----------
function mostrarMensaje(texto, tipo = "") {
  const m = $("#msg");
  m.textContent = texto;
  m.className = `msg ${tipo}`;
}

function agregarFilaUso() {
  const fila = document.createElement("div");
  fila.className = "uso-parte-fila";
  fila.innerHTML = `
    <label>Parte del árbol
      <select name="parte">
        <option>Hojas</option>
        <option>Tronco</option>
        <option>Ramas</option>
        <option>Flores</option>
        <option>Frutos</option>
        <option>Semillas</option>
        <option>Raíces</option>
        <option>Otra parte</option>
      </select>
    </label>
    <label>¿Cómo se aprovecha?
      <input name="descripcionUso" required maxlength="250" placeholder="Ej. se convierte en abono o artesanía">
    </label>
    <button class="uso-eliminar" type="button" aria-label="Quitar este uso">Quitar</button>`;
  $("#usos-partes-lista").append(fila);
  fila.querySelector("input").focus();
}

function actualizarCamposTipoUso() {
  const seleccionados = new Set([...$("#form-arbol").querySelectorAll("[name='tiposUso']:checked")]
    .map((opcion) => opcion.value));
  document.querySelectorAll(".tipo-uso-campo").forEach((campo) => {
    campo.hidden = !seleccionados.has(campo.dataset.tipoUso);
  });
}

$("#form-arbol").addEventListener("change", (e) => {
  if (e.target.matches("[name='tiposUso']")) actualizarCamposTipoUso();
});

$("#agregar-uso").addEventListener("click", agregarFilaUso);
$("#usos-partes-lista").addEventListener("click", (e) => {
  const boton = e.target.closest(".uso-eliminar");
  if (boton) boton.closest(".uso-parte-fila").remove();
});

let fotoSeleccionada = null;
let urlVistaPrevia = "";
let flujoCamara = null;
let modeloClasificacion = null;
let cargaModeloClasificacion = null;
let revisionFotoActual = 0;
let estadoDeteccionFoto = "sin-foto";

function detenerCamara() {
  if (flujoCamara) flujoCamara.getTracks().forEach((pista) => pista.stop());
  flujoCamara = null;
  const video = $("#camara-video");
  if (video) video.srcObject = null;
  const panel = $("#camara-panel");
  if (panel) panel.hidden = true;
}

function limpiarFoto() {
  revisionFotoActual += 1;
  detenerCamara();
  const galeria = $("#foto-galeria");
  const camara = $("#foto-camara");
  if (galeria) galeria.value = "";
  if (camara) camara.value = "";
  fotoSeleccionada = null;
  if (urlVistaPrevia) URL.revokeObjectURL(urlVistaPrevia);
  urlVistaPrevia = "";
  const vistaPrevia = $("#foto-preview");
  if (vistaPrevia) vistaPrevia.hidden = true;
  const imagen = $("#foto-preview-img");
  if (imagen) imagen.removeAttribute("src");
  const nombre = $("#foto-nombre");
  if (nombre) nombre.textContent = "Puedes elegir una imagen o tomar una foto.";
  estadoDeteccionFoto = "sin-foto";
  const deteccion = $("#verificacion-foto");
  if (deteccion) deteccion.textContent = "";
}

function cargarScriptExterno(url, global) {
  if (window[global]) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => window[global] ? resolve() : reject(new Error("No se pudo iniciar el clasificador."));
    script.onerror = () => reject(new Error("No se pudo descargar el clasificador de imágenes."));
    document.head.append(script);
  });
}

async function obtenerModeloClasificacion() {
  if (modeloClasificacion) return modeloClasificacion;
  if (!cargaModeloClasificacion) {
    cargaModeloClasificacion = (async () => {
      await cargarScriptExterno("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js", "tf");
      await cargarScriptExterno("https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js", "mobilenet");
      await window.tf.ready();
      modeloClasificacion = await window.mobilenet.load({ version: 2, alpha: 0.5 });
      return modeloClasificacion;
    })();
  }
  return cargaModeloClasificacion;
}

function cargarImagen(archivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();
    imagen.onload = () => {
      URL.revokeObjectURL(url);
      resolve(imagen);
    };
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo abrir la imagen."));
    };
    imagen.src = url;
  });
}

function proporcionPixelsVerdes(imagen) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const contexto = canvas.getContext("2d", { willReadFrequently: true });
  if (!contexto) return 0;
  contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);
  const pixels = contexto.getImageData(0, 0, canvas.width, canvas.height).data;
  let pixelsVerdes = 0;
  let pixelsOpacos = 0;

  for (let indice = 0; indice < pixels.length; indice += 4) {
    const rojo = pixels[indice];
    const verde = pixels[indice + 1];
    const azul = pixels[indice + 2];
    if (pixels[indice + 3] < 128) continue;
    pixelsOpacos += 1;
    if (verde > 38 && verde - rojo > 8 && verde >= azul * 0.82 && verde > rojo * 1.06) {
      pixelsVerdes += 1;
    }
  }

  return pixelsOpacos ? pixelsVerdes / pixelsOpacos : 0;
}

async function analizarFotoArbol(archivo) {
  const revision = ++revisionFotoActual;
  const estado = $("#verificacion-foto");
  estadoDeteccionFoto = "analizando";
  estado.textContent = "Analizando la imagen en este dispositivo...";

  try {
    const modelo = await obtenerModeloClasificacion();
    const imagen = await cargarImagen(archivo);
    const resultados = await modelo.classify(imagen, 10);
    if (revision !== revisionFotoActual) return;
    const proporcionVerde = proporcionPixelsVerdes(imagen);

    const clasesVegetales = /\b(tree|forest|oak|maple|pine|fir|palm|willow|birch|cedar|cypress|redwood|sequoia|bonsai|banyan|mangrove|eucalyptus|mango|olive|guava|coconut|fig|baobab|jacaranda|plant|houseplant|potted plant|pot plant|shrub|bush|vine|fern|moss|cactus|succulent|grass|herb|leaf|leaves|foliage|flower|blossom|rose|daisy|sunflower|orchid|tulip|lily|hibiscus|fruit|apple|orange|lemon|banana|pineapple|strawberry|grape|avocado|tomato|pepper|cucumber|zucchini|squash|pumpkin|vegetable|broccoli|cauliflower|cabbage|lettuce|artichoke|mushroom|seed|acorn|pine cone|cone|branch|twig|bark|wood|log|stump|root|roots|hoja|hojas|fruto|frutos|flor|flores|rama|ramas|tronco|semilla|semillas|planta|arbusto|helecho|musgo|césped|corteza|madera|hongo|seta|verdura|vegetal|enredadera)\b/i;
    const etiquetasAnimales = /\b(frog|snake|lizard|sparrow|finch|shrew|bird|insect|beetle|butterfly|moth|caterpillar|worm|monkey|ape|lemur|rodent|rabbit|deer|bear|turtle|tortoise|fish|dog|cat|horse|cow|sheep|goat|pig|elephant|giraffe|zebra|fruit bat|leaf insect|leaf beetle|tree frog|tree snake|tree lizard|tree sparrow|tree finch|tree shrew)\b/i;
    const deteccion = resultados.find((resultado) =>
      clasesVegetales.test(resultado.className) &&
      !etiquetasAnimales.test(resultado.className) &&
      resultado.probability >= 0.04
    );

    if (deteccion) {
      estadoDeteccionFoto = "arbol";
      estado.textContent = `Parece una planta o parte vegetal: ${deteccion.className} (${Math.round(deteccion.probability * 100)}%).`;
      estado.className = "verificacion-foto detectado";
    } else if (proporcionVerde >= 0.1) {
      estadoDeteccionFoto = "arbol";
      estado.textContent = "La imagen contiene bastante vegetación verde. Parece una planta, aunque no se pudo identificar la especie.";
      estado.className = "verificacion-foto detectado";
    } else {
      estadoDeteccionFoto = "no-arbol";
      estado.textContent = "No se reconoció claramente una planta o parte vegetal. Puedes tomar otra foto o confirmar el envío manualmente.";
      estado.className = "verificacion-foto no-detectado";
    }
  } catch (err) {
    if (revision !== revisionFotoActual) return;
    console.error(err);
    estadoDeteccionFoto = "sin-verificar";
    estado.textContent = "No se pudo verificar automáticamente. Puedes continuar y confirmar el envío.";
    estado.className = "verificacion-foto no-detectado";
  }
}

function seleccionarFoto(archivo) {
  if (!archivo) return;
  if (archivo.type && !archivo.type.startsWith("image/")) {
    mostrarMensaje("Selecciona un archivo de imagen.", "error");
    return;
  }
  fotoSeleccionada = archivo;
  const galeria = $("#foto-galeria");
  const camara = $("#foto-camara");
  if (galeria && galeria.files?.[0] !== archivo) galeria.value = "";
  if (camara && camara.files?.[0] !== archivo) camara.value = "";
  if (urlVistaPrevia) URL.revokeObjectURL(urlVistaPrevia);
  urlVistaPrevia = URL.createObjectURL(archivo);
  $("#foto-preview-img").src = urlVistaPrevia;
  $("#foto-nombre").textContent = archivo.name || "Foto seleccionada";
  $("#foto-preview").hidden = false;
  mostrarMensaje("");
  analizarFotoArbol(archivo);
}

["#foto-galeria", "#foto-camara"].forEach((selector) => {
  $(selector).addEventListener("change", (e) => seleccionarFoto(e.target.files?.[0]));
});

async function abrirCamara() {
  const panel = $("#camara-panel");
  const estado = $("#camara-estado");
  panel.hidden = false;
  estado.textContent = "Solicitando permiso para usar la cámara...";
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Este navegador no permite abrir la cámara directamente.");
    flujoCamara = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" } }
    });
    $("#camara-video").srcObject = flujoCamara;
    await $("#camara-video").play();
    estado.textContent = "Enfoca el árbol y captura la foto.";
  } catch (err) {
    console.error(err);
    estado.textContent = "No se pudo abrir la cámara. Intentaremos usar la cámara del dispositivo.";
    $("#foto-camara").click();
  }
}

async function capturarFoto() {
  const video = $("#camara-video");
  if (!video.videoWidth || !video.videoHeight) {
    $("#camara-estado").textContent = "Espera a que la cámara muestre la imagen.";
    return;
  }
  const escala = Math.min(1, 1200 / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * escala);
  canvas.height = Math.round(video.videoHeight * escala);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) {
    $("#camara-estado").textContent = "No se pudo capturar la foto. Intenta de nuevo.";
    return;
  }
  detenerCamara();
  seleccionarFoto(new File([blob], `arbol-${Date.now()}.jpg`, { type: "image/jpeg" }));
}

$("#abrir-camara").addEventListener("click", abrirCamara);
$("#capturar-foto").addEventListener("click", capturarFoto);
$("#cerrar-camara").addEventListener("click", detenerCamara);

$("#quitar-foto")?.addEventListener("click", limpiarFoto);

$("#detalle-arbol").addEventListener("submit", async (e) => {
  const form = e.target.closest(".form-uso-inline");
  if (!form) return;
  e.preventDefault();
  const boton = form.querySelector("button[type=submit]");
  const mensaje = form.querySelector(".uso-form-mensaje");
  boton.disabled = true;
  mensaje.textContent = "Guardando...";

  try {
    await guardarUsoArbol({
      arbolId: arbolSeleccionado,
      parte: form.querySelector("[name='parte']").value,
      descripcion: form.querySelector("[name='descripcion']").value.trim()
    });
  } catch (err) {
    console.error(err);
    mensaje.textContent = err.message || "No se pudo guardar el uso.";
  } finally {
    boton.disabled = false;
  }
});



$("#form-arbol").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const categorias = data.getAll("cat");
  const altura = data.get("alturaArbol");
  const tiposUso = data.getAll("tiposUso");
  const usosPartes = [...$("#usos-partes-lista").querySelectorAll(".uso-parte-fila")].map((fila) => ({
    parte: fila.querySelector("[name='parte']").value,
    descripcion: fila.querySelector("[name='descripcionUso']").value.trim()
  }));

  if (categorias.length === 0) {
    mostrarMensaje("Elige al menos una categoría.", "error");
    return;
  }

  if (!altura) {
    mostrarMensaje("Elige una clasificación de altura.", "error");
    return;
  }

  if (fotoSeleccionada && estadoDeteccionFoto === "analizando") {
    mostrarMensaje("Espera a que termine el análisis de la foto.", "error");
    return;
  }

  if (fotoSeleccionada && estadoDeteccionFoto === "no-arbol" &&
      !window.confirm("No se reconoció claramente un árbol en la imagen. ¿Quieres enviar el aporte de todas formas?")) {
    return;
  }

  const boton = form.querySelector("button[type=submit]");
  boton.disabled = true;
  mostrarMensaje("Enviando...");

  try {
    const foto = await comprimirImagen(fotoSeleccionada || data.get("foto"));
    await guardarArbol({
      nombre: data.get("nombre").trim(),
      cientifico: data.get("cientifico").trim(),
      categorias,
      altura,
      descripcion: data.get("descripcion").trim(),
      usos: data.get("usos").trim(),
      tiposUso,
      usoMedicinal: data.get("usoMedicinal").trim(),
      usosPartes,
      foto,
      autor: data.get("autor").trim() || "Anónimo"
    });
    form.reset();
    actualizarCamposTipoUso();
    $("#usos-partes-lista").replaceChildren();
    limpiarFoto();
    mostrarMensaje("¡Gracias! Tu árbol ya está en el catálogo.", "ok");
  } catch (err) {
    console.error(err);
    mostrarMensaje(err.message || "No se pudo guardar. Intenta de nuevo.", "error");
  } finally {
    boton.disabled = false;
  }
});

// ---------- inicio ----------
inicializarNavegacionPrincipal();
render();
iniciarAlmacenamiento();
