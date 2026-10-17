const textos = {
  1: "El casco protege la cabeza y integra la electrónica. " +
     "Observa la cúpula azul. ¿Qué componentes añadirías para señalizar giros?",
  2: "Un sensor de movimiento (acelerómetro/giroscopio MPU6050) mide la " +
     "inclinación de la cabeza. Identifica la placa verde sobre el casco.",
  3: "Dos luces direccionales, izquierda y derecha, parpadean según el giro. " +
     "Observa cuál se enciende al inclinarse el casco.",
  4: "Mueve el control de inclinación. Pasados ±15° se activa la luz " +
     "del lado hacia el que te inclinas.",
  5: "Sistema completo: el sensor mide, Arduino decide y las luces avisan. " +
     "Simulación automática de un ciclista que gira a ambos lados."
};

const selector = document.querySelector("#pagina");
const sistema = document.querySelector("#sistema");
const estado = document.querySelector("#estado");
const boton = document.querySelector("#pausa");
const marcador = document.querySelector("#marcador");
const slider = document.querySelector("#inclinacion");
const etiqueta = document.querySelector("#valorAngulo");
const selectorCamara = document.querySelector("#camara");

const CLAVE_CAMARA = "casco-ra-camara";
let cambiandoCamara = false;
let streamPreparado;

function mejorarEnfoque(pista) {
  if (!pista?.getCapabilities || !pista.applyConstraints) return;

  const capacidades = pista.getCapabilities();
  const ajustes = {};

  if (capacidades.focusMode?.includes("continuous")) {
    ajustes.focusMode = "continuous";
  }

  if (capacidades.zoom) {
    ajustes.zoom = Math.min(
      capacidades.zoom.max,
      Math.max(capacidades.zoom.min, 1)
    );
  }

  if (Object.keys(ajustes).length) {
    pista.applyConstraints({advanced: [ajustes]}).catch(() => {});
  }
}

async function cambiarCamara(deviceId) {
  if (!deviceId || cambiandoCamara) return;

  const video = document.querySelector("#arjs-video");
  if (!video) return;

  cambiandoCamara = true;
  selectorCamara.disabled = true;
  estado.textContent = "Cambiando cámara…";

  video.srcObject?.getTracks().forEach(track => track.stop());

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        deviceId: {exact: deviceId},
        width: {ideal: 960},
        height: {ideal: 720},
        frameRate: {ideal: 24, max: 30}
      }
    });

    video.srcObject = stream;
    await video.play();
    mejorarEnfoque(stream.getVideoTracks()[0]);
    localStorage.setItem(CLAVE_CAMARA, deviceId);
    window.dispatchEvent(new Event("resize"));
    estado.textContent = "Cámara lista. Enfoca el marcador Hiro completo.";
  } catch (error) {
    localStorage.removeItem(CLAVE_CAMARA);
    estado.textContent = "No se pudo abrir esa cámara. Recargando la cámara automática…";
    setTimeout(() => location.reload(), 1200);
  } finally {
    cambiandoCamara = false;
    selectorCamara.disabled = false;
  }
}

async function prepararSelectorCamara(stream) {
  const pistaActiva = stream.getVideoTracks()[0];
  mejorarEnfoque(pistaActiva);

  const activa = pistaActiva.getSettings?.().deviceId;
  const dispositivos = await navigator.mediaDevices.enumerateDevices();
  const camaras = dispositivos.filter(dispositivo => dispositivo.kind === "videoinput");

  selectorCamara.replaceChildren();
  camaras.forEach((camara, indice) => {
    const opcion = document.createElement("option");
    opcion.value = camara.deviceId;
    opcion.textContent = `${indice + 1}. ${camara.label || "Cámara"}`;
    selectorCamara.appendChild(opcion);
  });

  const guardada = localStorage.getItem(CLAVE_CAMARA);
  const guardadaExiste = camaras.some(camara => camara.deviceId === guardada);
  const seleccionada = guardadaExiste ? guardada : activa;

  if (seleccionada) selectorCamara.value = seleccionada;
  selectorCamara.disabled = camaras.length < 2;

  if (guardadaExiste && guardada !== activa) {
    await cambiarCamara(guardada);
  }
}

function iniciarSelectorCamara(stream) {
  if (!stream || stream === streamPreparado) return;
  streamPreparado = stream;

  prepararSelectorCamara(stream).catch(error => {
    console.warn("No se pudieron enumerar las cámaras:", error);
    selectorCamara.replaceChildren(new Option("Cámaras no disponibles", ""));
    selectorCamara.disabled = true;
  });
}

function buscarCamaraActiva() {
  iniciarSelectorCamara(document.querySelector("#arjs-video")?.srcObject);
}

window.addEventListener("camera-init", event => {
  iniciarSelectorCamara(event.detail.stream);
});

// Si el permiso ya estaba concedido, AR.js puede iniciar la cámara antes de
// que este script termine de registrarse y añadir el video después del evento.
const observadorVideo = new MutationObserver(buscarCamaraActiva);
observadorVideo.observe(document.body, {childList: true, subtree: true});
buscarCamaraActiva();

selectorCamara.addEventListener("change", () => {
  cambiarCamara(selectorCamara.value);
});

function mostrarPagina() {
  const p = selector.value;
  document.querySelector("#contenido").textContent = textos[p];

  sistema.querySelectorAll("[data-paginas]").forEach(el => {
    el.setAttribute("visible", el.dataset.paginas.split(" ").includes(p));
  });

  slider.disabled = p !== "4";
  slider.value = 0;
  etiqueta.textContent = "0";
  sistema.setAttribute("casco-ciclista", {auto: p === "3" || p === "5", angulo: 0});
}

selector.addEventListener("change", mostrarPagina);
sistema.addEventListener("loaded", mostrarPagina);
mostrarPagina();

slider.addEventListener("input", () => {
  etiqueta.textContent = slider.value;
  sistema.setAttribute("casco-ciclista", "angulo", Number(slider.value));
});

sistema.addEventListener("direccion", e => {
  const l = e.detail.lado;
  estado.textContent = l === "ninguno"
    ? "Casco recto: luces apagadas."
    : "Giro a la " + l + ": direccional " + l + " parpadeando.";
});

let enPausa = false;
boton.addEventListener("click", () => {
  enPausa = !enPausa;
  enPausa ? sistema.pause() : sistema.play();
  boton.textContent = enPausa ? "Continuar" : "Pausar";
});

marcador.addEventListener("markerFound", () => {
  estado.textContent = "Marcador detectado. Selecciona tu página.";
});
marcador.addEventListener("markerLost", () => {
  estado.textContent = "Vuelve a enfocar el marcador completo.";
});
window.addEventListener("camera-error", () => {
  estado.textContent = "Revisa HTTPS, permisos y disponibilidad de cámara.";
});
