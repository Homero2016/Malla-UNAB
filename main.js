// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDbz-PJ9OSELTu1tTg2hSPAST8VouWqeEc",
  authDomain: "malla-medicina-unab.firebaseapp.com",
  projectId: "malla-medicina-unab",
  storageBucket: "malla-medicina-unab.firebasestorage.app",
  messagingSenderId: "624124095109",
  appId: "1:624124095109:web:83649db993b8f570afd7ec",
  measurementId: "G-QR06PHWGZX"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Detectar WebView (como navegador interno de Instagram, Facebook, etc.)
function esWebView() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return (/FBAN|FBAV|Instagram|Line|WhatsApp|Twitter/i.test(ua));
}

if (esWebView()) {
  alert("⚠️ Estás usando esta app desde un navegador dentro de una app (como Instagram o Facebook). Abre este sitio en Google Chrome o Safari para que funcione correctamente.");
}

// Elementos DOM
const loginBtn = document.getElementById("loginBtn");
const mallaDiv = document.getElementById("malla");
const appContainer = document.getElementById("app");
const loginContainer = document.getElementById("login-container");
const resumen = document.getElementById("resumen");

// Crear burbuja créditos
const burbujaCreditos = document.createElement("div");
burbujaCreditos.id = "contadorCreditos";
Object.assign(burbujaCreditos.style, {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  background: "#2ecc71",
  color: "white",
  padding: "12px 20px",
  borderRadius: "30px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  fontWeight: "bold",
  fontSize: "16px",
  zIndex: "9999"
});
document.body.appendChild(burbujaCreditos);

// Variables
let usuario = null;
let datosMalla = [];
let progreso = {};

// Evento login: popup en PC, redirect en celular/tablet
loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  if (window.innerWidth < 768) {
    auth.signInWithRedirect(provider);
  } else {
    auth.signInWithPopup(provider).catch(() => {
      auth.signInWithRedirect(provider);
    });
  }
};

// Procesar resultado de redirect
auth.getRedirectResult().catch(error => {
  console.error("Error en getRedirectResult:", error);
});

// Escuchar autenticación
auth.onAuthStateChanged(async (user) => {
  if (user) {
    if (usuario && usuario.uid === user.uid) return;

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
  }
});

// Funciones principales
async function cargarMalla() {
  try {
    const res = await fetch("data/malla.json");
    datosMalla = await res.json();
  } catch (error) {
    console.error("Error cargando malla:", error);
    datosMalla = [];
  }
}

async function cargarProgreso() {
  if (!usuario) {
    progreso = {};
    return;
  }
  try {
    const ref = db.collection("progresos").doc(usuario.uid);
    const snap = await ref.get();
    progreso = snap.exists ? snap.data() : {};
  } catch (error) {
    console.error("Error cargando progreso:", error);
    progreso = {};
  }
}

function contarCreditosAprobados(ramos, aprobados) {
  return ramos
    .filter(ramo => aprobados.includes(ramo.codigo))
    .reduce((suma, ramo) => suma + ramo.creditos, 0);
}

function actualizarBurbujaCreditos(aprobados, ramos) {
  const total = contarCreditosAprobados(ramos, aprobados);
  burbujaCreditos.textContent = `${total} créditos aprobados`;
}

function estaAprobado(ramo, progreso, semestresAprobados) {
  if (ramo.tipo === "anual") {
    return progreso[ramo.codigo] && semestresAprobados.includes("7") && semestresAprobados.includes("8");
  } else {
    return progreso[ramo.codigo];
  }
}

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
    { titulo: "7° Año", incluye: [13, 14] }
  ];

  let aprobados = 0;

  const semestresAprobados = Object.entries(progreso)
    .map(([codigo]) => {
      const ramo = datosMalla.find(r => r.codigo === codigo);
      return ramo ? (Array.isArray(ramo.semestre) ? ramo.semestre : [ramo.semestre]) : [];
    })
    .flat()
    .map(s => s.toString());

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
        div.textContent = ramo.nombre;

        const requisitosArray = Array.isArray(ramo.requisitos) ? ramo.requisitos : [];
        const requisitos = requisitosArray.join(", ") || "Ninguno";
        div.title = `Créditos: ${ramo.creditos}\nRequisitos: ${requisitos}`;

        const desbloqueado = !requisitosArray.length || requisitosArray.every(codigoReq => {
          const ramoReq = datosMalla.find(r => r.codigo === codigoReq);
          return ramoReq && estaAprobado(ramoReq, progreso, semestresAprobados);
        });

        const aprobado = estaAprobado(ramo, progreso, semestresAprobados);

        if (desbloqueado) {
          div.classList.remove("bloqueado");
          div.classList.add("desbloqueado");
          div.style.outline = "3px dashed #ffffff";
          div.style.filter = "brightness(1.1)";
          div.style.transform = "scale(1.02)";
          div.style.transition = "all 0.3s";

          div.onclick = async () => {
            if (progreso[ramo.codigo]) {
              delete progreso[ramo.codigo];
            } else {
              progreso[ramo.codigo] = true;
            }
            await db.collection("progresos").doc(usuario.uid).set(progreso);
            renderMalla();
          };
        }

        if (aprobado) {
          div.classList.add("aprobado");
          div.textContent += " ✅";
          aprobados++;
        } else if (ramo.tipo === "anual" && progreso[ramo.codigo]) {
          div.classList.add("pendiente-anual");
          div.textContent += " ⏳";
        }

        fila.appendChild(div);
      });

    contenedor.appendChild(fila);
    mallaDiv.appendChild(contenedor);
  });

  const porcentaje = datosMalla.length ? Math.round((aprobados / datosMalla.length) * 100) : 0;
  resumen.textContent = `Avance: ${aprobados}/${datosMalla.length} ramos (${porcentaje}%)`;

  actualizarBurbujaCreditos(Object.keys(progreso), datosMalla);
}
