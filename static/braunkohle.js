$(document).ready(function () {

	var kohle_geo =
	{ "type": "MultiPolygon", "coordinates": [[ [ [ 14.225133942682017, 51.535161815191827 ], [ 14.212950685728426, 51.536285228377118 ], [ 14.196533792347022, 51.538798637514617 ], [ 14.174954771015422, 51.546100302997367 ], [ 14.154343201501266, 51.555283525570516 ], [ 14.113844443998584, 51.568485337838112 ], [ 14.113474512386452, 51.575646191024767 ], [ 14.121085527904572, 51.584161323639549 ], [ 14.140685561429592, 51.593734970502311 ], [ 14.145715604526501, 51.591558298643839 ], [ 14.153445913901677, 51.584013622617796 ], [ 14.158178023054495, 51.577490769006481 ], [ 14.160385007256588, 51.57250341370716 ], [ 14.17192324459692, 51.564612750759956 ], [ 14.188131028373077, 51.573205186911856 ], [ 14.187570802821423, 51.577613581861442 ], [ 14.186865534867467, 51.578740579939691 ], [ 14.185301878703871, 51.587628129896721 ], [ 14.185121306169606, 51.588923136747525 ], [ 14.185667550750207, 51.589903703841514 ], [ 14.173627122838335, 51.600033420625131 ], [ 14.178440255849532, 51.608913994053665 ], [ 14.180568170002489, 51.611845121110264 ], [ 14.181966587204665, 51.614658977018614 ], [ 14.194194101787648, 51.62580394205078 ], [ 14.194775008470918, 51.625776191924842 ], [ 14.199645470607789, 51.630538627746411 ], [ 14.200451609032575, 51.630925089390978 ], [ 14.202752975751819, 51.630597640458198 ], [ 14.204738929861135, 51.629409573301459 ], [ 14.208189513339505, 51.625805008219416 ], [ 14.209249047137442, 51.625561871977823 ], [ 14.21167562281393, 51.622746755308832 ], [ 14.214750558127038, 51.621005952383875 ], [ 14.236972696777141, 51.618875770917455 ], [ 14.246550006084686, 51.618763584426901 ], [ 14.253818417875907, 51.618126677912642 ], [ 14.25855235649655, 51.61798532375942 ], [ 14.258906441477224, 51.618209033428926 ], [ 14.258095808775472, 51.618430644437254 ], [ 14.258188948755874, 51.61870208055597 ], [ 14.262743603308769, 51.618027391803857 ], [ 14.285404317438962, 51.617630374549037 ], [ 14.288504902425549, 51.621901761154014 ], [ 14.290581727463207, 51.623545051212851 ], [ 14.294880234173755, 51.631544779402859 ], [ 14.294858428053626, 51.632271064713301 ], [ 14.296307446661206, 51.635178529247248 ], [ 14.30161002141848, 51.63487816705198 ], [ 14.302329486165926, 51.635388476333411 ], [ 14.305433991204236, 51.6355602774522 ], [ 14.30840496318109, 51.635237190675156 ], [ 14.309135998617306, 51.634021573446852 ], [ 14.325138726507124, 51.632002135138016 ], [ 14.326703909342424, 51.630816353435264 ], [ 14.328269871724073, 51.628715532362101 ], [ 14.328877378213811, 51.627273280325319 ], [ 14.329282797532974, 51.627298190256575 ], [ 14.338607265269824, 51.618711260141644 ], [ 14.338644210067974, 51.61789709340465 ], [ 14.339214064513589, 51.61716726581593 ], [ 14.338962713316866, 51.614854781836115 ], [ 14.337937744348189, 51.614788523805451 ], [ 14.337764498373263, 51.613907406985383 ], [ 14.338048249912145, 51.612410618444102 ], [ 14.33758880092318, 51.610176672732983 ], [ 14.33773267952275, 51.604857040478805 ], [ 14.338421945825207, 51.603777873455876 ], [ 14.338273695721801, 51.602774793673596 ], [ 14.338544816375478, 51.602232611130461 ], [ 14.338043447848992, 51.601547743401433 ], [ 14.338058045385655, 51.600469001410801 ], [ 14.33766914202138, 51.600131104142342 ], [ 14.337166711167843, 51.594178875888794 ], [ 14.337670577060939, 51.58625937525094 ], [ 14.336701430077197, 51.586221669055014 ], [ 14.336684737694654, 51.57884381381789 ], [ 14.337023629134659, 51.577494026698282 ], [ 14.336495555675597, 51.575071948887057 ], [ 14.335189725197493, 51.575152265836742 ], [ 14.327586097973599, 51.564055834905282 ], [ 14.320914052552389, 51.560270281230011 ], [ 14.321015413795115, 51.559959948243822 ], [ 14.32031922313155, 51.559282654149087 ], [ 14.319364791125523, 51.559333097957897 ], [ 14.314372688673897, 51.556298763927337 ], [ 14.313265443465525, 51.555101262376496 ], [ 14.313011498275456, 51.555064382490073 ], [ 14.313390515184894, 51.555751776836189 ], [ 14.310691534547251, 51.554290572156823 ], [ 14.309783816420634, 51.553379295524863 ], [ 14.306796201043266, 51.551598579564669 ], [ 14.30589791348857, 51.551496167089418 ], [ 14.303331308216841, 51.550067094704055 ], [ 14.302081600210728, 51.55001688453337 ], [ 14.300053491221945, 51.549083364841302 ], [ 14.289806087324649, 51.545862727697745 ], [ 14.289243288833493, 51.546323088901794 ], [ 14.283480385606451, 51.544237802765814 ], [ 14.282553768443226, 51.544621650937628 ], [ 14.281455528273908, 51.544225442839419 ], [ 14.279550593249105, 51.544120611118181 ], [ 14.27912942764144, 51.54353809869508 ], [ 14.27386057904393, 51.542954621805784 ], [ 14.268096465760474, 51.540627335087088 ], [ 14.254830121946309, 51.536495489058325 ], [ 14.243523307781198, 51.533457085318901 ], [ 14.225133942682017, 51.535161815191827 ] ] ] ] } ;

	var DEFAULT_POINT = new L.LatLng(52.50085, 13.42232);
	var audio = $('#audio');
	var map = new Map(DEFAULT_POINT, kohle_geo);
	$('#play').click(function (event) {
		map.start();
		document.getElementById("audio").play();
//		audio.play();
	});
	$('#stop').click(function (event) {
		map.stop();
		document.getElementById("audio").pause();
		document.getElementById('audio').currentTime = 0;
	});
	$('#pause').click(function (event) {
		map.pause();
		document.getElementById("audio").pause();
	});

});

