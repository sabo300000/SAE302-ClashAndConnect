
//Lien de l'api
//Passage par un proxy pour éviter les erreurs de CORS
const LIEN_API ="https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/recensement-des-equipements-sportifs/records?limit=100&refine=famille%3A%22Salle%20de%20combat%22"
const URL = 'https://corsproxy.io/?' + encodeURIComponent(LIEN_API);

/**************************************/
/** Définition des ecouteurs d'elements                   */
/**************************************/

const MAIN = document.getElementById("page-content");
const FOOT = document.getElementById("footer");
const ERROR = document.getElementById("error");
const PROFIL = document.getElementById("profil");
const MODIF_PROFIL = document.getElementById("modif");


const BTN_DATA = document.getElementById("Active_DATA");
const BTN_REMOVE = document.getElementById("Storage");
const BTN_PHOTOS = document.getElementById("modif_photos");
const BTN_PROFIL = document.getElementById("modif_profil");
const BTN_GALERY = document.getElementById("modif_gallerie");
let nbr_galery = 0;

const COMPTE = document.getElementById("Compte");
const VALID = document.getElementById("Validation");
const ANNUL = document.getElementById("Annulation");
const PERM_CONNEX = document.getElementById("perm_Connex");
const PERM_PHOTO = document.getElementById("perm_Photo");


///Relatif à la carte
let salle = new Array;
let gps = new Array;
let activ = new Array;
let response = new Array;
let donnee ="";	


//Ecouteurs lier a l'application 
document.addEventListener("deviceready", onDeviceReady);
document.addEventListener("pause", onPause);
document.addEventListener("resume", onResume);
document.addEventListener("backbutton", onBackButton);

//Création de la carte centrée sur Paris - Ile de France

let map = L.map('map').setView([48.857612, 2.351782], 9);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 21,attribution: '© OpenStreetMap'}).addTo(map);


//Création de l'icone pour les marqueurs
let punch= L.icon({
    iconUrl: './img/Punch.png', // Remplacez par le chemin vers votre image
    iconSize: [38, 95], // Taille de l'icône
    iconAnchor: [22, 94], // Point de l'icône qui correspondra à la position du marqueur
    popupAnchor: [-3, -76] // Point à partir duquel l'infobulle s'ouvrira
}); 

/**************************************/
/** Fonctions                         */
/**************************************/
 
function onDeviceReady()
{
	console.log("onDeviceReady");

	
	///////////////////////////////------------------------------------///////////////////////////////
	//Verification de la connexion internet
	document.addEventListener("offline", onOffline, false);
	document.addEventListener("online", onOnline, false);
	
	/////Swiper//
	let swiper = new Swiper(".mySwiper", {});
	
	/////Mise en ecoute

	BTN_REMOVE.addEventListener("click", Remove);
	BTN_PHOTOS.addEventListener("click", NewPhotos);
	BTN_PROFIL.addEventListener("click", ModifProfile);
	BTN_GALERY.addEventListener("click", NewPhotos_Galery);
	COMPTE.addEventListener("click", ShowProfile);
	VALID.addEventListener("click", ValidProfile);
	ANNUL.addEventListener("click", ReturnProfile);
	

	//Ecouteurs lier aux parametres de l'appareil
	PERM_CONNEX.addEventListener("click", Settings);
	PERM_PHOTO.addEventListener("click", Settings_Photo);
	

	//Affichage des pages de l'application
	//Disposition par defaut
	PROFIL.style.display = "block";
	MAIN.style.display = "block";
	FOOT.style.display = "block";
	ERROR.style.display = "none";
	MODIF_PROFIL.style.display = "none";

	

	
	  
}

 
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 
function onPause()
{
	console.log("onPause");
}
 
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 
function onResume()
{
	console.log("onResume");
}
 
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 
function onBackButton()
{
	console.log("onBackButton");	
}


