import { Subject, Observable, combineLatest } from 'rxjs';
import { map, takeUntil, shareReplay, finalize, first } from 'rxjs/operators';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

/**
 * @module helpers
 */
/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 *
 * @memberof helpers
 * @type {number}
 */
var earthRadius = 6371008.8;
/**
 * Unit of measurement factors using a spherical (non-ellipsoid) earth radius.
 *
 * @memberof helpers
 * @type {Object}
 */
var factors = {
    centimeters: earthRadius * 100,
    centimetres: earthRadius * 100,
    degrees: earthRadius / 111325,
    feet: earthRadius * 3.28084,
    inches: earthRadius * 39.37,
    kilometers: earthRadius / 1000,
    kilometres: earthRadius / 1000,
    meters: earthRadius,
    metres: earthRadius,
    miles: earthRadius / 1609.344,
    millimeters: earthRadius * 1000,
    millimetres: earthRadius * 1000,
    nauticalmiles: earthRadius / 1852,
    radians: 1,
    yards: earthRadius * 1.0936,
};
/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToLength
 * @param {number} radians in radians across the sphere
 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToLength(radians, units) {
    if (units === void 0) { units = "kilometers"; }
    var factor = factors[units];
    if (!factor) {
        throw new Error(units + " units is invalid");
    }
    return radians * factor;
}
/**
 * Converts an angle in degrees to radians
 *
 * @name degreesToRadians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degreesToRadians(degrees) {
    var radians = degrees % 360;
    return (radians * Math.PI) / 180;
}

/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<number>|Geometry<Point>|Feature<Point>} coord GeoJSON Point or an Array of numbers
 * @returns {Array<number>} coordinates
 * @example
 * var pt = turf.point([10, 10]);
 *
 * var coord = turf.getCoord(pt);
 * //= [10, 10]
 */
function getCoord(coord) {
    if (!coord) {
        throw new Error("coord is required");
    }
    if (!Array.isArray(coord)) {
        if (coord.type === "Feature" &&
            coord.geometry !== null &&
            coord.geometry.type === "Point") {
            return coord.geometry.coordinates;
        }
        if (coord.type === "Point") {
            return coord.coordinates;
        }
    }
    if (Array.isArray(coord) &&
        coord.length >= 2 &&
        !Array.isArray(coord[0]) &&
        !Array.isArray(coord[1])) {
        return coord;
    }
    throw new Error("coord must be GeoJSON Point or an Array of numbers");
}

//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html
/**
 * Calculates the distance between two {@link Point|points} in degrees, radians, miles, or kilometers.
 * This uses the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula) to account for global curvature.
 *
 * @name distance
 * @param {Coord | Point} from origin point or coordinate
 * @param {Coord | Point} to destination point or coordinate
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
 * @returns {number} distance between the two points
 * @example
 * var from = turf.point([-75.343, 39.984]);
 * var to = turf.point([-75.534, 39.123]);
 * var options = {units: 'miles'};
 *
 * var distance = turf.distance(from, to, options);
 *
 * //addToMap
 * var addToMap = [from, to];
 * from.properties.distance = distance;
 * to.properties.distance = distance;
 */
function distance(from, to, options) {
    if (options === void 0) { options = {}; }
    var coordinates1 = getCoord(from);
    var coordinates2 = getCoord(to);
    var dLat = degreesToRadians(coordinates2[1] - coordinates1[1]);
    var dLon = degreesToRadians(coordinates2[0] - coordinates1[0]);
    var lat1 = degreesToRadians(coordinates1[1]);
    var lat2 = degreesToRadians(coordinates2[1]);
    var a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    return radiansToLength(2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)), options.units);
}

/**
 * @module helpers
 */
/**
 * Converts an angle in radians to degrees
 *
 * @name radiansToDegrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radiansToDegrees(radians) {
    var degrees = radians % (2 * Math.PI);
    return (degrees * 180) / Math.PI;
}
/**
 * Converts an angle in degrees to radians
 *
 * @name degreesToRadians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degreesToRadians$1(degrees) {
    var radians = degrees % 360;
    return (radians * Math.PI) / 180;
}

/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<number>|Geometry<Point>|Feature<Point>} coord GeoJSON Point or an Array of numbers
 * @returns {Array<number>} coordinates
 * @example
 * var pt = turf.point([10, 10]);
 *
 * var coord = turf.getCoord(pt);
 * //= [10, 10]
 */
