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
const panel = document.querySelector("#panel");
const botonPanel = document.querySelector("#alternarPanel");
const textoGuia = document.querySelector("#textoGuia");
const automatico = document.querySelector("#automatico");

const CLAVE_CAMARA = "casco-ra-camara-v2";
let cambiandoCamara = false;
let streamPreparado;

function mejorarEnfoque(pista) {
  if (!pista?.getCapabilities || !pista.applyConstraints) return;

  const capacidades = pista.getCapabilities();
  const ajustes = {};

  if (capacidades.focusMode?.includes("continuous")) {
    ajustes.focusMode = "continuous";
  }

  if (capacidades.exposureMode?.includes("continuous")) {
    ajustes.exposureMode = "continuous";
  }

  if (capacidades.whiteBalanceMode?.includes("continuous")) {
    ajustes.whiteBalanceMode = "continuous";
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
  const camarasTraseras = camaras.filter(camara =>
    /back|rear|environment|trasera/i.test(camara.label)
  );
  const principal = camarasTraseras.find(camara =>
    /camera\s*0(?:\D|$)/i.test(camara.label)
  ) || camarasTraseras[0];
  const seleccionada = guardadaExiste ? guardada : principal?.deviceId || activa;

  if (seleccionada) selectorCamara.value = seleccionada;
  selectorCamara.disabled = camaras.length < 2;

  if (seleccionada && seleccionada !== activa) {
    await cambiarCamara(seleccionada);
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

botonPanel.addEventListener("click", () => {
  const minimizado = panel.classList.toggle("minimizado");
  botonPanel.textContent = minimizado ? "Controles" : "Ocultar";
  botonPanel.setAttribute("aria-expanded", String(!minimizado));
});

function mostrarPagina() {
  const p = selector.value;
  document.querySelector("#contenido").textContent = textos[p];

  sistema.querySelectorAll("[data-paginas]").forEach(el => {
    el.setAttribute("visible", el.dataset.paginas.split(" ").includes(p));
  });

  slider.value = 0;
  etiqueta.textContent = "0";
  automatico.checked = false;
  sistema.setAttribute("casco-ciclista", {auto: false, angulo: 0});
}

selector.addEventListener("change", mostrarPagina);
sistema.addEventListener("loaded", mostrarPagina);
mostrarPagina();

slider.addEventListener("input", () => {
  automatico.checked = false;
  etiqueta.textContent = slider.value;
  sistema.setAttribute("casco-ciclista", {
    auto: false,
    angulo: Number(slider.value)
  });
});

automatico.addEventListener("change", () => {
  sistema.setAttribute("casco-ciclista", {
    auto: automatico.checked,
    angulo: Number(slider.value)
  });
  estado.textContent = automatico.checked
    ? "Simulación automática activada."
    : "Control manual activado: mueve el deslizador.";
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
  document.body.classList.add("marcador-detectado");
  textoGuia.textContent = "Hiro detectado";
});
marcador.addEventListener("markerLost", () => {
  estado.textContent = "Vuelve a enfocar el marcador completo.";
  document.body.classList.remove("marcador-detectado");
  textoGuia.textContent = "Coloca aquí todo el cuadrado Hiro";
});
window.addEventListener("camera-error", () => {
  estado.textContent = "Revisa HTTPS, permisos y disponibilidad de cámara.";
});
