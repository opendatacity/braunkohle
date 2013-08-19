/*
 RaphaelLayer, a JavaScript library for overlaying Raphael objects onto Leaflet interactive maps. http://dynmeth.github.com/RaphaelLayer
 (c) 2012-2013, David Howell, Dynamic Methods Pty Ltd

 Version 0.1.3
 */

(function () {

	var R, originalR;

	if (typeof exports != 'undefined') {
		R = exports;
	} else {
		R = {};

		originalR = window.R;

		R.noConflict = function () {
			window.R = originalR;
			return R;
		};

		window.R = R;
	}

	R.version = '0.1.3';

	R.Layer = L.Class.extend({
		includes: L.Mixin.Events,

		initialize: function (options) {

		},

		onAdd: function (map) {
			this._map = map;
			this._map._initRaphaelRoot();
			this._paper = this._map._paper;
			this._set = this._paper.set();

			map.on('viewreset', this.projectLatLngs, this);
			this.projectLatLngs();
		},

		onRemove: function (map) {
			map.off('viewreset', this.projectLatLngs, this);
			this._map = null;
			this._set.forEach(function (item) {
				item.remove();
			}, this);
			this._set.clear();
		},

		projectLatLngs: function () {
		},

		animate: function (attr, ms, easing, callback) {
			this._set.animate(attr, ms, easing, callback);

			return this;
		},

		stop: function () {
			this._set.stop();
		},

		hover: function (f_in, f_out, icontext, ocontext) {
			this._set.hover(f_in, f_out, icontext, ocontext);

			return this;
		},

		attr: function (name, value) {
			this._set.attr(name, value);
			return this;
		}
	});

	L.Map.include({
		_initRaphaelRoot: function () {
			if (!this._raphaelRoot) {
				this._raphaelRoot = this._panes.overlayPane;
				this._paper = Raphael(this._raphaelRoot);

				this.on('moveend', this._updateRaphaelViewport);
				this._updateRaphaelViewport();
			}
		},

		_updateRaphaelViewport: function () {
			var p = 0.02,
				size = this.getSize(),
				panePos = L.DomUtil.getPosition(this._mapPane),
				min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)),
				max = min.add(size.multiplyBy(1 + p * 2)),
				width = max.x - min.x,
				height = max.y - min.y,
				root = this._raphaelRoot,
				pane = this._panes.overlayPane;

			this._paper.setSize(width, height);

			L.DomUtil.setPosition(root, min);

			root.setAttribute('width', width);
			root.setAttribute('height', height);

			this._paper.setViewBox(min.x, min.y, width, height, false);

		}
	});

	R.Polyline = R.Layer.extend({

		initialize: function (latlngs, attr, options) {
			R.Layer.prototype.initialize.call(this, options);

			this._latlngs = latlngs;
			this._attr = attr || {'fill': '#000', 'stroke': '#000'};
		},

		projectLatLngs: function () {
			this._set.clear();
			if (this._path) this._path.remove();

			this._path = this._paper.path(this.getPathString())
				.attr(this._attr)
				.toBack();

			this._set.push(this._path);
		},

		getPathString: function () {
			for (var i = 0, len = this._latlngs.length, str = ''; i < len; i++) {
				var p = this._map.latLngToLayerPoint(this._latlngs[i]);
				str += (i ? 'L' : 'M') + p.x + ' ' + p.y;
			}
			return str;
		}
	});

	R.PolygonPulse = R.Layer.extend({

		initialize: function (latlngs, attr, options) {
			R.Layer.prototype.initialize.call(this, options);

			if (latlngs.length == 1) {
				if (latlngs[0] instanceof Array) {
					latlngs = latlngs[0];
				}
			}
			this.scale = 0;
			this._latlngs = latlngs;
			this._attr = {
				'stroke-width': 12,
				'stroke': '#7E642D'
			};
		},

		projectLatLngs: function () {
			if (this._path) {
				this._path.remove();
			}
			this._path = this._paper.path(this.getPathString())
				.attr(this._attr)
				.toBack();
			this._set.push(this._path);
			this.pulse();
		},

		onRemove: function (map) {
			R.Layer.prototype.onRemove.call(this, map);

			//if (this._pulse) this._pulse.remove();
			if (this._path) this._path.remove();
		},

		getBounds: function () {
			var bounds = new L.LatLngBounds();
			var i = 0, len = this._latlngs.length;
			while (i < len) {
				bounds.extend(this._latlngs[i++]);
			}
			return bounds;
		},

		moveCenter: function (latlng) {
			var center = this.getBounds().getCenter();
			var offset = new L.LatLng(center.lat - latlng.lat, center.lng - latlng.lng);
			for (var i = 0; i < this._latlngs.length; i++) {
				var ll = this._latlngs[i];
				this._latlngs[i] = new L.LatLng(ll.lat - offset.lat, ll.lng - offset.lng);
			}
			this.projectLatLngs();
		},

		setScale: function (scale, duration, cb) {
			this.scale = scale;
			var pathanim = Raphael.animation({transform: 's' + scale}, duration || 0, '<', function () {
				if (cb)
					cb();
			});
			this._path.animate(pathanim);
//			if (scale >= 1)
//				scale = 0;
			/*
			 if (scale == 0) {
			 if (this.pulsescaleanim)
			 this._pulse.stop(this.pulsescaleanim);
			 this._pulse.attr('transform', 's0');
			 } else {
			 this.pulsescaleanim = Raphael.animation({transform: 's' + scale
			 }, duration || 0, '<', function () {
			 });
			 this._pulse.animate(this.pulsescaleanim);
			 }
			 */
		},

		pulse: function () {
			var fadeIn = function () {
				this._path.animate({
					'opacity': 0.45
				}, 500, '<', fadeOut);
			};
			var fadeOut = function () {
				this._path.animate({
					'opacity': 0.2
				}, 500, '<', fadeIn);
			};
			fadeOut();
		},

		setTime: function (time) {
			//nop
		},

		getPathString: function () {
			for (var i = 0, len = this._latlngs.length, str = ''; i < len; i++) {
				var p = this._map.latLngToLayerPoint(this._latlngs[i]);
				str += (i ? 'L' : 'M') + (p.x) + ' ' + (p.y);
			}
			str += 'Z';

			return str;
		}
	});

	R.Polygon = R.Layer.extend({

		initialize: function (latlngs, attr, options) {
			R.Layer.prototype.initialize.call(this, options);
			if (latlngs.length == 1) {
				if (latlngs[0] instanceof Array) {
					latlngs = latlngs[0];
				}
			}
			this.scale = 0;
			this._latlngs = latlngs;
			this._attr = attr || {'fill': 'rgba(255, 0, 0, 0.5)', 'stroke': '#f00', 'stroke-width': 1};
		},

		projectLatLngs: function () {
			this.originalPath = null;
			var opacity = 1;
			if (this._path) {
				opacity = this._path.attr('opacity');
				this._path.remove();
			}
			this._path = this._paper.path(this.getPathString())
				.attr(this._attr)
				.toBack();
			this._path.attr('opacity', opacity);
			this._set.push(this._path);
		},

		onRemove: function (map) {
			R.Layer.prototype.onRemove.call(this, map);
			if (this._path) this._path.remove();
			this.originalPath = null;
		},

		getBounds: function () {
			var bounds = new L.LatLngBounds();
			var i = 0, len = this._latlngs.length;
			while (i < len) {
				bounds.extend(this._latlngs[i++]);
			}
			return bounds;
		},

		moveCenter: function (latlng) {
			var center = this.getBounds().getCenter();
			var offset = new L.LatLng(center.lat - latlng.lat, center.lng - latlng.lng);
			for (var i = 0; i < this._latlngs.length; i++) {
				var ll = this._latlngs[i];
				this._latlngs[i] = new L.LatLng(ll.lat - offset.lat, ll.lng - offset.lng);
			}
			this.projectLatLngs();
		},

		setScale: function (scale, duration, cb) {
			this.scale = scale;
			var pathanim = Raphael.animation({transform: 's' + scale}, duration || 0, '<', function () {
				if (cb)
					cb();
			});
			this._path.animate(pathanim);
		},

		originalPath: false,

		setTime: function (time) {
			function init(path) {
				var newPath = [];

				// Finde Mittelpunkt
				var
					xMin = 1e10,
					xMax = -1e10,
					yMin = 1e10,
					yMax = -1e10;

				for (var i = 0; i < path.length - 1; i++) {
					var point = path[i];
					newPath.push([point[1], point[2]]);

					if (xMin > point[1]) xMin = point[1];
					if (xMax < point[1]) xMax = point[1];
					if (yMin > point[2]) yMin = point[2];
					if (yMax < point[2]) yMax = point[2];
				}

				var
					xCenter = (xMin + xMax) / 2,
					yCenter = (yMin + yMax) / 2,
					areaFactor = 0.2 * Math.sqrt((xMax - xMin) * (yMax - yMin));

				var
					n = newPath.length,
					ids = [16, 17, 350, 500];

				/*
				 xCenter = 0;
				 yCenter = 0;
				 for (var i = 0; i < ids.length; i++) {
				 xCenter += newPath[ids[i]][0];
				 yCenter += newPath[ids[i]][1];
				 }
				 xCenter /= ids.length;
				 yCenter /= ids.length;
				 */

				var times = [];

				for (var i = 0; i < ids.length; i++) {
					times[ids[i]] = [0, areaFactor * dist(ids[i]), undefined];
				}

				for (var i = 0; i < ids.length - 1; i++) {
					calcTimes(ids[i], ids[i + 1]);
				}

				calcTimes(ids[ids.length - 1], ids[0] + n);

				function dist(i, j) {
					i = i % n;
					var dx, dy;
					if (j !== undefined) {
						j = j % n;
						dx = newPath[i][0] - newPath[j][0];
						dy = newPath[i][1] - newPath[j][1];
					} else {
						dx = newPath[i][0] - xCenter;
						dy = newPath[i][1] - yCenter;
					}
					return Math.sqrt(dx * dx + dy * dy);
				}

				function calcTimes(i0, i1) {
					if (i1 - i0 <= 1) return;

					var
						p0 = newPath[i0 % n],
						p1 = newPath[i1 % n],
						maxD = -1,
						maxI = i0 + 1,
						maxJ = i0 + 1;

					for (var i = i0 + 1; i < i1; i++) {
						var j = i % n;
						var p = newPath[j];
						var d = Math.abs((p[0] - p0[0]) * (p[1] - p1[1]) - (p[1] - p0[1]) * (p[0] - p1[0]));
						if (maxD < d) {
							maxD = d;
							maxI = i;
							maxJ = j;
						}
					}

					var bestI = (times[i0 % n][1] > times[i1 % n][1]) ? i0 : i1;
					var t0 = times[bestI % n][1];

					times[maxJ] = [
						t0,
						t0 + maxD,
						i0 % n,
						i1 % n
					];

					/*
					 times[maxJ] = [
					 times[bestI % n][1],
					 times[bestI % n][1] + dist(bestI, maxJ),
					 bestI % n
					 ];
					 */

					calcTimes(i0, maxI);
					calcTimes(maxI, i1);
				}

				var maxTimes = 0;
				for (var i = 0; i < n; i++) if (maxTimes < times[i][1]) maxTimes = times[i][1];
				for (var i = 0; i < n; i++) {
					times[i][0] /= maxTimes;
					times[i][1] /= maxTimes;
				}

				var order = [];
				for (var i = 0; i < n; i++) order[i] = i;
				order.sort(function (a, b) {
					return times[a][0] - times[b][0];
				});

				return {
					path: newPath,
					times: times,
					order: order,
					center: [xCenter, yCenter]
				}
			}

			if (!this.originalPath) {
				this.originalPath = init(this._path.attr('path'));
			}

			var
				path = [],
				path0 = this.originalPath.path,
				times = this.originalPath.times,
				order = this.originalPath.order,
				center = this.originalPath.center;

			for (var j = 0; j < order.length; j++) {
				var i = order[j];
				if (times[i][0] < time) {
					if (times[i][1] > time) {
						// interpoliere
						var a = (time - times[i][0]) / (times[i][1] - times[i][0]);
						var p;
						if (times[i][2] === undefined) {
							// interpoliere vom Zentrum
							p = center;
						} else {
							// interpoliere vom referenzpunkt
							p = [
								(path0[times[i][2]][0] + path0[times[i][3]][0]) / 2,
								(path0[times[i][2]][1] + path0[times[i][3]][1]) / 2
							];
						}
						path[i] = [
							p[0] + (path0[i][0] - p[0]) * a,
							p[1] + (path0[i][1] - p[1]) * a
						];
					} else {
						// endwert
						path[i] = [path0[i][0], path0[i][1]];
					}
				}
			}

			var result = [];
			for (var i = 0; i < path.length; i++) {
				if (path[i]) result.push(['L', path[i][0], path[i][1]]);
			}

			if (result.length < 2) {
				result = [
					['M', center[0], center[1]],
					['Z']
				]
			} else {
				result[0][0] = 'M';
				result.push(['Z']);
			}

			//this.originalPath = path;
			/*
			 var p = this._path.attr('path');
			 for (var i = 0; i < p.length-1; i++) {
			 p[i][1] += (Math.random() - 0.5)*2;
			 p[i][2] += (Math.random() - 0.5)*2;
			 }
			 */
			this._path.attr('path', result)
		},

		getPathString: function () {
			for (var i = 0, len = this._latlngs.length, str = ''; i < len; i++) {
				var p = this._map.latLngToLayerPoint(this._latlngs[i]);
				str += (i ? 'L' : 'M') + (p.x) + ' ' + (p.y);
			}
			str += 'Z';
			return str;
		}
	});

	R.FeatureGroup = L.FeatureGroup.extend({
		initialize: function (layers, options) {
			L.FeatureGroup.prototype.initialize.call(this, layers, options);
		},

		animate: function (attr, ms, easing, callback) {
			this.eachLayer(function (layer) {
				layer.animate(attr, ms, easing, callback);
			});
		},

		stop: function () {
			this.eachLayer(function (layer) {
				layer.stop();
			});
		},

		onAdd: function (map) {
			L.FeatureGroup.prototype.onAdd.call(this, map);

			this._set = this._map._paper.set();

			for (i in this._layers) {
				this._set.push(this._layers[i]._set);
			}
		},

		hover: function (h_in, h_out, c_in, c_out) {
			this.eachLayer(function (layer) {
				layer.hover(h_in, h_out, c_in, c_out);
			});

			return this;
		},

		attr: function (name, value) {
			this.eachLayer(function (layer) {
				layer.attr(name, value);
			});

			return this;
		}
	});

	/*
	 * Contains L.MultiPolyline and L.MultiPolygon layers.
	 */

	(function () {
		function createMulti(Klass) {
			return R.FeatureGroup.extend({
				initialize: function (latlngs, options) {
					this._layers = {};
					this._options = options;
					this.latlngs = latlngs;    //ffalt: store latlngs
					this.setLatLngs(latlngs);
				},

				//ffalt* implement L.Layer.getBounds method
				getBounds: function () {
					var bounds = new L.LatLngBounds();
					var i = 0, len = this.latlngs.length;
					while (i < len) {
						bounds.extend(this.latlngs[i++]);
					}
					return bounds;
				},

				moveCenter: function (latlng) {
					var center = this.getBounds().getCenter();
					var offset = new L.LatLng(center.lat - latlng.lat, center.lng - latlng.lng);
					for (var i = 0; i < this.latlngs.length; i++) {
						for (var j = 0; j < this.latlngs[i].length; j++) {
							for (var k = 0; k < this.latlngs[i][j].length; k++) {
								var ll = this.latlngs[i][j][k];
								this.latlngs[i][j][k] = new L.LatLng(ll.lat - offset.lat, ll.lng - offset.lng);
							}
						}
					}
					this.eachLayer(function (layer) {
						if (layer.projectLatLngs) {
							layer.projectLatLngs();
						}
					}, this);
				},
				//*ffalt


				setLatLngs: function (latlngs) {
					this.latlngs = latlngs;
					var i = 0, len = latlngs.length;
					this.eachLayer(function (layer) {
						if (i < len) {
							layer.setLatLngs(latlngs[i++]);
						} else {
							this.removeLayer(layer);
						}
					}, this);

					while (i < len) {
						this.addLayer(new Klass(latlngs[i++], this._options));
					}

					return this;
				}
			});
		}

		R.MultiPolyline = createMulti(R.Polyline);
		R.MultiPolygon = createMulti(R.Polygon);
	}());

	R.GeoJSON = R.FeatureGroup.extend({
		initialize: function (geojson, options) {
			L.Util.setOptions(this, options);

			this._geojson = geojson;
			this._layers = {};

			if (geojson) {
				this.addGeoJSON(geojson);
			}
		},

		//ffalt*
		moveCenter: function (latlng) {
			this.latlng = latlng;
			this.eachLayer(function (layer) {
				layer.moveCenter(latlng);
			}, this);
		},

		setScale: function (scale, duration, cb) {
			this.eachLayer(function (layer) {
				layer.setScale(scale, duration, cb);
			}, this);
		},

		setTime: function (time, callback) {
			this.eachLayer(function (layer) {
				layer.setTime(time);
			}, this);
			if (callback)
				setTimeout(callback, 60);
		},
		//*ffalt

		addGeoJSON: function (geojson) {
			var features = geojson.features,
				i, len;

			if (features) {
				for (i = 0, len = features.length; i < len; i++) {
					this.addGeoJSON(features[i]);
				}
				return;
			}

			var isFeature = (geojson.type === 'Feature'),
				geometry = isFeature ? geojson.geometry : geojson,
				layer = R.GeoJSON.geometryToLayer(geometry, this.options.pointToLayer);

			this.fire('featureparse', {
				layer: layer,
				properties: geojson.properties,
				geometryType: geometry.type,
				bbox: geojson.bbox,
				id: geojson.id,
				geometry: geojson.geometry
			});

			this.addLayer(layer);
		}

	});

	L.Util.extend(R.GeoJSON, {
		geometryToLayer: function (geometry, pointToLayer) {
			var coords = geometry.coordinates,
				layers = [],
				latlng, latlngs, i, len, layer;

			switch (geometry.type) {
				case 'Point':
					latlng = this.coordsToLatLng(coords);
					return pointToLayer ? pointToLayer(latlng) : new R.Marker(latlng);

				case 'MultiPoint':
					for (i = 0, len = coords.length; i < len; i++) {
						latlng = this.coordsToLatLng(coords[i]);
						layer = pointToLayer ? pointToLayer(latlng) : new R.Marker(latlng);
						layers.push(layer);
					}
					return new R.FeatureGroup(layers);

				case 'LineString':
					latlngs = this.coordsToLatLngs(coords);
					return new R.Polyline(latlngs);

				case 'Polygon':
					latlngs = this.coordsToLatLngs(coords, 1);
					return new R.Polygon(latlngs);

				case 'MultiLineString':
					latlngs = this.coordsToLatLngs(coords, 1);
					return new R.MultiPolyline(latlngs);

				case "MultiPolygon":
					latlngs = this.coordsToLatLngs(coords, 2);
					return new R.MultiPolygon(latlngs);

				case "GeometryCollection":
					for (i = 0, len = geometry.geometries.length; i < len; i++) {
						layer = this.geometryToLayer(geometry.geometries[i], pointToLayer);
						layers.push(layer);
					}
					return new R.FeatureGroup(layers);

				default:
					throw new Error('Invalid GeoJSON object.');
			}
		},

		coordsToLatLng: function (coords, reverse) { // (Array, Boolean) -> LatLng
			var lat = parseFloat(coords[reverse ? 0 : 1]),
				lng = parseFloat(coords[reverse ? 1 : 0]);

			return new L.LatLng(lat, lng, true);
		},

		coordsToLatLngs: function (coords, levelsDeep, reverse) { // (Array, Number, Boolean) -> Array
			var latlng,
				latlngs = [],
				i, len;

			for (i = 0, len = coords.length; i < len; i++) {
				latlng = levelsDeep ?
					this.coordsToLatLngs(coords[i], levelsDeep - 1, reverse) :
					this.coordsToLatLng(coords[i], reverse);
				latlngs.push(latlng);
			}

			return latlngs;
		}
	});


}());