function getCoord$1(coord) {
    if (!coord) {
        throw new Error("coord is required");
    }
    if (!Array.isArray(coord)) {
        if (coord.type === "Feature" &&
            coord.geometry !== null &&
            coord.geometry.type === "Point") {
            return coord.geometry.coordinates;
        }
        if (coord.type === "Point") {
            return coord.coordinates;
        }
    }
    if (Array.isArray(coord) &&
        coord.length >= 2 &&
        !Array.isArray(coord[0]) &&
        !Array.isArray(coord[1])) {
        return coord;
    }
    throw new Error("coord must be GeoJSON Point or an Array of numbers");
}

// http://en.wikipedia.org/wiki/Haversine_formula
// http://www.movable-type.co.uk/scripts/latlong.html
/**
 * Takes two {@link Point|points} and finds the geographic bearing between them,
 * i.e. the angle measured in degrees from the north line (0 degrees)
 *
 * @name bearing
 * @param {Coord} start starting Point
 * @param {Coord} end ending Point
 * @param {Object} [options={}] Optional parameters
 * @param {boolean} [options.final=false] calculates the final bearing if true
 * @returns {number} bearing in decimal degrees, between -180 and 180 degrees (positive clockwise)
 * @example
 * var point1 = turf.point([-75.343, 39.984]);
 * var point2 = turf.point([-75.534, 39.123]);
 *
 * var bearing = turf.bearing(point1, point2);
 *
 * //addToMap
 * var addToMap = [point1, point2]
 * point1.properties['marker-color'] = '#f00'
 * point2.properties['marker-color'] = '#0f0'
 * point1.properties.bearing = bearing
 */
function bearing(start, end, options) {
    if (options === void 0) { options = {}; }
    // Reverse calculation
    if (options.final === true) {
        return calculateFinalBearing(start, end);
    }
    var coordinates1 = getCoord$1(start);
    var coordinates2 = getCoord$1(end);
    var lon1 = degreesToRadians$1(coordinates1[0]);
    var lon2 = degreesToRadians$1(coordinates2[0]);
    var lat1 = degreesToRadians$1(coordinates1[1]);
    var lat2 = degreesToRadians$1(coordinates2[1]);
    var a = Math.sin(lon2 - lon1) * Math.cos(lat2);
    var b = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    return radiansToDegrees(Math.atan2(a, b));
}
/**
 * Calculates Final Bearing
 *
 * @private
 * @param {Coord} start starting Point
 * @param {Coord} end ending Point
 * @returns {number} bearing
 */
function calculateFinalBearing(start, end) {
    // Swap start & end
    var bear = bearing(end, start);
    bear = (bear + 180) % 360;
    return bear;
}

function distance$1(from, to) {
    return distance(toGeoJSONFeature(from), toGeoJSONFeature(to));
}
function bearing$1(from, to) {
    return bearing(toGeoJSONFeature(from), toGeoJSONFeature(to));
}
function toGeoJSONFeature(coordinates, props) {
    coordinates = flip(coordinates);
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: coordinates
        },
        properties: props
    };
}
function flip(arr) {
    return [arr[1], arr[0]];
}
function setPrecision(km) {
    switch (true) {
        case km <= 0.00477:
            return 9;
        case km <= 0.0382:
            return 8;
        case km <= 0.153:
            return 7;
        case km <= 1.22:
            return 6;
        case km <= 4.89:
            return 5;
        case km <= 39.1:
            return 4;
        case km <= 156:
            return 3;
        case km <= 1250:
            return 2;
        default:
            return 1;
    }
    // 1	≤ 5,000km	×	5,000km
    // 2	≤ 1,250km	×	625km
    // 3	≤ 156km	×	156km
    // 4	≤ 39.1km	×	19.5km
    // 5	≤ 4.89km	×	4.89km
    // 6	≤ 1.22km	×	0.61km
    // 7	≤ 153m	×	153m
    // 8	≤ 38.2m	×	19.1m
    // 9	≤ 4.77m	×	4.77m
}
/////// NGEOHASH ////////
var BASE32_CODES = '0123456789bcdefghjkmnpqrstuvwxyz';
var BASE32_CODES_DICT = {};
for (var i = 0; i < BASE32_CODES.length; i++) {
    BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
}
var ENCODE_AUTO = 'auto';
/**
 * Significant Figure Hash Length
 *
 * This is a quick and dirty lookup to figure out how long our hash
 * should be in order to guarantee a certain amount of trailing
 * significant figures. This was calculated by determining the error:
 * 45/2^(n-1) where n is the number of bits for a latitude or
 * longitude. Key is # of desired sig figs, value is minimum length of
 * the geohash.
 * @type Array
 */
