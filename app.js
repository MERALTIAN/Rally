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
const MODO_DEMO = firebaseConfig.apiKey === "TU_API_KEY";

const CATEGORIAS = {
  frutal: "🍎 Frutal",
  floral: "🌸 Floral",
  medicinal: "🌿 Medicinal",
  sombra: "⛱️ Sombra",
  forraje: "🐄 Forraje / abono",
  desechos: "♻️ Desechos"
};

// Árboles de ejemplo (siempre visibles). Los usos medicinales son tradicionales.
const ARBOLES_BASE = [
  {
    nombre: "Neem", cientifico: "Azadirachta indica",
    categorias: ["medicinal", "sombra"],
    descripcion: "Árbol de crecimiento rápido, resistente a la sequía y con buena sombra.",
    usos: "Las hojas trituradas van al compost o se usan para preparar un biopesticida casero. Tradicionalmente se usa en infusiones y lavados. Las ramas sirven de leña."
  },
  {
    nombre: "Guanábana", cientifico: "Annona muricata",
    categorias: ["frutal", "medicinal"],
    descripcion: "Árbol pequeño de hojas brillantes que da frutos grandes y aromáticos.",
    usos: "El fruto se aprovecha en refrescos y helados. Las hojas se usan tradicionalmente en infusión, y las hojas secas pueden ir al compost."
  },
  {
    nombre: "Moringa", cientifico: "Moringa oleifera",
    categorias: ["medicinal", "forraje"],
    descripcion: "Árbol de rápido rebrote que tolera podas frecuentes, con hojas pequeñas y nutritivas.",
    usos: "La poda genera mucha biomasa verde para forraje y abono. Las hojas se consumen frescas o secas y las semillas se usan para clarificar agua de forma tradicional."
  },
  {
    nombre: "Madero negro", cientifico: "Gliricidia sepium",
    categorias: ["forraje", "floral"],
    descripcion: "Árbol que se usa como cerco vivo y que florece de rosado en la época seca.",
    usos: "Su follaje, rico en nitrógeno, sirve de abono verde y forraje. Las ramas se usan como estacas para nuevos cercos y como leña."
  },
  {
    nombre: "Cortez amarillo", cientifico: "Tabebuia ochracea",
    categorias: ["floral", "sombra"],
    descripcion: "Árbol que cubre su copa de flores amarillas al final de la época seca.",
    usos: "Las flores y hojas caídas se pueden compostar o dejar como cobertura (mulch) bajo el árbol. Las ramas gruesas se astillan para acolchar parques y jardines."
  },
  {
    nombre: "Mango", cientifico: "Mangifera indica",
    categorias: ["frutal", "sombra"],
    descripcion: "Árbol grande y frondoso, muy común en patios y calles.",
    usos: "Además del fruto, las ramas podadas se astillan para mulch o leña. Sus hojas son coriáceas y tardan en descomponerse, por lo que conviene triturarlas antes de compostarlas."
  },
  {
    nombre: "Guácimo", cientifico: "Guazuma ulmifolia",
    categorias: ["forraje", "sombra", "medicinal"],
    descripcion: "Árbol de copa amplia, común en potreros y zonas secas.",
    usos: "Hojas y frutos se usan como forraje para el ganado. La corteza y las hojas tienen usos tradicionales en infusión. La poda se composta o se astilla."
  },
  {
    nombre: "Malinche", cientifico: "Delonix regia",
    categorias: ["floral", "sombra"],
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
  const contenido = [
    { valor: "desechos", titulo: "Desechos / aprovechamiento", detalle: arbol.usoDesechos },
    { valor: "medicinal", titulo: "Uso medicinal tradicional", detalle: arbol.usoMedicinal }
  ].filter((tipo) => tipos.includes(tipo.valor)).map((tipo) =>
    `<p><span>${tipo.titulo}:</span> ${esc(tipo.detalle || "Sin detalle agregado.")}</p>`
  ).join("");

  return `<section class="clasificacion-usos" aria-label="Desechos y uso medicinal">
    <strong>Desechos y uso medicinal</strong>
    ${contenido || `<p class="usos-sin-detalle">Aún no se ha indicado si este árbol tiene usos de aprovechamiento o medicinales.</p>`}
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
  const etiquetas = (arbol.categorias || [])
    .filter((categoria) => CATEGORIAS[categoria])
    .map((categoria) => `<span class="etiqueta">${CATEGORIAS[categoria]}</span>`).join("");
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
    const coincideCat = categoriaActiva === "todas" || (a.categorias || []).includes(categoriaActiva);
    const otrosUsos = (a.usosPartes || []).map((item) => `${item.parte} ${item.descripcion}`).join(" ");
    const tiposUso = `${(a.tiposUso || []).join(" ")} ${a.usoDesechos || ""} ${a.usoMedicinal || ""}`;
    const texto = `${a.nombre || ""} ${a.cientifico || ""} ${a.descripcion || ""} ${a.usos || ""} ${otrosUsos} ${tiposUso}`.toLowerCase();
    return coincideCat && (!q || texto.includes(q));
  });

  $("#lista").innerHTML = visibles.map((a) => {
    const foto = fotoSegura(a.foto);
    const etiquetas = (a.categorias || [])
      .filter((c) => CATEGORIAS[c])
      .map((c) => `<span class="etiqueta">${CATEGORIAS[c]}</span>`).join("");
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

async function iniciarAlmacenamiento() {
  if (MODO_DEMO) {
    const guardados = JSON.parse(localStorage.getItem("arboles_comunidad") || "[]");
    arboles = [...ARBOLES_BASE, ...guardados];
    render();
    mostrarMensaje("Modo demo: los aportes se guardan solo en este navegador. Configura Firebase en app.js.", "ok");
    return;
  }

  const base = "https://www.gstatic.com/firebasejs/10.12.0";
  const [{ initializeApp }, firestore] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-firestore.js`)
  ]);
  const db = firestore.getFirestore(initializeApp(firebaseConfig));
  fb = { db, ...firestore };

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
  const tiposUso = data.getAll("tiposUso");
  const usosPartes = [...$("#usos-partes-lista").querySelectorAll(".uso-parte-fila")].map((fila) => ({
    parte: fila.querySelector("[name='parte']").value,
    descripcion: fila.querySelector("[name='descripcionUso']").value.trim()
  }));

  if (categorias.length === 0) {
    mostrarMensaje("Elige al menos una categoría.", "error");
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
      descripcion: data.get("descripcion").trim(),
      usos: data.get("usos").trim(),
      tiposUso,
      usoDesechos: data.get("usoDesechos").trim(),
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
render();
iniciarAlmacenamiento();
