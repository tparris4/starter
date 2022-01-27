'use strict';


// import L from 'leaflet'

// prettier-ignore


class Workout {
  date = new Date();
  id = (Date().now + '').slice(-10);
  clicks = 0;


  constructor(coords, distance, duration) {

    this.coords = coords
    this.distance = distance // in km
    this.duration = duration // in min
    // this._setDescription()
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0]
      .toUpperCase()}${this.type.slice(1)} on 
      ${[this.date.getMonth()]}
       ${this.date.getDate()}`;
  }


  click() {
    this.clicks++;
  }
}
class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178)
// const cycling1 = new Running([39, -12], 27, 95, 523)
// console.log(run1, cycling1)


class Cycling extends Workout {
  type = 'cycling'
  //equvalent to thids.type = cycling
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);

    this.cadence = cadence;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpped() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// let map, mapEvent

// Application Architecture
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // get user's position
    this._getPosition();
    // the this form points to form

    // get data from local storage
    this._getLocalStorage();

    // fix with bing
    form.addEventListener('submit', this._newWorkout.bind(this));

    // change input type values
    inputType.addEventListener('change', this._toggleElevationField);

    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get position');
        }
      );
    }
  }

  // calledf by getCurrentPos functiopn call
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`)

    const coords = [latitude, longitude];
    // we can use the map object to use as an event listener to get click events
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //Empty inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);

  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__fow').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // rest parameters
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    // helper function
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If activity running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, cadence);

    }


    // Add new object to workout array
    this.#workouts.push(workout);


    // Render workout on map as markwer
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);
    // Hide form + Clear input fields
    this._hideForm();

    // Set local storage to all workouts
    this._setLocalStorage();
  }

  renderWorkoutMarker(workout) {
    // const { lat, lng } = mapEvent.latlng


    L.marker([workout.coords])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 200,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`

        })
      )
      .setPopupContent(`${workout.type} === 'running' ? 'run' : 'cycle'}
         ${workout.description}`)
      .openPopup();


    // Display marker
    //  console.log(mapEvent)

  }

  _renderWorkout(workout) {

    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? 'run' : 'bike'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
      `


    if (workout.type === 'running')
      html += `
       <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}/span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `

    if (workout.type === 'cycling')
      html += `
         <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> 
        `

    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(e) {
    // BUGFIX: When we click on a workout before the map has loaded, we get an error. But there is an easy fix:

    if (!this.#map) return;

    // closest is the opposite of a query selector
    const workoutEl = e.target.closest('.workout');

    if (!workoutEL)
      return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id);
    // leaflet method setView
    // setview needs the coordinates as the first arg, and zoom level as the 2nd
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1
      }
    });


  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}



const app = new App();

