const conteneur = document.getElementById("conteneur");
const labyrinthe = document.getElementById("labyrinthe");
const truc = document.getElementById("truc");
const maison = document.getElementById("maison");
const emo = document.getElementById("emo");

const hautBtn = document.getElementById("hautBtn");
const basBtn = document.getElementById("basBtn");
const gaucheBtn = document.getElementById("gaucheBtn");
const droiteBtn = document.getElementById("droiteBtn");

const pas = 20;
const taille = 20;
const largeurBarriere = 2;
const hauteurLabyrinthe = 200;
const largeurLabyrinthe = 300;
let nogoX = [];
let nogoX2 = [];
let nogoY = [];
let nogoY2 = [];
let distancePrecedente = largeurLabyrinthe * 2;

// variables pour l'inclinaison
let dernierUD = 0;
let dernierLR = 0;
const seuilMouvement = 15;
let premierMouvement = true;
let autoriserInclinaison = true;

// variables pour le balayage
const seuilBalayage = 15;

// variables pour le défilement
const seuilDéfilement = 20;

// génération des côtés et position de départ
genererCotes();

// définir la taille
let my = hauteurLabyrinthe / pas;
let mx = largeurLabyrinthe / pas;

// créer la grille complète
let grille = [];
for (let i = 0; i < my; i++) {
	let sousGrille = [];
	for (let a = 0; a < mx; a++) {
		sousGrille.push({ haut: 0, bas: 0, gauche: 0, droite: 0, visité: 0 });
	}
	grille.push(sousGrille);
}

// créer des tableaux de directions
let directions = ["haut", "bas", "gauche", "droite"];
let modDirection = {
	haut: { y: -1, x: 0, oppose: "bas" },
	bas: { y: 1, x: 0, oppose: "haut" },
	gauche: { y: 0, x: -1, oppose: "droite" },
	droite: { y: 0, x: 1, oppose: "gauche" }
};

// générer le labyrinthe
genererLabyrinthe(0, 0, 0);
dessinerLabyrinthe();

// obtenir toutes les barrières
const barrieres = document.getElementsByClassName("barriere");
for (let b = 0; b < barrieres.length; b++) {
	nogoX.push(barrieres[b].offsetLeft);
	nogoX2.push(barrieres[b].offsetLeft + barrieres[b].clientWidth);
	nogoY.push(barrieres[b].offsetTop);
	nogoY2.push(barrieres[b].offsetTop + barrieres[b].clientHeight);
}

document.addEventListener("keydown", touches);

function touches(e) {
	let code = e.code;
	switch (code) {
		// flèches
		case "ArrowUp":
			haut();
			break;
		case "ArrowDown":
			bas();
			break;
		case "ArrowLeft":
			gauche();
			break;
		case "ArrowRight":
			droite();
			break;
		// wasd
		case "KeyW":
			haut();
			break;
		case "KeyS":
			bas();
			break;
		case "KeyA":
			gauche();
			break;
		case "KeyD":
			droite();
			break;
	}
}

hautBtn.addEventListener("click", (e) => {
	haut();
	premierMouvement = true;
});
basBtn.addEventListener("click", (e) => {
	bas();
	premierMouvement = true;
});
gaucheBtn.addEventListener("click", (e) => {
	gauche();
	premierMouvement = true;
});
droiteBtn.addEventListener("click", (e) => {
	droite();
	premierMouvement = true;
});

function haut() {
	animerTouches(hautBtn);
	if (verifierLimiteY("haut")) {
		truc.style.top = truc.offsetTop - pas + "px";
		mettreAJourEmo(false);
	}
}

function bas() {
	animerTouches(basBtn);
	if (verifierLimiteY("bas")) {
		truc.style.top = truc.offsetTop + pas + "px";
		mettreAJourEmo(false);
	}
}

function gauche() {
	animerTouches(gaucheBtn);
	if (verifierLimiteX("gauche")) {
		truc.style.left = truc.offsetLeft - pas + "px";
	}
	mettreAJourEmo(true);
}

function droite() {
	animerTouches(droiteBtn);
	if (verifierLimiteX("droite")) {
		truc.style.left = truc.offsetLeft + pas + "px";
	}
	mettreAJourEmo(true);
}

// vérifier si l'on peut se déplacer horizontalement
function verifierLimiteX(direction) {
	let x = truc.offsetLeft;
	let y = truc.offsetTop;
	let ok = [];
	let longueur = Math.max(nogoX.length, nogoX2.length, nogoY.length, nogoY2.length);

	let verif = 0;
	for (let i = 0; i < longueur; i++) {
		verif = 0;
		if (y < nogoY[i] || y > nogoY2[i] - taille) {
			verif = 1;
		}
		if (direction === "droite") {
			if (x < nogoX[i] - taille || x > nogoX2[i] - taille) {
				verif = 1;
			}
		}
		if (direction === "gauche") {
			if (x < nogoX[i] || x > nogoX2[i]) {
				verif = 1;
			}
		}
		ok.push(verif);
	}
	// vérifier ce qu'il faut retourner
	let res = ok.every(function (e) {
		return e > 0;
	});
	return res;
}

