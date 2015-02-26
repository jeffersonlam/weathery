//Global Variables
var xhr;
var xhr2;
var weatherAPIkey = "d594f9edbc2d1f2d90aedaa4cffa9f01";
var giphyAPIkey = "TlK63EM2NT69sTlZCus";
var cities = ['London', 'Bangkok', 'Paris', 'Singapore', 'Dubai', 'New York', 'Istanbul', 'Hong Kong', 'Seoul', 'Barcelona', 'Amsterdam', 'Rome', 'Tokyo', 'Austin Tx', 'San Francisco'];
var keyPressTimeout;
var prev;

//Handles page on page load. Set initial random city with weather and gif
window.onload = function(){
	var city = cities[Math.floor(Math.random()*cities.length)]
	document.getElementById('city').value = city;
	prev = city;
	adjustWidth(document.getElementById('city'));
	weatherRequestAjax(city);
}

//Adjusts width of input field dynamically
function adjustWidth(obj) {
    obj.style.width = (obj.value.length) * 27 + "px";
}

//Called on keyup event in input field. Adjusts input field width. Sends AJAX requests. Only sends request after finished typing for 800ms 
//Doesn't send AJAX requests on keypresses that aren't characters (eg alt, shift, capslock) except enter
function keyUp(obj, event){
	//if user presses 'enter' and city value hasn't changed, update the gif
	if (prev == document.getElementById('city').value && event.keyCode == 13){
		var hashtag = document.getElementById('hashtag').textContent.substring(1);
		// var response = gifRequest(hashtag);
		// displayGif(response);
	//if keyinput is detected but city value hasn't changed, do nothing
	} else if (prev == document.getElementById('city').value){
		return;
	//else, city value has changed, so submit ajax request after 400ms
	} else {
		prev = document.getElementById('city').value;
		window.clearTimeout(keyPressTimeout);
		adjustWidth(obj);
		keyPressTimeout = window.setTimeout(function(){
			weatherRequestAjax(obj.value);
		}, 800);
	}
}

//Given a city, searches for a city in the weather API. Asynchronous. Called in keyup. Also calls gif requests
function weatherRequestAjax(city){
	xhr = new XMLHttpRequest();
	var url = "http://api.openweathermap.org/data/2.5/weather?q="+city+"&units=imperial&APPID="+weatherAPIkey;
	xhr.open("GET", url, true);
	xhr.onreadystatechange = callback;
	xhr.send();

	function callback() {
	  	if (xhr.readyState === 4) {
	    	if (xhr.status === 200) {
	    		var response = JSON.parse(xhr.responseText);
	    		//check if city exists
	    		if (response.cod == 404){
	    			console.error(response.message);
					displayError();
	    			return;
	    		} 
	      		displayWeather(response);
	      		//response.weather[0].main contains a one word description of the weather
	      		gifRequestAjax(response.weather[0].main);
	    	} else {
	      		console.error(xhr.statusText);
	    	}
	  	}
		xhr.onerror = function (e) {
		  console.error(xhr.statusText);
		};
	}
}

//Given a weather API response, displays elements on page
function displayWeather(response){
	var hashtag = response.weather[0].main;
	document.getElementById("hashtag").innerHTML = "#" + hashtag;

	var description = response.weather[0].description;
	document.getElementById("description").innerHTML = description;

	var temperature = Math.round(response.main.temp);
	document.getElementById("temperature").innerHTML = temperature + "&#176;";
}

function displayError(){
	document.getElementById("description").innerHTML = "City not found";
	document.getElementById("temperature").innerHTML = "";
	document.getElementById("hashtag").innerHTML = "&nbsp;";
}

function gifRequestAjax(hashtag){
	xhr2 = new XMLHttpRequest();
	xhr2.open("GET", "http://api.giphy.com/v1/gifs/search?q="+hashtag+"&limit=100&api_key="+giphyAPIkey, true);
	xhr2.onreadystatechange = callback;
	xhr2.send();

	function callback() {
	  	if (xhr2.readyState === 4) {
	    	if (xhr2.status === 200) {
	    		var gifResponse = JSON.parse(xhr2.responseText);;
	      		displayGif(gifResponse);
	    	} else {
	      		console.error(xhr2.statusText);
	    	}
	  	}
		xhr2.onerror = function (e) {
		  console.error(xhr.statusText);
		};
	}
}

//Given a Giphy API response, chooses a random gif, and displays it on page
function displayGif(response){
	var gif = randomElement(response.data);
	document.getElementById("weather-gif").src = gif.embed_url;

	// Preferred way of setting gif: get direct link to gif and set it as a background, rather than use iframe
	// Unfortunately, Giphy gives 404 errors half the time when you link directly to a gif
	// var gifURL = "http://i.giphy.com/"+response.data[num].id+".gif";
	// document.body.style.backgroundImage = "url('"+gifURL+"')";
}

//Given an array, returns a random element from the array
function randomElement(array){
	var num = Math.floor(Math.random() * array.length);
	return (array[num]);
}