/**************************************/
///Fonction lier aux parametres de l'appareil
//Sont utilisees dans la page profil et la page d'erreur
function Settings(){
	console.log("Accès aux paramètres de données mobiles de l'appareil");
	cordova.plugins.diagnostic.switchToMobileDataSettings();

}
function Settings_Photo(){
	console.log("Accès aux paramètres de données mobiles de l'appareil");
	cordova.plugins.diagnostic.switchToSettings();
}
function Remove(){
	console.log("Les données de la map ont été supprimées avec succès");
	localStorage.removeItem("MAP");
}


/**************************************/
///Affichage d'une page d'erreur si l'appareil n'est pas connecté à internet
function onOffline() {
	
	console.log("onOffline");
	console.log("Vous n'êtes pas connecté à internet");
	//Affiche une page d'erreur si l'appareil n'est pas connecté à internet
	MAIN.style.display = "none";
	FOOT.style.display = "none";
	ERROR.style.display = "block";
	BTN_DATA.addEventListener("click", Settings);
	
}


//Permet de charger les donnees liees a la map si l'appareil est connecte a internet
function onOnline() {
	
	MAIN.style.display = "block";
	FOOT.style.display = "block";
	ERROR.style.display = "none";


	let networkState = navigator.connection.type;
	if (networkState !== Connection.NONE) {
		if(localStorage.getItem("MAP")){
			console.log("MAP par local storage");
			
			response = localStorage.getItem("MAP");
			response = JSON.parse(response);

			AfficheMap(response);
			
			
		}
		else{
			console.log("MAP par API");
			clickOnELE();
		}
	}

	
}

//Récupération des données de l'API
function clickOnELE(){

	const XHR = new XMLHttpRequest();
	
		XHR.lien = URL;
	
	XHR.verif = "0";
	XHR.onreadystatechange = statechange;
	
	XHR.open("GET", XHR.lien);
	
	XHR.send();
}

function statechange(event)
	
{
	
	const XHR = event.target;

	
	
	switch(XHR.readyState)
	
	{
	
		case 0: console.log("Initialisation de la demande");
			break;
	
		case 1: console.log("Connexion établie avec le serveur");
			break;
	
		case 2: console.log("Requête reçue");
			break;
	
		case 3: console.log("Requête en cours de traitement");
		
			break;
		
		
	
		case 4:console.log("Requête terminée et réponse prête");
			
	
			
	
			switch(XHR.status){
			
			
	
			case 200:
				
				console.log("Traitement local de la réponse");
				
				response = XHR.responseText;
				localStorage.setItem("MAP", response);
				response = JSON.parse(response);

				AfficheMap(response);
				break;
			
			case 0:
				console.log("<strong class='Error'>=> ERROR 0");
				break;
			
			}
				
			
			
			break;
	
	}
	
	
}

//Affichage des marqueurs sur la carte aux coordonnees des salles
//Chaque marqueur est cliquable et renseigne le nom de la salle, l'activite et un lien vers google maps
function AfficheMap(response){
	//on vide les tableaux
	salle = [];
	gps =	[];
	activ = [];

	

	
	for(let i=0; i<(response.results.length); i++)
		
	{
		salle.push(response.results[i].insnom);
		gps.push(response.results[i].gps);
		activ.push(response.results[i].actlib);
		
	}
	for (let i=0; i <(salle.length); i++)
		{
			

			// Parcourt le tableau GPS et ajoute chaque point à la carte
			link = "https://www.google.fr/maps/search/"+salle[i]+"/@"+gps[i].lat+","+gps[i].lon;
			
			let div = document.createElement('div');

			div.innerHTML = salle[i]+'<br>';
			div.innerHTML += activ[i]+'<br>';
			div.innerHTML += '<a href="'+link+'">Voir sur Google Maps</a>';

			L.marker([gps[i].lat, gps[i].lon], {icon: punch}).addTo(map).bindPopup(div); // Ajoute une infobulle avec le nom de la salle


		}

		console.log("Fin du traitement");
}

/////////////////MISE EN PLACE DU PROFIL////////////////////////

//Nouvelle photo issue de la camera

