var BTN_IMG_URL = '/static/bagger.png';

var WELZOW_POINT = new L.LatLng(51.58474991408093, 14.226608276367188);
var MINZOOM = 8;
var MAXZOOM = 15;
var DEFAULT_ZOOM = 11;
var DURATIONSTEP = 0.38; //x% animation
var AREASIZE = 10800; //area size in ha

var INTRO = 'Das große Baggern<br/>Vattenfall will in der Lausitz noch mehr Braunkohle abbaggern und so Tausende von Menschen aus ihren Häusern vertreiben. Aktuell geht es um die Erweiterung des Tagebaus Welzow Süd. Wie groß das geplante Loch wäre, ist schwer vorstellbar. Diese Animation hilft euch dabei: Einfach einen Städtenamen eingeben und das große Graben beginnt.';
var FIRSTHINT = 'Hier Städtenamen eingeben'
var LEGALIES =
	'powered by' + '<br/>' +
		'<a href="http://leafletjs.com/" target="_blank">Leaflet</a>' + ', ' +
		'<a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> (<a href="http://opendatacommons.org/licenses/odbl/" target="_blank">ODbL</a>)' + ', ' +
		'<a href="http://www.freesound.org/people/ERH/sounds/34012/" target="_blank">cinematic-deep-bass-rumble by erh</a> [modified] (<a href="http://creativecommons.org/licenses/by/3.0/" target="_blank">CC-BY</a>)' + ', ' +
		'<a href="http://opengeodb.org/wiki/OpenGeoDB" target="_blank">OpenGeoDB</a> ' + ', ' +
		'<a href="http://mapbox.com" target="_blank">Mapbox</a> ' + '<br/>';
