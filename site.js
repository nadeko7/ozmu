const contenu = window.OZMU;
const get = (id) => document.getElementById(id);
const prix = new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" });
const produits = contenu.produits.filter((p) =>
  p.nom && contenu.categories.includes(p.categorie) && Number.isFinite(p.prix) && p.prix >= 0
);

function element(tag, texte, classe) {
  const node = document.createElement(tag);
  if (texte) node.textContent = texte;
  if (classe) node.className = classe;
  return node;
}

const dialogue = get("commande-produit");
const lienUber = get("commande-uber");
const carteUber = lienUber.href;

function ouvrirCommande(produit) {
  get("commande-produit-nom").textContent = produit.nom;
  get("commande-produit-prix").textContent = prix.format(produit.prix) + " sur Uber Eats";
  lienUber.href = produit.uberEats || carteUber;
  dialogue.showModal();
}

function fiche(produit) {
  const carte = element("article", "", "card");
  const bouton = element("button", "", "product-trigger");
  bouton.type = "button";
  bouton.setAttribute("aria-haspopup", "dialog");
  if (produit.photo) {
    const cadre = element("span", "", "card-photo");
    const photo = element("img");
    photo.src = produit.photo;
    photo.alt = produit.alt || "";
    photo.loading = "lazy";
    cadre.append(photo);
    bouton.append(cadre);
  }
  const details = element("span", "", "product-info");
  details.append(element("span", produit.nom, "product-name"));
  if (produit.description) details.append(element("span", produit.description));
  details.append(element("strong", prix.format(produit.prix)));
  bouton.append(details);
  bouton.addEventListener("click", () => ouvrirCommande(produit));
  carte.append(bouton);
  return carte;
}

function filtrer(categorie) {
  get("categorie-active").textContent = categorie;
  const resultats = produits.filter((p) => p.categorie === categorie);
  get("plats").replaceChildren(...resultats.map(fiche));
  get("menu-status").textContent = resultats.length
    ? ""
    : categorie ? "Cette catégorie sera bientôt disponible." : "La carte sera bientôt disponible.";
  for (const bouton of get("filtres").children) {
    bouton.setAttribute("aria-pressed", String(bouton.dataset.categorie === categorie));
  }
}

for (const categorie of contenu.categories) {
  const bouton = element("button", categorie);
  bouton.type = "button";
  bouton.dataset.categorie = categorie;
  bouton.addEventListener("click", () => filtrer(categorie));
  get("filtres").append(bouton);
}
filtrer(contenu.categories[0] || "");

const voletMenu = get("menu-volet");
function ouvrirMenuDepuisAncre() {
  if (location.hash === "#menu") voletMenu.open = true;
}
ouvrirMenuDepuisAncre();
window.addEventListener("hashchange", ouvrirMenuDepuisAncre);
document.querySelectorAll('a[href="#menu"]').forEach((lienMenu) => {
  lienMenu.addEventListener("click", () => { voletMenu.open = true; });
});

function lien(id, url) {
  if (!url) return;
  const ancre = get(id);
  ancre.href = url;
  ancre.hidden = false;
}

if (contenu.adresse) {
  get("adresse").textContent = contenu.adresse;
  get("adresse").hidden = false;
}
for (const { jour, heures } of contenu.horaires) {
  get("horaires").append(element("dt", jour), element("dd", heures));
}
get("horaires-status").hidden = contenu.horaires.length > 0;
lien("itineraire", contenu.itineraire);
if (contenu.carteGoogle) {
  get("carte").src = contenu.carteGoogle;
  get("carte").hidden = false;
}

const telephone = contenu.telephone ? "tel:" + contenu.telephone.replace(/[^\d+]/g, "") : "";
lien("telephone", telephone);
if (telephone) get("telephone").textContent = "Contacter le snack · " + contenu.telephone;
lien("instagram", contenu.instagram);
get("contact-status").hidden = Boolean(telephone || contenu.instagram);
const navigation = document.querySelector(".mobile-nav");
navigation.querySelectorAll("a").forEach((ancre) => {
  ancre.addEventListener("click", () => { navigation.open = false; });
});
navigation.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.open) {
    navigation.open = false;
    navigation.querySelector("summary").focus();
  }
});

if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entree of entries) {
      if (!entree.isIntersecting) continue;
      entree.target.classList.add("enter");
      observer.unobserve(entree.target);
    }
  }, { rootMargin: "0px 0px -24px 0px" });
  document.querySelectorAll("main .section").forEach((section) => observer.observe(section));
}
