var WELZOW_POINT = new L.LatLng(51.58474991408093, 14.226608276367188);
var MINZOOM = 8;
var MAXZOOM = 15;
var DEFAULT_ZOOM = 11;
var DURATION = 170; //of 1% animation
var INTRO = 'Klicken Sie auf die Karte um einen Startpunkt auszuwählen und auf den Start-Knopf unten links um die Animation zu starten.';
var LEGALIES =
	'powered by' + '<br/>' +
		'<a href="http://leafletjs.com/" target="_blank">Leaflet</a>' + '<br/>' +
		'<a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> (<a href="http://opendatacommons.org/licenses/odbl/" target="_blank">ODbL</a>)' + '<br/>' +
		'<a href="http://www.freesound.org/people/ERH/sounds/34012/" target="_blank">cinematic-deep-bass-rumble by erh</a> [modified] (<a href="http://creativecommons.org/licenses/by/3.0/" target="_blank">CC-BY</a>)' + '<br/>' +
		'<a href="http://opengeodb.org/wiki/OpenGeoDB" target="_blank">OpenGeoDB</a> ' + '<br/>' +
		'' + '<br/>';

$(document).ready(function () {
	init();
});

function getUrlVars() { // Read a page's GET URL variables and return them as an associative array.
	var vars = {},
		hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars[hash[0]] = hash[1];
	}
	return vars;
}

function searchCity(search) {
	if ((!search) || (!search.length))
		return null;
	//full test
	var index = geocode.name.indexOf(search);
	if (index < 0) {
		//lax test
		search = search.toLowerCase();
		for (var i = 0; i < geocode.name.length; i++) {
			if (geocode.name[i].toLowerCase() === search) {
				index = i;
				break;
			}
		}
	}
	if (index < 0) {
		//very lax test
		search = search.toLowerCase();
		for (var i = 0; i < geocode.name.length; i++) {
			if (geocode.name[i].toLowerCase().indexOf(search) != -1) {
				index = i;
				break;
			}
		}
	}
	if (index >= 0) {
		return new L.LatLng(geocode.lat[index], geocode.lng[index]);
	}
	return null;
}

function init() {
	var p = WELZOW_POINT;
	var zoom = DEFAULT_ZOOM;
	try {
		var query = getUrlVars();
		if ((query.z) && (!isNaN(query.z))) {
			var qz = parseInt(query.z);
			if ((qz >= MINZOOM) && (qz >= MAXZOOM))
				zoom = qz;
		}
		if (query.city) {
			var qp = searchCity(query.city);
			if (qp) p = qp;
		}
		if ((query.lat) && (query.lng)) {
			qp = new L.LatLng(query.lat, query.lng);
			if (qp) p = qp;
		}
	}
	catch (e) {
		//nop;
	}
	var btn_play = $('#play');
	var btn_pause = $('#pause');
	var btn_stop = $('#stop');
	var btn_mute = $('#mute');
	var btn_unmute = $('#unmute');
	var audio = new AudioPlayer();
	var player = new Player(p, braunkohle_geojson.features[0].geometry, zoom);
	player.onEnd = function () {
		audio.stop();
		btn_play.show();
		btn_pause.hide();
	};
	btn_play.click(function (event) {
		audio.play();
		player.start();
		btn_play.hide();
		btn_pause.show();
		btn_stop.removeAttr('disabled');
	});
	btn_stop.click(function (event) {
		audio.stop();
		player.stop();
		player.reset();
		btn_play.show();
		btn_pause.hide();
		btn_stop.attr('disabled', 'disabled');
	});
	btn_pause.click(function (event) {
		audio.pause();
		btn_play.show();
		btn_pause.hide();
		player.pause();
	});
	btn_mute.click(function (event) {
		btn_mute.hide();
		btn_unmute.show();
		audio.setMute(true);
	});
	btn_unmute.click(function (event) {
		btn_unmute.hide();
		btn_mute.show();
		audio.setMute(false);
	});
	var infoclick = false;
	$('#info').click(function (event) {
		if (infoclick && (player.hasTextOverlay())) {
			player.hideTextOverlay();
		} else {
			infoclick = true;
			player.showTextOverlay(
				LEGALIES + INTRO
			);
		}
	});
	$('#search').typeahead({
		source: geocode.name,
		updater: function (item) {
			player.jumpTo(item);
			return item;
		}
	});
}

function AudioPlayer() {
	this.muted = false;
	var audioelement = document.createElement('audio');
	document.body.appendChild(audioelement);
	var canPlayType = audioelement.canPlayType("audio/ogg");
	if (canPlayType.match(/maybe|probably/i)) {
		audioelement.src = '/static/sound.ogg';
	} else {
		audioelement.src = '/static/sound.mp3';
	}
	var caller = this;
	new MediaElement(audioelement, {success: function (media) {
		caller.audio = media;
		caller.audio.volume = (caller.muted ? 0 : 1);
	}});
}

AudioPlayer.prototype = {
	play: function () {
		if (this.audio)
			this.audio.play();
	},
	stop: function () {
		if (this.audio) {
			this.audio.pause();
			this.audio.currentTime = 0;
		}
	},
	pause: function () {
		if (this.audio)
			this.audio.pause();
	},
	setMute: function (muted) {
		this.muted = muted;
		if (this.audio)
			this.audio.volume = (this.muted ? 0 : 1);
	}
};

var PLAYSTATE = {IDLE: 0, PLAYING: 1, PAUSED: 2};