//     Desired sig figs:  0  1  2  3  4   5   6   7   8   9  10
var SIGFIG_HASH_LENGTH = [0, 5, 7, 8, 11, 12, 13, 15, 16, 17, 18];
/**
 * Encode
 *
 * Create a Geohash out of a latitude and longitude that is
 * `numberOfChars` long.
 *
 * @param {Number|String} latitude
 * @param {Number|String} longitude
 * @param {Number} numberOfChars
 * @returns {String}
 */
var encode = function (latitude, longitude, numberOfChars) {
    if (numberOfChars === ENCODE_AUTO) {
        if (typeof latitude === 'number' || typeof longitude === 'number') {
            throw new Error('string notation required for auto precision.');
        }
        var decSigFigsLat = latitude.split('.')[1].length;
        var decSigFigsLong = longitude.split('.')[1].length;
        var numberOfSigFigs = Math.max(decSigFigsLat, decSigFigsLong);
        numberOfChars = SIGFIG_HASH_LENGTH[numberOfSigFigs];
    }
    else if (numberOfChars === undefined) {
        numberOfChars = 9;
    }
    var chars = [], bits = 0, bitsTotal = 0, hash_value = 0, maxLat = 90, minLat = -90, maxLon = 180, minLon = -180, mid;
    while (chars.length < numberOfChars) {
        if (bitsTotal % 2 === 0) {
            mid = (maxLon + minLon) / 2;
            if (longitude > mid) {
                hash_value = (hash_value << 1) + 1;
                minLon = mid;
            }
            else {
                hash_value = (hash_value << 1) + 0;
                maxLon = mid;
            }
        }
        else {
            mid = (maxLat + minLat) / 2;
            if (latitude > mid) {
                hash_value = (hash_value << 1) + 1;
                minLat = mid;
            }
            else {
                hash_value = (hash_value << 1) + 0;
                maxLat = mid;
            }
        }
        bits++;
        bitsTotal++;
        if (bits === 5) {
            var code = BASE32_CODES[hash_value];
            chars.push(code);
            bits = 0;
            hash_value = 0;
        }
    }
    return chars.join('');
};
/**
 * Decode Bounding Box
 *
 * Decode hashString into a bound box matches it. Data returned in a four-element array: [minlat, minlon, maxlat, maxlon]
 * @param {String} hash_string
 * @returns {Array}
 */
var decode_bbox = function (hash_string) {
    var isLon = true, maxLat = 90, minLat = -90, maxLon = 180, minLon = -180, mid;
    var hashValue = 0;
    for (var i = 0, l = hash_string.length; i < l; i++) {
        var code = hash_string[i].toLowerCase();
        hashValue = BASE32_CODES_DICT[code];
        for (var bits = 4; bits >= 0; bits--) {
            var bit = (hashValue >> bits) & 1;
            if (isLon) {
                mid = (maxLon + minLon) / 2;
                if (bit === 1) {
                    minLon = mid;
                }
                else {
                    maxLon = mid;
                }
            }
            else {
                mid = (maxLat + minLat) / 2;
                if (bit === 1) {
                    minLat = mid;
                }
                else {
                    maxLat = mid;
                }
            }
            isLon = !isLon;
        }
    }
    return [minLat, minLon, maxLat, maxLon];
};
/**
 * Decode
 *
 * Decode a hash string into pair of latitude and longitude. A javascript object is returned with keys `latitude`,
 * `longitude` and `error`.
 * @param {String} hashString
 * @returns {Object}
 */