function Map(latlng, geojson) {
	this.map = null;
	this.r = null;
	this.maxprogress = 100;   // total to reach
	this.actualprogress = 0;  // current value
	this.itv = 0;  // id for setinterval
	this.progressnum = document.getElementById("progressnum");
	this.indicator = document.getElementById("indicator");
	this.playstate = 'idle';
	this.initMap(latlng);
	this.addOSMLayer();
	this.addRLayer(latlng, geojson);
	this.addMarker(latlng);
	this.addMouseListener();
	this.addMouseClick();
	//this.start();
}

Map.prototype = {

	initMap: function (latlng) {
		this.map = L.map('map').setView(latlng, 11);
		var caller = this;
		this.map.on('zoomstart', function (event) {
			caller.r.attr('opacity', 0);
			if (caller.playstate != 'idle') {
				caller.r.stop();
				caller.r.attr('transform', "s1");
			}
		});
		this.map.on('zoomend', function (event) {
			if (caller.playstate != 'idle') {
				caller.r.attr('transform', 's' + caller.actualprogress / caller.maxprogress);
				if (caller.playstate == 'playing')
					caller.animate();
				caller.r.attr('opacity', 1);
			} else if (caller.actualprogress>0) {
				caller.r.attr('opacity', 1);
			}
		})
	},

	addMouseListener: function () {
		var caller = this;
		L.control.mousePosition({
			lngFormatter: function (lng) {
				return 'Longitude: ' + lng;
			},
			latFormatter: function (lat) {
				return 'Zoom: ' + caller.map.getZoom() + ' Latitude: ' + lat;
			}
		}).addTo(this.map);
	},

	addMouseClick: function () {
		var caller = this;
		this.map.on('click', function (event) {
			caller.marker.setLatLng(event.latlng);
		});
	},

	animate: function () {
		if (this.actualprogress > this.maxprogress) {
			this.playstate = 'idle';
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

	addMarker: function (latlng) {
		this.marker = L.marker(latlng).addTo(this.map);
	},

	addOSMLayer: function () {
		L.tileLayer('http://api.tiles.mapbox.com/v3/ffalt.map-63b7bl05' + '/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://mapbox.com">Mapbox</a>'
//		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(this.map);
	},

	displayProgress: function () {
		this.indicator.style.width = this.actualprogress + "%";//px";
		this.progressnum.innerHTML = this.actualprogress;
	},

	start: function () {
		if (this.playstate == 'playing')
			return;
		if (this.playstate != 'paused') {
			this.actualprogress = 0;
			this.map.setView(this.marker.getLatLng(), this.map.getZoom());
			this.r.moveCenter(this.marker.getLatLng());
			this.r.attr('opacity', 1);
			this.r.attr('transform', "s0");
		}
		this.playstate = 'playing';
		this.animate();
	},

	pause: function () {
		this.playstate = 'paused';
		this.r.stop();
	},

	stop: function () {
		this.playstate = 'idle';
		this.actualprogress = 0;
		this.displayProgress();
		this.r.stop();
	}
};

//	getArea: function () {
//		var area = 0;         // Accumulates area in the loop
//		var j = this.points.length - 1;  // The last vertex is the 'previous' one to the first
//		for (var i = 0; i < this.points.length; i++) {
//			area = area + (this.lat(j) + this.lat(i)) * (this.lng(j) + this.lng(i));
//			j = i;  //j is previous vertex to i
//		}
//		return area / 2;
//	},
