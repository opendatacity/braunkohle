var DEFAULT_POINT = new L.LatLng(52.50085, 13.42232);
var WELZOW_POINT = new L.LatLng(51.58474991408093, 14.226608276367188);

$(document).ready(function () {

	var btn_play = $('#play');
	var btn_pause = $('#pause');
	var btn_stop = $('#stop');
	var btn_mute = $('#mute');
	var btn_unmute = $('#unmute');
	var audio = new AudioPlayer();
	var player = new Player(WELZOW_POINT, braunkohle_geojson.features[0].geometry);
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
	$('#search').typeahead({
		source: geocode.name,
		updater: function (item) {
			player.jumpTo(item);
			return item;
		}
	})
});

function AudioPlayer() {
	this.muted = false;
	var audioelement = new Audio("");
	document.body.appendChild(audioelement);
	var canPlayType = audioelement.canPlayType("audio/ogg");
	if (canPlayType.match(/maybe|probably/i)) {
		audioelement.src = '/static/sound.ogg';
	} else {
		audioelement.src = '/static/sound.mp3';
	}
	var caller = this;
	audioelement.addEventListener('canplay', function () {
		caller.audio = audioelement;
		caller.audio.volume = (caller.muted ? 0 : 1);
	}, false);
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

function Player(latlng, geometry) {
	this.map = null;
	this.r = null;
	this.maxprogress = 100;   // total to reach
	this.actualprogress = 0;  // current value
	this.progress_text = document.getElementById("progress-text");
	this.indicator = document.getElementById("indicator");
	this.playstate = PLAYSTATE.IDLE;
	this.initMap(latlng);
	this.addOSMLayer();
	this.addRLayer(latlng, geometry);
	this.marker = L.marker(latlng).addTo(this.map);
	this.addMouseClick();
}

Player.prototype = {

	initMap: function (latlng) {
		this.map = L.map('map').setView(latlng, 11);
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

	addMouseClick: function () {
		var caller = this;
		this.map.on('click', function (event) {
			caller.marker.setLatLng(event.latlng);
		});
	},

	animate: function () {
		if (this.actualprogress > this.maxprogress) {
			this.playstate = PLAYSTATE.IDLE;
			if (this.onEnd) {
				this.onEnd();
			}
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
		var scale = 's' + this.actualprogress / this.maxprogress;
		//console.log(scale);
		var caller = this;
		var anim = Raphael.animation({transform: scale}, 100, '<', function () {
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
		//var p = r.getBounds().getCenter();
	},

	addOSMLayer: function () {
		L.tileLayer('http://tiles.odcdn.de/europe' + '/{z}/{x}/{y}.png', {attribution: ''
//		L.tileLayer('http://api.tiles.mapbox.com/v3/ffalt.map-63b7bl05' + '/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://mapbox.com">Mapbox</a>'
//		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(this.map);
	},

	displayProgress: function () {
		this.indicator.style.width = this.actualprogress + "%";//px";
		this.progress_text.innerHTML = this.actualprogress;
	},

	start: function () {
		if (this.playstate == PLAYSTATE.PLAYING)
			return;
		if (this.playstate != PLAYSTATE.PAUSED) {
			this.map.removeLayer(this.marker);
			this.actualprogress = 0;
			this.map.setView(this.marker.getLatLng(), this.map.getZoom());
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
		var index = geocode.name.indexOf(search);
		if (index >= 0) {
			var p = new L.LatLng(geocode.lat[index], geocode.lng[index]);
			this.marker.setLatLng(p);
			this.map.setView(p, this.map.getZoom());
		} else {
			alert('kenn ich leider nich'); //FIX ME
		}
	}

};