var decode = function (hashString) {
    var bbox = decode_bbox(hashString);
    var lat = (bbox[0] + bbox[2]) / 2;
    var lon = (bbox[1] + bbox[3]) / 2;
    var latErr = bbox[2] - lat;
    var lonErr = bbox[3] - lon;
    return {
        latitude: lat,
        longitude: lon,
        error: { latitude: latErr, longitude: lonErr }
    };
};
/**
 * Neighbors
 *
 * Returns all neighbors' hashstrings clockwise from north around to northwest
 * 7 0 1
 * 6 x 2
 * 5 4 3
 * @param {String} hash_string
 * @returns {encoded neighborHashList|Array}
 */
var neighbors = function (hash_string) {
    var hashstringLength = hash_string.length;
    var lonlat = decode(hash_string);
    var lat = lonlat.latitude;
    var lon = lonlat.longitude;
    var latErr = lonlat.error.latitude * 2;
    var lonErr = lonlat.error.longitude * 2;
    var neighbor_lat, neighbor_lon;
    var neighborHashList = [
        encodeNeighbor(1, 0),
        encodeNeighbor(1, 1),
        encodeNeighbor(0, 1),
        encodeNeighbor(-1, 1),
        encodeNeighbor(-1, 0),
        encodeNeighbor(-1, -1),
        encodeNeighbor(0, -1),
        encodeNeighbor(1, -1)
    ];
    function encodeNeighbor(neighborLatDir, neighborLonDir) {
        neighbor_lat = lat + neighborLatDir * latErr;
        neighbor_lon = lon + neighborLonDir * lonErr;
        return encode(neighbor_lat, neighbor_lon, hashstringLength);
    }
    return neighborHashList;
};

// import { firestore } from './interfaces';
var defaultOpts = { units: 'km', log: false };
var GeoFireQuery = /** @class */ (function () {
    function GeoFireQuery(app, ref) {
        this.app = app;
        this.ref = ref;
        if (typeof ref === 'string') {
            this.ref = this.app.firestore().collection(ref);
        }
    }
    // GEO QUERIES
    /**
     * Queries the Firestore collection based on geograpic radius
     * @param  {FirePoint} center the starting point for the query, i.e gfx.point(lat, lng)
     * @param  {number} radius the radius to search from the centerpoint
     * @param  {string} field the document field that contains the FirePoint data
     * @param  {GeoQueryOptions} opts=defaultOpts
     * @returns {Observable<GeoQueryDocument>} sorted by nearest to farthest
     */
    GeoFireQuery.prototype.within = function (center, radius, field, opts) {
        var _this = this;
        opts = __assign(__assign({}, defaultOpts), opts);
        var tick = Date.now();
        var precision = setPrecision(radius);
        var radiusBuffer = radius * 1.02; // buffer for edge distances
        var centerHash = center.geohash.substr(0, precision);
        var area = neighbors(centerHash).concat(centerHash);
        var _a = center.geopoint, centerLat = _a.latitude, centerLng = _a.longitude;
        // Used to cancel the individual geohash subscriptions
        var complete = new Subject();
        // Map geohash neighbors to individual queries
        var queries = area.map(function (hash) {
            var query = _this.queryPoint(hash, field);
            return createStream(query).pipe(snapToData(), takeUntil(complete));
        });
        // Combine all queries concurrently
        var combo = combineLatest.apply(void 0, queries).pipe(map(function (arr) {
            // Combine results into a single array
            var reduced = arr.reduce(function (acc, cur) { return acc.concat(cur); });
            // Filter by radius
            var filtered = reduced.filter(function (val) {
                var _a = val[field].geopoint, latitude = _a.latitude, longitude = _a.longitude;
                return (distance$1([centerLat, centerLng], [latitude, longitude]) <=
                    radiusBuffer);
            });
            // Optional logging
            if (opts.log) {
                console.group('GeoFireX Query');
                console.log("\uD83C\uDF10 Center " + [centerLat, centerLng] + ". Radius " + radius);
                console.log("\uD83D\uDCCD Hits: " + reduced.length);
                console.log("\u231A Elapsed time: " + (Date.now() - tick) + "ms");
                console.log("\uD83D\uDFE2 Within Radius: " + filtered.length);
                console.groupEnd();
            }
            // Map and sort to final output
            return filtered
                .map(function (val) {
                var _a = val[field].geopoint, latitude = _a.latitude, longitude = _a.longitude;
                var hitMetadata = {
                    distance: distance$1([centerLat, centerLng], [latitude, longitude]),
                    bearing: bearing$1([centerLat, centerLng], [latitude, longitude])
                };
                return __assign(__assign({}, val), { hitMetadata: hitMetadata });
            })
                .sort(function (a, b) { return a.hitMetadata.distance - b.hitMetadata.distance; });
        }), shareReplay(1), finalize(function () {
            opts.log && console.log('✋ Query complete');
            complete.next(true);
        }));
        return combo;
    };
    GeoFireQuery.prototype.queryPoint = function (geohash, field) {
        var end = geohash + '~';
        return this.ref
            .orderBy(field + ".geohash")
            .startAt(geohash)
            .endAt(end);
    };
    return GeoFireQuery;
}());
function snapToData(id) {
    if (id === void 0) { id = 'id'; }
    return map(function (querySnapshot) {
        return querySnapshot.docs.map(function (v) {
            var _a;
            return __assign(__assign({}, (id ? (_a = {}, _a[id] = v.id, _a) : null)), v.data());
        });
    });
}
/**
internal, do not use. Converts callback to Observable.
 */