function Player(latlng, geometry, zoom) {
	this.map = null;
	this.r = null;
	this.maxprogress = 100;   // total to reach
	this.actualprogress = 0;  // current value
	this.progress_text = document.getElementById("progress-text");
	this.indicator = document.getElementById("indicator");
	this.playstate = PLAYSTATE.IDLE;
	this.initMap(latlng, zoom);
	this.addOSMLayer();
	this.addRLayer(latlng, geometry);
	this.showTextOverlay(INTRO)
	this.marker = L.marker(latlng).addTo(this.map);
	this.addMouseClick();
}

Player.prototype = {

	initMap: function (latlng, zoom) {
		this.map = L.map('map', {
			maxBounds: [
				[46, 5],
				[56, 16]
			],
			minZoom: MINZOOM,
			maxZoom: MAXZOOM,
			attributionControl: false
		}).setView(latlng, zoom);
		var caller = this;
		this.map.on('zoomstart', function (event) {
			caller.r.attr('opacity', 0);
			if (caller.playstate != PLAYSTATE.IDLE) {
				caller.r.stop();
				caller.r.attr('transform', "s1");
			}
		});
		this.map.on('zoomend', function (event) {
			if (caller.playstate != PLAYSTATE.IDLE) {
				caller.r.attr('transform', 's' + caller.actualprogress / caller.maxprogress);
				if (caller.playstate == PLAYSTATE.PLAYING)
					caller.animate();
				caller.r.attr('opacity', 1);
			} else if (caller.actualprogress > 0) {
				caller.r.attr('opacity', 1);
			}
		})
	},

	hideTextOverlay: function () {
		if (this.legend) {
			this.legend.removeFrom(this.map);
			this.legend = null;
		}
	},

	hasTextOverlay: function () {
		return (this.legend ? true : false);
	},

	showTextOverlay: function (text) {
		this.hideTextOverlay();
		this.legend = L.control({position: 'bottomleft'});
		this.legend.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'map-overlay');
			$(div).html(text);
			return div;
		};
		this.legend.addTo(this.map);
	},

	addMouseClick: function () {
		var caller = this;
		this.map.on('click', function (event) {
			caller.hideTextOverlay();
			caller.marker.setLatLng(event.latlng);
		});
	},

	animate: function () {
		if (this.actualprogress > this.maxprogress) {
			this.r.resetRandomizeBorder();
			this.playstate = PLAYSTATE.IDLE;
			if (this.onEnd) {
				this.onEnd();
			}
			this.map.addLayer(this.marker);
			//console.log('anim end');
			return;
		}
		this.displayProgress();
//		this.anim = Raphael.animation({
//			'0%': {transform: 's0.1', opacity: 0.8, easing: '<'},
//			'100%': {transform: 's1.0', opacity: 1.0}
//		}, 20 * 1000, "bounce", function () {
//			console.log(this);
//		});
		var scale = this.actualprogress / this.maxprogress;
		console.log(scale);
		var caller = this;
		var anim = Raphael.animation({transform: 's' + scale}, DURATION, '<', function () {
			caller.animate();
		});
		this.r.animate(anim);
		this.actualprogress++;

	},

	addRLayer: function (latlng, geojson) {
		this.r = new R.GeoJSON(geojson);
		this.map.addLayer(this.r);
		var r = this.r;
		r.attr('fill', 'rgba(39, 19, 10, 0.8)');
		r.attr({stroke: "gray", "stroke-width": 0.5});
		r.attr('opacity', 0);
		r.attr('scale', 0);
		r.moveCenter(latlng)
	},

	addOSMLayer: function () {
		L.tileLayer('http://tiles.odcdn.de/europe' + '/{z}/{x}/{y}.png', {attribution: ''}).addTo(this.map);
//		L.tileLayer('http://api.tiles.mapbox.com/v3/ffalt.map-63b7bl05' + '/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://mapbox.com">Mapbox</a>'	}).addTo(this.map);
	},

	displayProgress: function () {
		this.indicator.style.width = this.actualprogress + "%";
		this.progress_text.innerHTML = this.actualprogress + "%";
	},

	start: function () {
		if (this.playstate == PLAYSTATE.PLAYING)
			return;
		this.hideTextOverlay();
		if (this.playstate != PLAYSTATE.PAUSED) {
			this.map.removeLayer(this.marker);
			this.actualprogress = 0;
			this.map.setView(this.marker.getLatLng(), this.map.getZoom());

//			var southWest = new L.LatLng(route.south, route.west),
//				northEast = new L.LatLng(route.north, route.east);
//			geotrace.bounds = new L.LatLngBounds(southWest, northEast);
//			map.fitBounds(this.geotrace.bounds);

			this.r.moveCenter(this.marker.getLatLng());
			this.r.attr('opacity', 1);
			this.r.attr('transform', "s0");
		}
		this.playstate = PLAYSTATE.PLAYING;
		this.animate();
	},

	reset: function () {
		this.r.attr('opacity', 1);
		this.r.attr('transform', "s0");
		this.map.addLayer(this.marker);
	},

	pause: function () {
		this.playstate = PLAYSTATE.PAUSED;
		this.r.stop();
	},

	stop: function () {
		this.playstate = PLAYSTATE.IDLE;
		this.actualprogress = 0;
		this.displayProgress();
		this.r.stop();
	},

	jumpTo: function (search) {
		if ((!search) || (!search.length))
			return false;
		//full test
		var index = geocode.name.indexOf(search);
		if (index < 0) {
			//lax test
			search = search.toLowerCase();
			index = geocode.name.some(function (elem) {
				return elem.toLowerCase().indexOf(search) != -1;
			});
		}
		if (index >= 0) {
			var p = new L.LatLng(geocode.lat[index], geocode.lng[index]);
			this.marker.setLatLng(p);
			this.map.setView(p, this.map.getZoom());
			return true;
		} else {
			console.log('kenn ich leider nich ' + search); //FIX ME
		}
		return false;
	}

}
;