var MARKERHINT = 'Zum Starten hier klicken oder in die Karte um einen Startpunkt festzulegen';
var player;

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
			if ((qz >= MINZOOM) && (qz <= MAXZOOM))
				zoom = qz;
		}
		if (query.city) {
			var qp = searchCity(decodeURIComponent(query.city));
			if (!qp)
				qp = searchCity(query.city);
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
	player = new Player(p, braunkohle_geojson.features[0].geometry, zoom);
	player.onEnd = function () {
		audio.stop();
		btn_play.show();
		btn_pause.hide();
	};
	player.onStart = function () {
		audio.play();
		btn_play.hide();
		btn_pause.show();
		btn_stop.removeAttr('disabled');
	};
	btn_play.click(function (event) {
		player.start();
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
	if (screenfull.enabled) {
		$('#fullscreen').click(function (event) {
			screenfull.toggle();
		});
	} else {
		$('#fullscreen').hide();
	}
	$('#search').typeahead({
		source: geocode.name,
		updater: function (item) {
			player.hideTextOverlay();
			player.jumpTo(item);
			return item;
		}
	});
	initEmbed();
}

function initEmbed() {
	var embed_overlay = $('#embed-overlay');
	$('#share').click(function (evt) {
		if ($('#embed-overlay:visible').length === 0) {
			embed_overlay.fadeIn('fast');
		}
	});
	var clickIn = false;
	embed_overlay.click(function (evt) {
		if (!clickIn) {
			embed_overlay.fadeOut('fast');
		}
		clickIn = false;
	});
	$('#embed-content').click(function (evt) {
		clickIn = true;
	});
	$('#form-close').click(function (evt) {
		embed_overlay.fadeOut('fast');
	});
	var url = document.referrer || document.location.href;
	$('#social-fb').attr('href', 'http://www.facebook.com/sharer/sharer.php?s=100&p[url]=' + encodeURIComponent(url) + '&p[title]=Lieber+im+Netz+baggern,+als+in+der+Lausitz+graben!+Das+Greenpeace+Braunkohle-Tool:');
	$('#social-twitter').attr('href', 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=Lieber+im+Netz+baggern,+als+in+der+Lausitz+graben!+Das+Greenpeace+Braunkohle-Tool:');
	var $f = $('#embed-form');
	var formsearch = $('#form-search');
	formsearch.typeahead({
		source: geocode.name,
		updater: function (item) {
			$('#radio-city').prop('checked', true);
			return item;
		}});
	if ($f.length) {
		var $url = (document.location.href || '').split('?')[0];
		var embedCode = function () {
			var $size = $('input:radio[name=size]:checked', $f).val();
			var $src = $('input:radio[name=src]:checked', $f).val();
			$size = ($size === "") ? "large" : $size;
			$('#embed-size', $f).show();
			switch ($size) {
				case 'large':
					var $wh = 'width="800" height="520"';
					break;
				case 'medium':
					var $wh = 'width="480" height="520"';
					break;
				case 'small':
					var $wh = 'width="360" height="360"';
					break;
			}
			var pos = '';
			if ($src === 'current') {
				var latlng = player.getCurrentLatLng();
				pos = '?lat=' + latlng.lat + '&lng=' + latlng.lng;
			} else {
				pos = formsearch.val();
				if (pos) {
					pos = '?city=' + encodeURIComponent(pos);
				}
			}
			var $code = '<iframe src="' + $url + pos + '" ' + $wh + ' scrolling="no" frameborder="0"  webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
			$('#embed-code', $f).text($code);
		};
		embedCode();
		$(":input", $f).change(function () {
			embedCode();
		});
	}

}

function AudioPlayer() {
	this.muted = false;
	var audioelement = document.getElementById('audio');
	var caller = this;
	new MediaElement(audioelement, {
		// shows debug errors on screen
		enablePluginDebug: false,
		plugins: ['flash', 'silverlight'],
		// name of flash file
		flashName: 'flashmediaelement.swf',
		// name of silverlight file
		silverlightName: 'silverlightmediaelement.xap',
		customError: '',
		success: function (media) {
			caller.audio = media;
			caller.applyMuted();
			caller.audio.load();
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
		if (this.audio) {
			this.audio.pause();
		}
	},
	applyMuted: function () {
		if (this.audio)
			this.audio.volume = (this.muted ? 0 : 1);
	},
	setMute: function (muted) {
		this.muted = muted;
		this.applyMuted();
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
	this.displayProgress();
	this.addRLayer(latlng, geometry);
	this.showTextOverlay(INTRO);
	this.showFirstHint(FIRSTHINT);
	this.addMarker(latlng);
	this.addMouseClick();
}

Player.prototype = {

	zoomdisabled: false,

	initMap: function (latlng, zoom) {
		this.map = L.map('map', {
//			maxBounds: [
//				[46, 5],
//				[56, 16]
//			],
			minZoom: MINZOOM,
			maxZoom: MAXZOOM,
			attributionControl: false
		}).setView(latlng, zoom);
		var caller = this;
		this.map.on('zoomstart', function (event) {
			if (caller.playstate == PLAYSTATE.PLAYING) {
				caller.zoomdisabled = true;
			}
		});
		this.map.on('zoomend', function (event) {
			if (caller.zoomdisabled) {
				caller.zoomdisabled = false;
				caller.animate();
			}
		});
	},

	addMarker: function (latlng) {
		var baggerIcon = L.icon({
			iconUrl: BTN_IMG_URL,
			iconSize: [60, 60], // size of the icon
			shadowSize: [60, 60], // size of the shadow
			iconAnchor: [30, 30], // point of the icon which will correspond to marker's location
			shadowAnchor: [30, 30],  // the same for the shadow
			popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
		});

		this.marker = L.marker(latlng, {
			icon: baggerIcon,
			opacity: 0.5,
			title: MARKERHINT
		}).addTo(this.map);
		var caller = this;
		this.marker.on('click', function (e) {
			caller.start();
		});
	},

	hideTextOverlay: function () {
		if (this.legend) {
			this.legend.removeFrom(this.map);
			this.legend = null;
		}
		if (this.firstHint) {
			this.firstHint.removeFrom(this.map);
			this.firstHint = null;
		}
	},

	hasTextOverlay: function () {
		return (this.legend ? true : false);
	},

	showFirstHint: function (text) {
		this.firstHint = L.control({position: 'topright'});
		this.firstHint.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'map-overlay');
			$(div).html(text + ' <i class="icon-arrow-up"></i>');
			return div;
		};
		this.firstHint.addTo(this.map);
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
			if (caller.hasTextOverlay())
				caller.hideTextOverlay();
			else
				caller.marker.setLatLng(event.latlng);
		});
	},

	animate: function () {
		if (this.zoomdisabled || (this.playstate != PLAYSTATE.PLAYING))
			return;
		if (this.actualprogress > this.maxprogress) {
			this.actualprogress = this.maxprogress;
			this.playstate = PLAYSTATE.IDLE;
			if (this.onEnd) {
				this.onEnd();
			}
			this.displayProgress();
			return;
		}
		this.displayProgress();
		var time = this.actualprogress / this.maxprogress;
		var caller = this;
		this.r.setTime(time, function () {
			caller.animate();
		});
		this.actualprogress += DURATIONSTEP;
	},

	addRLayer: function (latlng, geojson) {
		this.r = new R.GeoJSON(geojson);
		this.map.addLayer(this.r);
		this.r.attr('opacity', 0);
		this.r.moveCenter(latlng)
	},

	addOSMLayer: function () {
		L.tileLayer('http://api.tiles.mapbox.com/v3/gpde.map-82g35l8h' + '/{z}/{x}/{y}.png', {attribution: ''    }).addTo(this.map);
	},

	displayProgress: function () {
		this.indicator.style.width = this.actualprogress.toFixed(0) + "%";
		var size = AREASIZE * (this.actualprogress / 100);
		this.progress_text.innerHTML =
			(size / 100).toFixed(2) + " km² - " +
				(size).toFixed(2) + " Hektar";
	},

	getCurrentLatLng: function () {
		return this.marker.getLatLng();
	},

	start: function () {
		if (this.playstate == PLAYSTATE.PLAYING)
			return;
		this.hideTextOverlay();
		if (this.playstate != PLAYSTATE.PAUSED) {
			this.actualprogress = 0;
			this.map.setView(this.marker.getLatLng(), this.map.getZoom());
			this.r.moveCenter(this.marker.getLatLng());
			this.r.attr('opacity', 1);
			if (this.onStart)
				this.onStart();
		}
		this.playstate = PLAYSTATE.PLAYING;
		this.animate();
	},

	reset: function () {
		this.r.setTime(0);
	},

	pause: function () {
		this.playstate = PLAYSTATE.PAUSED;
	},

	stop: function () {
		this.playstate = PLAYSTATE.IDLE;
		this.actualprogress = 0;
		this.displayProgress();
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
//			console.log('kenn ich leider nich ' + search); //FIX ME
		}
		return false;
	}

}
;