function createStream(input) {
    return new Observable(function (observer) {
        var unsubscribe = input.onSnapshot(function (val) { return observer.next(val); }, function (err) { return observer.error(err); });
        return { unsubscribe: unsubscribe };
    });
}
/**
 * RxJS operator that converts a collection to a GeoJSON FeatureCollection
 * @param  {string} field the document field that contains the FirePoint
 * @param  {boolean=false} includeProps
 */
function toGeoJSON(field, includeProps) {
    if (includeProps === void 0) { includeProps = false; }
    return map(function (data) {
        return {
            type: 'FeatureCollection',
            features: data.map(function (v) {
                return toGeoJSONFeature([v[field].geopoint.latitude, v[field].geopoint.longitude], includeProps ? __assign({}, v) : {});
            })
        };
    });
}
/**
 * Helper function to convert any query from an RxJS Observable to a Promise
 * Example usage: await get( collection.within(a, b, c) )
 * @param  {Observable<any>} observable
 * @returns {Promise<any>}
 */
function get(observable) {
    return observable.pipe(first()).toPromise();
}

var GeoFireClient = /** @class */ (function () {
    function GeoFireClient(app) {
        this.app = app;
    }
    /**
     * Creates reference to a Firestore collection that can be used to make geoqueries
     * @param  {firestore.CollectionReference | firestore.Query | string} ref path to collection
     * @returns {GeoFireQuery}
     */
    GeoFireClient.prototype.query = function (ref) {
        return new GeoFireQuery(this.app, ref);
    };
    /**
     * Creates an object with a geohash. Save it to a field in Firestore to make geoqueries.
     * @param  {number} latitude
     * @param  {number} longitude
     * @returns FirePoint
     */
    GeoFireClient.prototype.point = function (latitude, longitude) {
        return {
            geopoint: new this.app.firestore.GeoPoint(latitude, longitude),
            geohash: encode(latitude, longitude, 9)
        };
    };
    /**
     * Haversine distance between points
     * @param  {FirePoint} from
     * @param  {FirePoint} to
     * @returns number
     */
    GeoFireClient.prototype.distance = function (from, to) {
        return distance$1([from.geopoint.latitude, from.geopoint.longitude], [to.geopoint.latitude, to.geopoint.longitude]);
    };
    /**
     * Haversine bearing between points
     * @param  {FirePoint} from
     * @param  {FirePoint} to
     * @returns number
     */
    GeoFireClient.prototype.bearing = function (from, to) {
        return bearing$1([from.geopoint.latitude, from.geopoint.longitude], [to.geopoint.latitude, to.geopoint.longitude]);
    };
    return GeoFireClient;
}());
/**
 * Initialize the library by passing it your Firebase app
 * @param  {firestore.FirebaseApp} app
 * @returns GeoFireClient
 */
function init(app) {
    return new GeoFireClient(app);
}

export { GeoFireClient, GeoFireQuery, get, init, toGeoJSON };