function NewPhotos() {

	navigator.camera.getPicture(onSuccess_Photo, onFail_Photo, { quality: 45, destinationType: Camera.DestinationType.DATA_URL});

}
//Renvoi de l'image en base64 par la camera et stockage dans le local storage
function onSuccess_Photo(imageData) {


	//Création d'une balise image
	let ph = document.getElementById("photos");
	essai = document.getElementById("image");

	localStorage.removeItem("PHOTO");
	localStorage.setItem("PHOTO", imageData);
	let img_ajout = document.createElement('img');
	img_ajout.id = "image";
	img_ajout.src = "data:image/jpeg;base64," + localStorage.getItem("PHOTO");
	if(essai != null){
		ph.removeChild(essai);
	}
	ph.appendChild(img_ajout);
	
	
}

//Nouvelle photo issue de la galerie
function NewPhotos_Galery() {

	navigator.camera.getPicture(onSuccess_Photo_Gallery, onFail_Photo, { quality: 45, destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.PHOTOLIBRARY});

}

//Renvoi de l'image en base64 par la camera et stockage dans le local storage
function onSuccess_Photo_Gallery(imageData) {
	//Création d'une balise image
	let ph = document.getElementById("Gallery");
	let nbr = document.getElementsByClassName("Image_alt").length;
	console.log("Test ClassName: "+nbr);
	nom = "Galery"+nbr+1;
	localStorage.setItem(nom, imageData);
	let img_ajout = document.createElement('img');
	img_ajout.className = "Image_alt";
	console.log(nom);
	img_ajout.src = "data:image/jpeg;base64," + localStorage.getItem(nom);

	ph.appendChild(img_ajout);
	
}

//Si echec de la prise ou la recuperation de la photo
function onFail_Photo(message) {
	alert('Echec de la prise de photo: ' + message);
}

//Affichage du profil
function ShowProfile(){
	console.log("Affichage du profil");


	
	
	let ph_prof = document.getElementById("photos");
	pseudo = document.getElementById("pseudo");
	descript = document.getElementById("description");

	//Affichage du profil
	pseudo.innerHTML = localStorage.getItem("PSEUDO");
	descript.innerHTML = localStorage.getItem("DESCRIPTION");

	image = document.getElementById("image");
	if(image == null){
		let img_prof = document.createElement('img');
		img_prof.id = "image";
		img_prof.src = "data:image/jpeg;base64," + localStorage.getItem("PHOTO");
		ph_prof.appendChild(img_prof);
	}
	PROFIL.style.display = "block";
	MODIF_PROFIL.style.display = "none";
	
}

//Affichage du formulaire de modification du profil
function ModifProfile(){
	console.log("Modification du profil");
	//Affichage du formulaire de modification
	PROFIL.style.display = "none";
	MODIF_PROFIL.style.display = "block";
}

//Recuperation des données du formulaire de modification du profil
//Modifie le pseudonyme ainsi que la description
function ValidProfile(){
	console.log("Modification du profil");
	//Récupération des données
	let pseudo = document.getElementById("pseudo_modif").value;
	let descript = document.getElementById("description_modif").value;
	
	//Stockage des données
	localStorage.setItem("PSEUDO", pseudo);
	localStorage.setItem("DESCRIPTION", descript);

	console.log("Affichage du profil");
	console.log("Pseudo : "+localStorage.getItem("PSEUDO"));
	console.log("Description : "+localStorage.getItem("DESCRIPTION"));

	//Affichage du profil
	ShowProfile();
}

//Retour au profil si la personne ne veut plus modifier son profil
function ReturnProfile(){
	//Permet de réafficher le profil et d'enlever le formulaire de modification
	PROFIL.style.display = "block";
	MODIF_PROFIL.style.display = "none";
}


//A utiliser si problème trouvé
///Redirection vers google maps avec les coordonnées de la salle
/*
function NewBrowser(event){
	console.log("Essai con"+event.target.id);
	console.log("Redirection vers google maps");
	
	
	response = localStorage.getItem("MAP");
	response = JSON.parse(response);
	let i = 0;
	while( i<(response.results.length && find == false)){
		if(response.results[i].insnom == Name){
			lat = response.results[i].gps.lat;
			lon = response.results[i].gps.lon;
			find = true;
		}

		i++;
	}
	
	console.log("Passage dans le navigateur");
	cordova.InAppBrowser.open(link, '_system', 'location=yes');
	
} 
*/