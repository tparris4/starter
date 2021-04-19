'use strict'; // import L from 'leaflet'
// prettier-ignore

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var form = document.querySelector('.form');
var containerWorkouts = document.querySelector('.workouts');
var inputType = document.querySelector('.form__input--type');
var inputDistance = document.querySelector('.form__input--distance');
var inputDuration = document.querySelector('.form__input--duration');
var inputCadence = document.querySelector('.form__input--cadence');
var inputElevation = document.querySelector('.form__input--elevation');
var map, mapEvent;

var App =
/*#__PURE__*/
function () {
  function App() {
    _classCallCheck(this, App);

    app._getPosition();
  }

  _createClass(App, [{
    key: "_getPosition",
    value: function _getPosition() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this._loadMap, function () {
          alert('Could not get your position');
        });
      }
    }
  }, {
    key: "_loadMap",
    value: function _loadMap(position) {
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;
      console.log("https://www.google.com/maps/@".concat(latitude, ",").concat(longitude));
      var coords = [latitude, longitude]; // we can use the map object to use as an event listener to get click events

      map = L.map('map').setView(coords, 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map); // Handling clicks on map

      map.on('click', function (mapE) {
        mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    }
  }, {
    key: "_showForm",
    value: function _showForm() {}
  }, {
    key: "_toggleElevationField",
    value: function _toggleElevationField() {}
  }, {
    key: "_newWorkout",
    value: function _newWorkout() {}
  }]);

  return App;
}();

var app = new App(); // if (navigator.geolocation)
//   navigator.geolocation.getCurrentPosition(
//     function (position) {
//       const { latitude } = position.coords;
//       const { longitude } = position.coords;
//       console.log(latitude, longitude);
//     },
//     function () {
//       alert('Could not get your position');
//     }
//   );
// leaflet library

form.addEventListener('submit', function (e) {
  e.preventDefault(); // Clear input fields

  inputDistance.value = inputDuration = (_readOnlyError("inputDuration"), inputCadence = inputElevation = (_readOnlyError("inputElevation"), '')); // Display marker

  console.log(mapEvent);
  var _mapEvent$latlng = mapEvent.latlng,
      lat = _mapEvent$latlng.lat,
      lng = _mapEvent$latlng.lng;
  L.marker([lat, lng]).addTo(map).bindPopup(L.popup({
    maxWidth: 250,
    minWidth: 200,
    autoClose: false,
    closeOnClick: false,
    className: 'running-popup'
  })).setPopupContent('Workout').openPopup();
}); // change input type values

inputType.addEventListener('change', function () {
  // DOM traversal
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__fow').classList.toggle('form__row--hidden');
});