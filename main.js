// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDbz-PJ9OSELTu1tTg2hSPAST8VouWqeEc",
  authDomain: "malla-medicina-unab.firebaseapp.com",
  projectId: "malla-medicina-unab",
  storageBucket: "malla-medicina-unab.appspot.com",
  messagingSenderId: "624124095109",
  appId: "1:624124095109:web:83649db993b8f570afd7ec",
  measurementId: "G-QR06PHWGZX"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginBtn = document.getElementById("loginBtn");
const mallaDiv = document.getElementById("malla");
const appContainer = document.getElementById("app");
const loginContainer = document.getElementById("login-container");
const resumen = document.getElementById("resumen");
const leyenda = document.getElementById("leyenda");

// Leyenda flotante con botón colapsable en móviles
function configurarLeyendaResponsive() {
  const leyendaBtn = document.createElement("button");
  leyendaBtn.textContent = "ℹ️ Ver leyenda";
  leyendaBtn.id = "toggleLeyenda";
  leyendaBtn.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 10000;
    background: #fff;
    color: #333;
    font-weight: bold;
    border-radius: 8px;
    padding: 8px 12px;
    border: 2px solid #3498db;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-size: 14px;
  `;
  document.body.appendChild(leyendaBtn);

  leyenda.style.position = "fixed";
  leyenda.style.top = "70px";
  leyenda.style.left = "20px";
  leyenda.style.backgroundColor = "#fff";
  leyenda.style.borderRadius = "12px";
  leyenda.style.padding = "16px";
  leyenda.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  leyenda.style.zIndex = "9999";
  leyenda.style.width = "240px";
  leyenda.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  leyenda.style.display = "none";

  leyenda.innerHTML = `
    <h4 style="margin-bottom: 10px; font-size: 1rem;">🎨 Significado de colores</h4>
    <div class="leyenda-item"><div class="leyenda-cuadro c-aprobado" style="background-color: #2ecc71;"></div> ✅ Aprobado (ya cursado)</div>
    <div class="leyenda-item"><div class="leyenda-cuadro c-desbloqueado" style="background-color: #3498db;"></div> 📘 Desbloqueado (puedes tomarlo)</div>
    <div class="leyenda-item"><div class="leyenda-cuadro c-bloqueado" style="background-color: #bdc3c7;"></div> 🔒 Bloqueado (faltan requisitos)</div>
    <div class="leyenda-item"><div class="leyenda-cuadro c-anual" style="border: 2px dashed orange;"></div> 🔁 Anual / pendiente</div>
  `;

  leyendaBtn.onclick = () => {
    leyenda.style.display = leyenda.style.display === "none" ? "block" : "none";
  };
}

configurarLeyendaResponsive();

// Crear burbuja de créditos aprobados
const burbujaCreditos = document.createElement("div");
burbujaCreditos.id = "contadorCreditos";
burbujaCreditos.style.position = "fixed";
burbujaCreditos.style.bottom = "20px";
burbujaCreditos.style.right = "20px";
burbujaCreditos.style.background = "linear-gradient(135deg, #2575fc, #6a11cb)";
burbujaCreditos.style.color = "white";
burbujaCreditos.style.padding = "10px 18px";
burbujaCreditos.style.borderRadius = "30px";
burbujaCreditos.style.boxShadow = "0 6px 18px rgba(101, 60, 190, 0.7)";
burbujaCreditos.style.fontWeight = "700";
burbujaCreditos.style.fontSize = "15px";
burbujaCreditos.style.zIndex = "9998";
burbujaCreditos.style.userSelect = "none";
document.body.appendChild(burbujaCreditos);

// Crear burbuja flotante para PPA
const burbujaPPA = document.createElement("div");
burbujaPPA.id = "contadorPPA";
burbujaPPA.style.position = "fixed";
burbujaPPA.style.bottom = "80px";
burbujaPPA.style.right = "20px";
burbujaPPA.style.background = "linear-gradient(135deg, #f857a6, #ff5858)";
burbujaPPA.style.color = "white";
burbujaPPA.style.padding = "10px 18px";
burbujaPPA.style.borderRadius = "30px";
burbujaPPA.style.boxShadow = "0 6px 18px rgba(248, 87, 166, 0.7)";
burbujaPPA.style.fontWeight = "700";
burbujaPPA.style.fontSize = "15px";
burbujaPPA.style.zIndex = "9998";
burbujaPPA.style.userSelect = "none";
document.body.appendChild(burbujaPPA);

// Crear icono flotante para la calculadora
const iconoCalc = document.createElement("div");
iconoCalc.id = "iconoCalculadora";
iconoCalc.title = "Calculadora de promedios por ramo";
iconoCalc.textContent = "📊 Promedios";
iconoCalc.style.cssText = `
  position: fixed;
  bottom: 140px;
  right: 20px;
  background: linear-gradient(135deg, #8e44ad, #2980b9);
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  box-shadow: 0 6px 18px rgba(52, 152, 219, 0.7);
  font-weight: 700;
  font-size: 16px;
  z-index: 9998;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;
iconoCalc.onmouseenter = () => {
  iconoCalc.style.transform = "scale(1.1)";
  iconoCalc.style.boxShadow = "0 8px 24px rgba(52, 152, 219, 0.9)";
};
iconoCalc.onmouseleave = () => {
  iconoCalc.style.transform = "scale(1)";
  iconoCalc.style.boxShadow = "0 6px 18px rgba(52, 152, 219, 0.7)";
};
iconoCalc.onclick = () => abrirCalculadora();
document.body.appendChild(iconoCalc);

let usuario = null;
let datosMalla = [];
let progreso = {};
let promedios = {};

// Login Google
loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithRedirect(provider);
};

// Cambios en autenticación
auth.onAuthStateChanged(async (user) => {
  if (user) {
    usuario = user;
    loginContainer.style.display = "none";
    appContainer.style.display = "block";
    try {
      await cargarMalla();
      await cargarProgreso();
      renderMalla();
    } catch (e) {
      console.error("Error cargando o renderizando:", e);
    }
  } else {
    usuario = null;
    loginContainer.style.display = "block";
    appContainer.style.display = "none";
    datosMalla = [];
    progreso = {};
    promedios = {};
  }
});

// Cargar JSON malla
async function cargarMalla() {
  try {
    const res = await fetch("data/malla.json");
    datosMalla = await res.json();
  } catch (error) {
    console.error("Error cargando malla:", error);
    datosMalla = [];
  }
}

// Cargar progreso y promedios del usuario
async function cargarProgreso() {
  if (!usuario) return (progreso = {}, promedios = {});
  try {
    const ref = db.collection("progresos").doc(usuario.uid);
    const snap = await ref.get();
    if (snap.exists) {
      const data = snap.data();
      progreso = data.progreso || {};
      promedios = data.promedios || {};
    } else {
      progreso = {};
      promedios = {};
    }
  } catch (error) {
    console.error("Error cargando progreso:", error);
    progreso = {};
    promedios = {};
  }
}

// Contar créditos aprobados
function contarCreditosAprobados(ramos, aprobados) {
  return ramos
    .filter(r => aprobados.includes(r.codigo))
    .reduce((suma, r) => suma + r.creditos, 0);
}

// Actualizar burbuja créditos
function actualizarBurbujaCreditos(aprobados, ramos) {
  const total = contarCreditosAprobados(ramos, aprobados);
  burbujaCreditos.textContent = `${total} créditos aprobados`;
}

// Ver si ramo está aprobado
function estaAprobado(ramo, progreso) {
  return progreso[ramo.codigo] === true;
}

// Calcular y mostrar PPA (Promedio Ponderado Acumulado)
function calcularYMostrarPPA() {
  let sumaNotasPorCreditos = 0;
  let sumaCreditos = 0;
  for (const ramo of datosMalla) {
    if (progreso[ramo.codigo] && promedios[ramo.codigo]) {
      const promedio = parseFloat(promedios[ramo.codigo]);
      if (!isNaN(promedio)) {
        sumaNotasPorCreditos += promedio * ramo.creditos;
        sumaCreditos += ramo.creditos;
      }
    }
  }
  if (sumaCreditos > 0) {
    const ppa = (sumaNotasPorCreditos / sumaCreditos).toFixed(2);
    burbujaPPA.textContent = `PPA: ${ppa}`;
  } else {
    burbujaPPA.textContent = `PPA: --`;
  }
}

// Mostrar tooltip con promedio si existe
const tooltip = document.createElement("div");
tooltip.id = "tooltipPromedios";
tooltip.style.position = "absolute";
tooltip.style.background = "rgba(0,0,0,0.75)";
tooltip.style.color = "white";
tooltip.style.padding = "6px 10px";
tooltip.style.borderRadius = "6px";
tooltip.style.fontSize = "13px";
tooltip.style.pointerEvents = "none";
tooltip.style.display = "none";
tooltip.style.zIndex = "9999";
document.body.appendChild(tooltip);

function mostrarTooltip(e, texto) {
  const codigo = e.target.textContent.split(" - ")[0];
  if (promedios[codigo]) {
    texto += `\nPromedio: ${promedios[codigo]}`;
  }
  tooltip.innerText = texto;
  tooltip.style.top = `${e.pageY + 10}px`;
  tooltip.style.left = `${e.pageX + 10}px`;
  tooltip.style.display = "block";
}
function ocultarTooltip() {
  tooltip.style.display = "none";
}

// Renderizar la malla curricular
function renderMalla() {
  mallaDiv.innerHTML = "";
  const agrupadores = [
    { titulo: "1° Semestre", incluye: [1] },
    { titulo: "2° Semestre", incluye: [2] },
    { titulo: "3° Semestre", incluye: [3] },
    { titulo: "4° Semestre", incluye: [4] },
    { titulo: "5° Semestre", incluye: [5] },
    { titulo: "6° Semestre", incluye: [6] },
    { titulo: "7° Semestre", incluye: [7] },
    { titulo: "8° Semestre", incluye: [8] },
    { titulo: "5° Año", incluye: [9, 10] },
    { titulo: "6° Año", incluye: [11, 12] },
    { titulo: "7° Año", incluye: [13, 14] },
  ];

  let aprobadosCount = 0;

  agrupadores.forEach(({ titulo, incluye }) => {
    const contenedor = document.createElement("div");
    contenedor.className = "semestre";
    const encabezado = document.createElement("h3");
    encabezado.textContent = `📘 ${titulo}`;
    contenedor.appendChild(encabezado);

    const fila = document.createElement("div");
    fila.className = "malla-grid";
    const yaRenderizados = new Set();

    datosMalla
      .filter(r => {
        const s = Array.isArray(r.semestre) ? r.semestre : [r.semestre];
        return s.some(sem => incluye.includes(sem));
      })
      .forEach(ramo => {
        if (yaRenderizados.has(ramo.codigo)) return;
        yaRenderizados.add(ramo.codigo);

        const div = document.createElement("div");
        div.className = "ramo bloqueado";
        div.style.background = ramo.color || "#999";
        div.textContent = `${ramo.codigo} - ${ramo.nombre}`;

        const requisitosArray = Array.isArray(ramo.requisitos) ? ramo.requisitos : [];
        const requisitos = requisitosArray.length ? requisitosArray.join(", ") : "Ninguno";
        let tooltipTexto = `Créditos: ${ramo.creditos}\nRequisitos: ${requisitos}`;

        // Verificar si está desbloqueado (cumple requisitos)
        const desbloqueado = !requisitosArray.length ||
          requisitosArray.every(codigoReq => {
            const ramoReq = datosMalla.find(r => r.codigo === codigoReq);
            return ramoReq && estaAprobado(ramoReq, progreso);
          });

        // Si está aprobado
        const aprobado = estaAprobado(ramo, progreso);

        if (desbloqueado) {
          div.classList.remove("bloqueado");
          div.classList.add("desbloqueado");
          div.onclick = async () => {
            try {
              if (progreso[ramo.codigo]) {
                delete progreso[ramo.codigo];
              } else {
                progreso[ramo.codigo] = true;
              }
              await db.collection("progresos").doc(usuario.uid).set({ progreso, promedios }, { merge: true });
              renderMalla();
            } catch (e) {
              console.error("Error guardando progreso:", e);
              alert("Error guardando progreso, intenta nuevamente.");
            }
          };
        }

        if (aprobado) {
          div.classList.add("aprobado");
          div.textContent += " ✅";
          aprobadosCount++;
        }

        div.addEventListener("mouseenter", e => mostrarTooltip(e, tooltipTexto));
        div.addEventListener("mouseleave", ocultarTooltip);
        div.addEventListener("touchstart", e => mostrarTooltip(e, tooltipTexto));
        div.addEventListener("touchend", ocultarTooltip);

        fila.appendChild(div);
      });

    contenedor.appendChild(fila);
    mallaDiv.appendChild(contenedor);
  });

  const porcentaje = datosMalla.length ? Math.round((aprobadosCount / datosMalla.length) * 100) : 0;
  resumen.textContent = `Avance: ${aprobadosCount}/${datosMalla.length} ramos (${porcentaje}%)`;
  actualizarBurbujaCreditos(Object.keys(progreso), datosMalla);
  calcularYMostrarPPA();
}

// --- Calculadora de promedios ---

function abrirCalculadora() {
  if (document.getElementById("calculadoraPromedios")) return; // Evitar abrir doble vez

  // Crear modal
  const modal = document.createElement("div");
  modal.id = "calculadoraPromedios";
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    color: #333;
    padding: 30px 35px;
    border-radius: 20px;
    box-shadow: 0 12px 30px rgba(101, 60, 190, 0.35);
    max-width: 400px;
    width: 90vw;
    z-index: 100000;
    user-select: none;
    animation: modalAppear 0.3s ease forwards;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  `;

  modal.innerHTML = `
    <h3>Calculadora de Promedios</h3>
    <label for="selectRamo">Seleccione ramo:</label>
    <select id="selectRamo" style="width: 100%; margin-bottom: 20px; padding: 10px 12px; font-size: 1rem; font-weight: 600; border: 2px solid #2575fc; border-radius: 10px; color: #2575fc; outline: none; transition: border-color 0.3s ease;">
      ${datosMalla.map(r => `<option value="${r.codigo}">${r.codigo} - ${r.nombre}</option>`).join('')}
    </select>
    <div id="notasContainer" style="max-height: 220px; overflow-y: auto; margin-bottom: 20px; padding-right: 6px;"></div>
    <button id="agregarNotaBtn" style="background-color: #2575fc; color: white; font-weight: 700; font-size: 1.1rem; padding: 12px 24px; border-radius: 12px; border: none; cursor: pointer; width: 100%; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(37,117,252,0.7);">Agregar nota</button>
    <div style="text-align: center; margin-bottom: 20px;">
      <button id="calcularBtn" style="background-color: #6a11cb; color: white; font-weight: 700; font-size: 1.1rem; padding: 12px 30px; border-radius: 12px; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(106,17,203,0.7);">Calcular promedio</button>
    </div>
    <div id="resultadoPromedio" style="font-weight: 700; font-size: 1.4rem; color: #2980b9; text-align: center; margin-bottom: 20px;">Promedio: --</div>
    <button id="cerrarCalcBtn" style="background-color: #e74c3c; color: white; font-weight: 700; font-size: 1rem; padding: 10px 20px; border-radius: 12px; border: none; cursor: pointer; width: 100%; box-shadow: 0 4px 15px rgba(231,76,60,0.8);">Cerrar</button>
  `;

  document.body.appendChild(modal);

  const selectRamo = modal.querySelector("#selectRamo");
  const notasContainer = modal.querySelector("#notasContainer");
  const agregarNotaBtn = modal.querySelector("#agregarNotaBtn");
  const calcularBtn = modal.querySelector("#calcularBtn");
  const resultadoPromedio = modal.querySelector("#resultadoPromedio");
  const cerrarBtn = modal.querySelector("#cerrarCalcBtn");

  function crearFilaNota(valorNota = "", valorPeso = "") {
    const fila = document.createElement("div");
    fila.style.display = "flex";
    fila.style.gap = "10px";
    fila.style.marginBottom = "10px";

    const inputNota = document.createElement("input");
    inputNota.type = "number";
    inputNota.placeholder = "Nota (0-100)";
    inputNota.min = 0;
    inputNota.max = 100;
    inputNota.step = "0.01";
    inputNota.value = valorNota;
    inputNota.style.flex = "2";
    inputNota.style.padding = "8px 10px";
    inputNota.style.border = "1.5px solid #3498db";
    inputNota.style.borderRadius = "10px";
    inputNota.style.fontWeight = "600";
    inputNota.style.fontSize = "1rem";
    inputNota.style.color = "#2575fc";
    inputNota.style.outline = "none";

    const inputPeso = document.createElement("input");
    inputPeso.type = "number";
    inputPeso.placeholder = "Peso %";
    inputPeso.min = 0;
    inputPeso.max = 100;
    inputPeso.step = "1";
    inputPeso.value = valorPeso;
    inputPeso.style.flex = "1";
    inputPeso.style.padding = "8px 10px";
    inputPeso.style.border = "1.5px solid #3498db";
    inputPeso.style.borderRadius = "10px";
    inputPeso.style.fontWeight = "600";
    inputPeso.style.fontSize = "1rem";
    inputPeso.style.color = "#2575fc";
    inputPeso.style.outline = "none";

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "✖";
    btnEliminar.title = "Eliminar nota";
    btnEliminar.style.background = "transparent";
    btnEliminar.style.border = "none";
    btnEliminar.style.color = "#e74c3c";
    btnEliminar.style.fontSize = "1.3rem";
    btnEliminar.style.cursor = "pointer";
    btnEliminar.style.flex = "0";
    btnEliminar.style.alignSelf = "center";

    btnEliminar.onclick = () => {
      fila.remove();
    };

    fila.appendChild(inputNota);
    fila.appendChild(inputPeso);
    fila.appendChild(btnEliminar);

    return fila;
  }

  function cargarNotasGuardadas(codigoRamo) {
    notasContainer.innerHTML = "";
    if (promedios[codigoRamo] && typeof promedios[codigoRamo] === "object" && promedios[codigoRamo].notas) {
      const notas = promedios[codigoRamo].notas;
      notas.forEach(n => {
        const fila = crearFilaNota(n.nota, n.peso);
        notasContainer.appendChild(fila);
      });
    } else {
      // Una fila vacía por defecto
      notasContainer.appendChild(crearFilaNota());
    }
    resultadoPromedio.textContent = `Promedio: --`;
  }

  // Cuando cambia el ramo seleccionado
  selectRamo.onchange = () => {
    cargarNotasGuardadas(selectRamo.value);
  };

  agregarNotaBtn.onclick = () => {
    notasContainer.appendChild(crearFilaNota());
  };

  calcularBtn.onclick = () => {
    const filas = Array.from(notasContainer.children);
    let sumaPesos = 0;
    let sumaPonderada = 0;
    let error = false;

    filas.forEach(fila => {
      const inputs = fila.querySelectorAll("input");
      const nota = parseFloat(inputs[0].value);
      const peso = parseFloat(inputs[1].value);

      if (isNaN(nota) || nota < 0 || nota > 100) {
        error = true;
        alert("Por favor ingresa notas entre 0 y 100.");
        return;
      }
      if (isNaN(peso) || peso < 0 || peso > 100) {
        error = true;
        alert("Por favor ingresa pesos entre 0 y 100.");
        return;
      }

      sumaPesos += peso;
      sumaPonderada += (nota * peso);
    });

    if (error) return;

    if (sumaPesos !== 100) {
      alert("La suma de los pesos debe ser exactamente 100%.");
      return;
    }

    const promedioCalculado = (sumaPonderada / 100).toFixed(2);
    resultadoPromedio.textContent = `Promedio: ${promedioCalculado}`;

    // Guardar promedio y notas en Firebase
    const codigo = selectRamo.value;
    const notasGuardar = filas.map(fila => {
      const inputs = fila.querySelectorAll("input");
      return {
        nota: inputs[0].value,
        peso: inputs[1].value,
      };
    });

    promedios[codigo] = {
      promedio: promedioCalculado,
      notas: notasGuardar,
    };

    guardarPromediosFirebase();
    calcularYMostrarPPA();
  };

  cerrarBtn.onclick = () => {
    modal.remove();
  };

  // Cargar inicialmente las notas para el ramo seleccionado
  cargarNotasGuardadas(selectRamo.value);
}

async function guardarPromediosFirebase() {
  if (!usuario) return;
  try {
    await db.collection("progresos").doc(usuario.uid).set({ progreso, promedios }, { merge: true });
  } catch (error) {
    console.error("Error guardando promedios:", error);
  }
}

// Para el PPA calcular desde el objeto promedios (promedio calculado, no solo el promedio plano)
function calcularYMostrarPPA() {
  let sumaNotasPorCreditos = 0;
  let sumaCreditos = 0;
  for (const ramo of datosMalla) {
    if (progreso[ramo.codigo] && promedios[ramo.codigo] && promedios[ramo.codigo].promedio) {
      const promedio = parseFloat(promedios[ramo.codigo].promedio);
      if (!isNaN(promedio)) {
        sumaNotasPorCreditos += promedio * ramo.creditos;
        sumaCreditos += ramo.creditos;
      }
    }
  }
  if (sumaCreditos > 0) {
    const ppa = (sumaNotasPorCreditos / sumaCreditos).toFixed(2);
    burbujaPPA.textContent = `PPA: ${ppa}`;
  } else {
    burbujaPPA.textContent = `PPA: --`;
  }
}

// CSS para animación modal (puedes poner en styles.css si quieres)
const style = document.createElement('style');
style.textContent = `
  @keyframes modalAppear {
    from {opacity: 0; transform: translate(-50%, -45%) scale(0.8);}
    to {opacity: 1; transform: translate(-50%, -50%) scale(1);}
  }
`;
document.head.appendChild(style);
