// Componente: casco de ciclista con direccionales según inclinación.
// Convención: ángulo negativo = inclinación a la izquierda; positivo = derecha.
const THREE = AFRAME.THREE;

AFRAME.registerComponent("casco-ciclista", {
  schema: {
    angulo: {type: "number", default: 0},
    giro:   {type: "number", default: 0},
    umbral: {type: "number", default: 15},
    auto:   {type: "boolean", default: false}
  },

  init: function () {
    const crear = (tag, atributos, padre) => {
      const e = document.createElement(tag);
      Object.entries(atributos).forEach(([k, v]) => e.setAttribute(k, v));
      padre.appendChild(e);
      return e;
    };

    this.cuerpo = crear("a-entity", {}, this.el);

    // Página 1: carcasa alargada, borde, visera y detalles de seguridad.
    crear("a-sphere", {radius: 0.52, "theta-length": 102,
      "segments-width": 28, "segments-height": 14, scale: "1.18 1 0.86",
      color: "#1688dc", material: "shader: standard; side: double; roughness: .62; metalness: .08"}, this.cuerpo);
    crear("a-torus", {radius: 0.5, "radius-tubular": 0.03, rotation: "90 0 0",
      scale: "1.18 1 0.86", color: "#eaf7ff",
      material: "shader: standard; roughness: .45; metalness: .2"}, this.cuerpo);
    crear("a-box", {position: "0.57 0.02 0", width: 0.34, height: 0.035,
      depth: 0.55, rotation: "0 0 -7", color: "#0b4c86",
      material: "shader: standard; roughness: .55; metalness: .15"}, this.cuerpo);
    crear("a-box", {position: "-0.54 0.19 0", width: 0.16, height: 0.065,
      depth: 0.54, rotation: "0 0 10", color: "#0b4c86",
      material: "shader: standard; roughness: .6"}, this.cuerpo);

    // Ventilaciones superiores.
    [["-0.27 0.43 0", "0 0 -24"], ["0 0.505 0", "0 0 0"],
      ["0.27 0.43 0", "0 0 24"]].forEach(([position, rotation]) => {
      crear("a-box", {position, rotation, width: 0.09, height: 0.025,
        depth: 0.38, color: "#092235",
        material: "shader: standard; roughness: .5; metalness: .15"}, this.cuerpo);
    });

    // Placas laterales, correas y hebilla.
    [-1, 1].forEach(lado => {
      crear("a-cylinder", {position: `0 0.06 ${lado * 0.445}`, radius: 0.16,
        height: 0.032, rotation: "90 0 0", color: "#0d5f9f",
        material: "shader: standard; roughness: .55; metalness: .18"}, this.cuerpo);
      crear("a-cylinder", {position: `0.19 -0.25 ${lado * 0.34}`, radius: 0.018,
        height: 0.64, rotation: "0 0 -20", color: "#202b34"}, this.cuerpo);
      crear("a-cylinder", {position: `-0.19 -0.25 ${lado * 0.34}`, radius: 0.018,
        height: 0.64, rotation: "0 0 20", color: "#202b34"}, this.cuerpo);
    });
    crear("a-box", {position: "0 -0.5 0.34", width: 0.12, height: 0.07,
      depth: 0.05, color: "#ff9f1c", material: "shader: standard; metalness: .2"}, this.cuerpo);

    // Página 2: sensor de movimiento (MPU6050)
    const sensor = crear("a-entity", {"data-paginas": "2 4 5"}, this.cuerpo);
    crear("a-box", {position: "0 0.55 0", width: 0.25, height: 0.038,
      depth: 0.18, color: "#2ea44f", material: "shader: standard; roughness: .6"}, sensor);
    crear("a-box", {position: "0 0.579 0", width: 0.09, height: 0.022,
      depth: 0.09, color: "#172027", material: "shader: standard; metalness: .25"}, sensor);

    // Página 3: direccionales planas, ajustadas a la curvatura del casco.
    const luz = lado => {
      const soporte = crear("a-entity", {
        position: `${lado * 0.43} 0.1 0.3`,
        rotation: `0 ${lado * 38} 0`,
        "data-paginas": "3 4 5"
      }, this.cuerpo);
      crear("a-circle", {radius: 0.092, color: "#102638",
        material: "shader: standard; roughness: .55; metalness: .2"}, soporte);
      return crear("a-circle", {position: "0 0 0.006", radius: 0.065,
        color: "#4b3210",
        material: "shader: standard; emissive: #120b02; emissiveIntensity: .2"}, soporte);
    };
    this.luzI = luz(-1);
    this.luzD = luz(1);

    this.ang = 0;
    this.giro = 0;
    this.lado = "ninguno";
    this.pintado = "";
  },

  update: function () {
    if (!this.data.auto) this.ang = this.data.angulo;
    this.giro = this.data.giro;
  },

  tick: function (t) {
    if (this.data.auto) this.ang = 30 * Math.sin(t / 2000);

    this.cuerpo.object3D.rotation.y = THREE.MathUtils.degToRad(this.giro);
    this.cuerpo.object3D.rotation.z = -THREE.MathUtils.degToRad(this.ang);

    const u = this.data.umbral;
    const lado = this.ang < -u ? "izquierda" : this.ang > u ? "derecha" : "ninguno";
    const on = Math.floor(t / 400) % 2 === 0;

    if (lado !== this.lado) {
      this.lado = lado;
      this.el.emit("direccion", {lado: lado});
    }

    const huella = lado + on;
    if (huella === this.pintado) return;
    this.pintado = huella;

    const ENC = "#ffb000", APA = "#4b3210";
    this.luzI.setAttribute("color", lado === "izquierda" && on ? ENC : APA);
    this.luzD.setAttribute("color", lado === "derecha" && on ? ENC : APA);
    this.luzI.setAttribute("material", "emissive", lado === "izquierda" && on ? "#ff7800" : "#120b02");
    this.luzD.setAttribute("material", "emissive", lado === "derecha" && on ? "#ff7800" : "#120b02");
  }
});
