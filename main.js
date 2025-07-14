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
    await cargarMalla();
    await cargarProgreso();
    renderMalla();
  }
});

async function cargarMalla() {
  const res = await fetch("data/malla.json");
  datosMalla = await res.json();
}

async function cargarProgreso() {
  const ref = db.collection("progresos").doc(usuario.uid);
  const snap = await ref.get();
  progreso = snap.exists ? snap.data() : {};
}

function renderMalla() {
  mallaDiv.innerHTML = '';

  const semestres = [...new Set(datosMalla.map(r => r.semestre))].sort((a, b) => a - b);
  let aprobados = 0;

  semestres.forEach(semestre => {
    const contenedor = document.createElement("div");
    contenedor.className = "semestre";

    const titulo = document.createElement("h3");
    titulo.textContent = `📘 ${semestre}° Semestre`;
    contenedor.appendChild(titulo);

    const fila = document.createElement("div");
    fila.className = "malla-grid";

    datosMalla
      .filter(r => r.semestre === semestre)
      .forEach(ramo => {
        const div = document.createElement("div");
        div.className = "ramo bloqueado";
        div.style.background = ramo.color;
        div.textContent = ramo.nombre;

        const requisitos = ramo.requisitos?.join(", ") || "Ninguno";
        div.title = `Créditos: ${ramo.creditos}\nRequisitos: ${requisitos}`;

        const desbloqueado = !ramo.requisitos.length || ramo.requisitos.every(r => progreso[r]);
        const aprobado = progreso[ramo.codigo];

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
          div.innerHTML += " ✅";
          aprobados++;
        }

        fila.appendChild(div);
      });

    contenedor.appendChild(fila);
    mallaDiv.appendChild(contenedor);
  });

  const porcentaje = Math.round((aprobados / datosMalla.length) * 100);
  resumen.textContent = `Avance: ${aprobados}/${datosMalla.length} ramos (${porcentaje}%)`;
}
