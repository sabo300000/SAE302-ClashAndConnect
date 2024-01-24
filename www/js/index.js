
/**************************************/
/** Event Listeners                   */
/**************************************/

const LIEN_API ="https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/recensement-des-equipements-sportifs/records?limit=100&refine=famille%3A%22Salle%20de%20combat%22"
const URL = 'https://corsproxy.io/?' + encodeURIComponent(LIEN_API);
const MAIN = document.getElementById("page-content");
const FOOT = document.getElementById("footer");
const ERROR = document.getElementById("error");

const BTN_DATA = document.getElementById("Active_DATA");
const BTN_REMOVE = document.getElementById("Storage");
const BTN_PHOTOS = document.getElementById("modif_photos");
const BTN_PROFIL = document.getElementById("modif_profil");

const COMPTE = document.getElementById("Compte");
const PROFIL = document.getElementById("profil");
const MODIF_PROFIL = document.getElementById("modif");
const VALID = document.getElementById("Validation");
const ANNUL = document.getElementById("Annulation");



let salle = new Array;
let gps = new Array;
let response = new Array;
let donnee ="";	


document.addEventListener("deviceready", onDeviceReady);
document.addEventListener("pause", onPause);
document.addEventListener("resume", onResume);
document.addEventListener("backbutton", onBackButton);


let map = L.map('map').setView([48.857612, 2.351782], 9);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19,attribution: '© OpenStreetMap'}).addTo(map);


let punch= L.icon({
    iconUrl: './img/Punch.png', // Remplacez par le chemin vers votre image
    iconSize: [38, 95], // Taille de l'icône
    iconAnchor: [22, 94], // Point de l'icône qui correspondra à la position du marqueur
    popupAnchor: [-3, -76] // Point à partir duquel l'infobulle s'ouvrira
}); 

/**************************************/
/** Functions                         */
/**************************************/
 
function onDeviceReady()
{
	console.log("onDeviceReady");


	
	///////////////////////////////------------------------------------///////////////////////////////
	//Vérification de la connexion internet
	document.addEventListener("offline", onOffline, false);
	document.addEventListener("online", onOnline, false);
	
	

	BTN_REMOVE.addEventListener("click", Remove);
	BTN_PHOTOS.addEventListener("click", NewPhotos);
	BTN_PROFIL.addEventListener("click", ModifProfile);
	COMPTE.addEventListener("click", ShowProfile);
	VALID.addEventListener("click", ValidProfile);
	ANNUL.addEventListener("click", ReturnProfile);
	
	PROFIL.style.display = "block";
	MAIN.style.display = "block";
	FOOT.style.display = "block";
	ERROR.style.display = "none";
	MODIF_PROFIL.style.display = "none";
	
	/////////////////////////////////////////////////////////------------------------------------///////////////////////////////
	  
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
function Settings(){
	console.log("Accès aux paramètres de données mobiles de l'appareil");
	cordova.plugins.diagnostic.switchToMobileDataSettings(OnSuccess, OnError);

}
function Remove(){
	console.log("Les données de la map ont été supprimées avec succès");
	localStorage.removeItem("MAP");
}
////////////Alertes des actions effectuées
function OnSuccess(){
	console.log("L'action a été effectuée avec succès");
}
function OnError(error){
	console.log("L'action a échoué : " + error);
}


/**************************************/
///Affiche une page d'erreur si l'appareil n'est pas connecté à internet
function onOffline() {
	
	console.log("onOffline");
	console.log("Vous n'êtes pas connecté à internet");
	//Affiche une page d'erreur si l'appareil n'est pas connecté à internet
	MAIN.style.display = "none";
	FOOT.style.display = "none";
	ERROR.style.display = "block";
	BTN_DATA.addEventListener("click", Settings);
	
}


//Permet de Lancer les fontionnatitées de l'application si l'appareil est connecté à internet
function onOnline() {
	
	MAIN.style.display = "block";
	FOOT.style.display = "block";
	ERROR.style.display = "none";


	let networkState = navigator.connection.type;
	if (networkState !== Connection.NONE) {
		if(localStorage.getItem("MAP")){
			console.log("MAP par local storage");
			//on vide les tableaux
			salle = [];
			gps =	[];

			response = localStorage.getItem("MAP");
			response = JSON.parse(response);
			for(let i=0; i<(response.results.length); i++)
				
			{
				salle.push(response.results[i].insnom);
				gps.push(response.results[i].gps);
				
			}
			for (let i=0; i <(salle.length); i++)
				{
					// Parcourt le tableau GPS et ajoute chaque point à la carte
					let div = document.createElement('div');
						div.id = "PopUp";
						div.innerHTML = salle[i]+'<br>';
						button = document.createElement('button');
						button.id = "PopUpButton";
						button.innerHTML = "Allez à la salle";
						div.appendChild(button);
						donnee = salle[i];
					L.marker([gps[i].lat, gps[i].lon], {icon: punch}).addTo(map).bindPopup(div); // Ajoute une infobulle avec le nom de la salle
				}
			
			console.log("Fin du traitement");
		}
		else{
			console.log("MAP par API");
			clickOnELE();
		}
		
	}

	
}


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
				salle = [];
				gps =	[];
				response = JSON.parse(response);
				for(let i=0; i<(response.results.length); i++)
					
				{
					salle.push(response.results[i].insnom);
					gps.push(response.results[i].gps);
					
				}
				for (let i=0; i <(salle.length); i++)
					{
						// Parcourt le tableau GPS et ajoute chaque point à la carte
						let div = document.createElement('div');
						div.innerHTML = salle[i]+'<br>';
						button = document.createElement('button');
						button.id = "PopUp_Button";
						button.innerHTML = "Allez à la salle";
						div.appendChild(button);
						map.on('click', NewBrowser);

    					L.marker([gps[i].lat, gps[i].lon], {icon: punch}).addTo(map).bindPopup(div).openOn(map);; // Ajoute une infobulle avec le nom de la salle
					}
				
				console.log("Fin du traitement");
				break;
			
			case 0:
				console.log("<strong class='Error'>=> ERROR 0");
				break;
			
			}
				
			
			
			break;
	
	}
	
	
}



/////////////////MISE EN PLACE DU PROFIL////////////////////////



function NewPhotos() {

	console.log("Autorisation de l'accès à la caméra");
	navigator.camera.getPicture(onSuccess_Photo, onFail_Photo, { quality: 45, destinationType: Camera.DestinationType.DATA_URL});

}


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

function onFail_Photo(message) {
	alert('Echec de la prise de photo: ' + message);
}

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

function ModifProfile(){
	console.log("Modification du profil");
	//Affichage du formulaire de modification
	PROFIL.style.display = "none";
	MODIF_PROFIL.style.display = "block";
}

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

function ReturnProfile(){
	//Permet de réafficher le profil et d'enlever le formulaire de modification
	PROFIL.style.display = "block";
	MODIF_PROFIL.style.display = "none";
}



///Redirection vers google maps avec les coordonnées de la salle
function NewBrowser(){
	console.log("Redirection vers google maps");
	Name = document.getElementById("NameSalle").innerHTML;
	
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
	link = "https://www.google.fr/maps/place/"+lat+","+lon;
	console.log("Passage dans le navigateur");
	cordova.InAppBrowser.open(link, '_system', 'location=yes');
} 