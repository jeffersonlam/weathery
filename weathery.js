//Global Variables
var xhr;
var weatherAPIkey = "d594f9edbc2d1f2d90aedaa4cffa9f01";
var giphyAPIkey = "TlK63EM2NT69sTlZCus";
var cities = ['London', 'Bangkok', 'Paris', 'Singapore', 'Dubai', 'New York', 'Istanbul', 
			  'Hong Kong', 'Seoul', 'Barcelona', 'Amsterdam', 'Rome', 'Tokyo', 'Austin Tx', 'San Francisco'];
var keyPressTimeout;
var prev;

//Handles page on page load. Set initial random city with weather and gif
window.onload = function(){
	var city = cities[Math.floor(Math.random()*cities.length)]
	document.getElementById('city').value = city;
	prev = city;
	adjustWidth(document.getElementById('city'));
	initialAPICalls(city);
}

//initialAPICalls()
//=================
//Makes the initial API calls upon page load, getting and displaying weather and gif
function initialAPICalls(city){
	var response = weatherRequest(city);
	displayWeather(response);
	//response.weather[0].main contains a one word description of the weather
	var response2 = gifRequest(response.weather[0].main);
	displayGif(response2);
}

//adjustWidth()
//=============
//Adjusts width of input field dynamically
function adjustWidth(obj) {
    obj.style.width = (obj.value.length) * 27 + "px";
}

//keyUp()
//=======
//Called on keyup event in input field. Adjusts input field width. Sends AJAX requests. Only sends request after finished typing for 400ms 
//Doesn't send AJAX requests on keypresses that aren't characters (eg alt, shift, capslock) except enter
function keyUp(obj, event){
	if (prev == document.getElementById('city').value && event.keyCode != 13) return;
	prev = document.getElementById('city').value;
	window.clearTimeout(keyPressTimeout);
	adjustWidth(obj);
	keyPressTimeout = window.setTimeout(function(){
		weatherRequestAjax(obj.value);
	}, 400);
}

//weatherRequest()
//================
//Given a city, searches for a city in the weather API. Synchronous. Used in initial page load
function weatherRequest(city){
	var request = new XMLHttpRequest();
	var url = "http://api.openweathermap.org/data/2.5/weather?q="+city+"&units=imperial&APPID="+weatherAPIkey;
	request.open("GET", url, false);
	request.send();
	var response = JSON.parse(request.responseText);
	return response;
}

//weatherRequestAjax()
//====================
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
	    			return;
	    		} 
	      		displayWeather(response);
	      		//response.weather[0].main contains a one word description of the weather
	      		var response2 = gifRequest(response.weather[0].main);
	      		displayGif(response2);
	    	} else {
	      		console.error(xhr.statusText);
	    	}
	  	}
		xhr.onerror = function (e) {
		  console.error(xhr.statusText);
		};
	}
}

//displayWeather()
//============
//Given a weather API response, displays elements on page
function displayWeather(response){
	var hashtag = response.weather[0].main;
	document.getElementById("hashtag").innerHTML = "#" + hashtag;

	var description = response.weather[0].description;
	document.getElementById("description").innerHTML = description;

	var temperature = Math.round(response.main.temp);
	document.getElementById("temperature").innerHTML = temperature + "&#176;";
}

//gifRequest()
//============
//Given a hashtag, searches for a gif on Giphy (limit 100). Synchronous
function gifRequest(hashtag){
	var request = new XMLHttpRequest();
	request.open("GET", "http://api.giphy.com/v1/gifs/search?q="+hashtag+"&limit=100&api_key="+giphyAPIkey, false);
	request.send();
	var response = JSON.parse(request.responseText);
	return response;
}

//displayGif()
//============
//Given a Giphy API response, chooses a random gif, and displays it on page
function displayGif(response){
	var gif = randomElement(response.data);
	document.getElementById("weather-gif").src = gif.embed_url;

	// Preferred way of setting gif: get direct link to gif and set it as a background, rather than use iframe
	// But, Giphy gives 404 errors half the time when you link directly to a gif
	// var gifURL = "http://i.giphy.com/"+response.data[num].id+".gif";
	// document.body.style.backgroundImage = "url('"+gifURL+"')";
}

//randomElement()
//===============
//Given an array, returns a random element from the array
function randomElement(array){
	var num = Math.floor(Math.random() * array.length);
	return (array[num]);
}