// vérifier si l'on peut se déplacer verticalement
function verifierLimiteY(direction) {
	let x = truc.offsetLeft;
	let y = truc.offsetTop;
	let ok = [];
	let longueur = Math.max(nogoX.length, nogoX2.length, nogoY.length, nogoY2.length);

	let verif = 0;
	for (let i = 0; i < longueur; i++) {
		verif = 0;
		if (x < nogoX[i] || x > nogoX2[i] - taille) {
			verif = 1;
		}
		if (direction === "haut") {
			if (y < nogoY[i] || y > nogoY2[i]) {
				verif = 1;
			}
		}
		if (direction === "bas") {
			if (y < nogoY[i] - taille || y > nogoY2[i] - taille) {
				verif = 1;
			}
		}
		ok.push(verif);
	}
	// vérifier ce qu'il faut retourner
	let res = ok.every(function (e) {
		return e > 0;
	});
	return res;
}

// générer les côtés avec des points d'entrée et de sortie aléatoires
function genererCotes() {
	let max = hauteurLabyrinthe / pas;
	let l1 = Math.floor(Math.random() * max) * pas;
	//let l1 = 0;
	let l2 = hauteurLabyrinthe - pas - l1;

	let bGauche1 = document.createElement("div");
	bGauche1.style.top = pas + "px";
	bGauche1.style.height = l1 + "px";
	bGauche1.style.left = "0px";
	bGauche1.style.width = largeurBarriere + "px";
	bGauche1.classList.add("barriere");
	labyrinthe.appendChild(bGauche1);

	let bGauche2 = document.createElement("div");
	bGauche2.style.top = l1 + pas * 2 + "px";
	bGauche2.style.height = l2 + "px";
	bGauche2.style.left = "0px";
	bGauche2.style.width = largeurBarriere + "px";
	bGauche2.classList.add("barriere");
	labyrinthe.appendChild(bGauche2);

	let bDroite1 = document.createElement("div");
	bDroite1.style.top = l1 + pas * 2 + "px";
	bDroite1.style.height = l2 + "px";
	bDroite1.style.right = "0px";
	bDroite1.style.width = largeurBarriere + "px";
	bDroite1.classList.add("barriere");
	labyrinthe.appendChild(bDroite1);

	let bDroite2 = document.createElement("div");
	bDroite2.style.top = pas + "px";
	bDroite2.style.height = l1 + "px";
	bDroite2.style.right = "0px";
	bDroite2.style.width = largeurBarriere + "px";
	bDroite2.classList.add("barriere");
	labyrinthe.appendChild(bDroite2);
}

// générer le labyrinthe
function genererLabyrinthe(x, y, profondeur) {
	grille[y][x].visité = 1;
	let direction = directions.sort((a, b) => 0.5 - Math.random());

	for (let i = 0; i < direction.length; i++) {
		let d = modDirection[direction[i]];
		let dx = x + d.x;
		let dy = y + d.y;

		if (dx >= 0 && dx < mx && dy >= 0 && dy < my && grille[dy][dx].visité === 0) {
			grille[y][x][direction[i]] = 1;
			grille[dy][dx][d.oppose] = 1;
			genererLabyrinthe(dx, dy, profondeur + 1);
		}
	}
}

// dessiner le labyrinthe
function dessinerLabyrinthe() {
	for (let y = 0; y < my; y++) {
		for (let x = 0; x < mx; x++) {
			let posX = x * pas + largeurBarriere + "px";
			let posY = y * pas + pas + "px";

			for (let dir in modDirection) {
				if (grille[y][x][dir] === 0) {
					let mur = document.createElement("div");
					mur.classList.add("barriere");
					if (dir === "haut") {
						mur.style.left = posX;
						mur.style.top = y * pas + "px";
						mur.style.width = pas + "px";
						mur.style.height = largeurBarriere + "px";
					}
					if (dir === "bas") {
						mur.style.left = posX;
						mur.style.top = (y + 1) * pas + "px";
						mur.style.width = pas + "px";
						mur.style.height = largeurBarriere + "px";
					}
					if (dir === "gauche") {
						mur.style.left = x * pas + largeurBarriere + "px";
						mur.style.top = posY;
						mur.style.width = largeurBarriere + "px";
						mur.style.height = pas + "px";
					}
					if (dir === "droite") {
						mur.style.left = (x + 1) * pas + largeurBarriere + "px";
						mur.style.top = posY;
						mur.style.width = largeurBarriere + "px";
						mur.style.height = pas + "px";
					}
					labyrinthe.appendChild(mur);
				}
			}
		}
	}
}

function animerTouches(btn) {
	btn.classList.add("clic");
	setTimeout(() => {
		btn.classList.remove("clic");
	}, 100);
}

function mettreAJourEmo(côté) {
	let distanceActuelle = truc.offsetLeft + truc.offsetTop;
	if (côté) {
		distanceActuelle = truc.offsetLeft + truc.offsetTop;
	} else {
		distanceActuelle = Math.abs(truc.offsetLeft - largeurLabyrinthe) + Math.abs(truc.offsetTop - hauteurLabyrinthe);
	}
	let delta = distanceActuelle - distancePrecedente;

	if (delta < 0) {
		emo.textContent = "😊";
	} else if (delta > 0) {
		emo.textContent = "😨";
	}
	if (truc.offsetTop < 10 || truc.offsetLeft < 10) {
		emo.textContent = "😱";
	}
	if (
		Math.abs(truc.offsetLeft - maison.offsetLeft) < pas &&
		Math.abs(truc.offsetTop - maison.offsetTop) < pas
	) {
		emo.textContent = "😎";
	}
	distancePrecedente = distanceActuelle;
}
