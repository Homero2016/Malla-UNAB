const firebaseConfig = {
  apiKey: "AIzaSyDbz-PJ9OSELTu1tTg2hSPAST8VouWqeEc",
  authDomain: "malla-medicina-unab.firebaseapp.com",
  projectId: "malla-medicina-unab",
  storageBucket: "malla-medicina-unab.firebasestorage.app",
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

let usuario = null;
let datosMalla = [];
let progreso = {};

loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(console.error);
};

auth.onAuthStateChanged(async (user) => {
  if (user) {
    usuario = user;
    loginContainer.style.display = 'none';
    appContainer.style.display = 'block';
    try {
      await cargarMalla();
      await cargarProgreso();
      renderMalla();
    } catch (error) {
      console.error("Error al cargar datos o renderizar:", error);
    }
  } else {
    // Usuario no logueado: mostrar login, ocultar app
    loginContainer.style.display = 'block';
    appContainer.style.display = 'none';
    usuario = null;
    datosMalla = [];
    progreso = {};
  }
});

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
  try {
    const ref = db.collection("progresos").doc(usuario.uid);
    const snap = await ref.get();
    progreso = snap.exists ? snap.data() : {};
  } catch (error) {
    console.error("Error cargando progreso:", error);
    progreso = {};
  }
}

function estaAprobado(ramo, progreso, semestresAprobados) {
  if (ramo.tipo === "anual") {
    // Considera flexibilizar esto según necesidad
    return progreso[ramo.codigo] &&
           semestresAprobados.includes("7") &&
           semestresAprobados.includes("8");
  } else {
    return progreso[ramo.codigo];
  }
}

function renderMalla() {
  mallaDiv.innerHTML = '';

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
        try {
          if (yaRenderizados.has(ramo.codigo)) return;
          yaRenderizados.add(ramo.codigo);

          const div = document.createElement("div");
          div.className = "ramo bloqueado";
          div.style.background = ramo.color;
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
        } catch (e) {
          console.error("Error renderizando ramo", ramo.codigo, e);
        }
      });

    contenedor.appendChild(fila);
    mallaDiv.appendChild(contenedor);
  });

  const porcentaje = datosMalla.length ? Math.round((aprobados / datosMalla.length) * 100) : 0;
  resumen.textContent = `Avance: ${aprobados}/${datosMalla.length} ramos (${porcentaje}%)`;
}
