'use strict';

// prettier-ignore




//1. Class Workout
class Workout {

    id = Number((Date.now() + "").slice(-10))
    date = new Date()

    constructor(distance, duration, coords) {

        this.distance = distance
        this.duration = duration
        this.coords = coords
    }
    _setDescription() {
        // Monthly dates
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        // Example: Running on April 3
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]
            } ${this.date.getDate()}`;
    }
}

//1.1. Child class Running
class Running extends Workout {

    type = "running"
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords)
        this.cadence = cadence

        this.calcPace()
        this._setDescription()
    }

    calcPace() {

        this.pace = this.duration / this.distance

    }

}


//1.2 Child class Cycling

class Cycling extends Workout {

    type = "cycling"
    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords)
        this.elevationGain = elevationGain

        this.calcSpeed()
        this._setDescription()

    }

    calcSpeed() {

        this.speed = this.distance / (this.duration / 60)

    }
}




const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// Class App
class App {

    #map
    #mapEvent
    #mapZoom = 13
    #workouts = []
    constructor() {

        // call _getPosition first
        this._getPosition()
        // call the _getLocalStorage
        this._getLocalStorage()



        // attach eventlistener here because we want to load it as the script load
        //click with the enter the form 
        form.addEventListener('submit', this._newWorkOut.bind(this))
        inputType.addEventListener("change", this._toggleElevationField)
        containerWorkouts.addEventListener("click", this._moveToPopUp.bind(this))

    }


    _getPosition() {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMapPosition.bind(this), function () {
                alert("could not get your position")
            });
        }

        // position of map navigator.geolocation  Hint this._loadMapposition.bind(this)

    }
    _loadMapPosition(position) {
        // loadMap here from const {latitude,longitude}  //this.#map

        const { longitude, latitude } = position.coords;

        this.#map = L.map('map').setView([latitude, longitude], this.#mapZoom);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);

        //2. click on the map the form should visible

        this.#map.on('click', this._showForm.bind(this))

        this.#workouts.forEach((workout) => this._renderWorkoutMarker(workout))

    }

    _showForm(mapE) {

        // form showing hidding
        this.#mapEvent = mapE
        form.classList.remove('hidden')
        // focus on field for better User experience
        inputDistance.focus()

    }
    _hideForm() {

        //1 clears all input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ""
        form.style.display = "none"
        form.classList.add("hidden")
        setTimeout(() => form.style.display = "grid", 1000)

    }

    _toggleElevationField() {
        // toggling event form
        //2. toggle the input to cadence or distance if type is changed   Running -> cadence,   Cycling-> elevation
        // we do this outsidethe form.addEventListener because we should do it where form is visible

        //go to parent
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')

    }

    _renderWorkout(workout) {

        let html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type == "running" ? "🏃‍♂️" : "🚴‍♀️"}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
            `


        if (workout.type == 'running') {

            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`

        }

        if (workout.type == 'cycling') {

            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
                </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
            </div>
        </li>`
        }

        form.insertAdjacentHTML('afterend', html)

    }


    _newWorkOut(e) {
        //submitting form comes here because we create a new Workout



        // Helper functions

        // valid Inputs
        const validInputs = (...inputs) => inputs.every(input => Number.isFinite(input))

        // onlyPositive numbers
        const allPositive = (...inputs) => inputs.every(input => input > 0)


        e.preventDefault()

        // Get the data from Form

        //common
        const duration = Number(inputDuration.value)
        const distance = Number(inputDistance.value)

        // Running 
        const cadence = Number(inputCadence.value)

        //cycling
        const elevationGain = Number(inputElevation.value)

        // Check if data is valid

        const { lat, lng } = this.#mapEvent.latlng
        let workout
        if (inputType.value == "running") {

            if (!validInputs(duration, distance, cadence) || !allPositive(duration, distance, cadence)) {

                return alert("Inputs must be positive numbers")

            }

            // if workout running , create running object
            //1. Push workout to workouts array   distance, duration, coords, cadence

            workout = new Running(distance, duration, [lat, lng], cadence)
            this.#workouts.push(workout)

            console.log(this.#workouts)
            console.log('this is for running')
        }


        if (inputType.value == "cycling") {

            if (!validInputs(duration, distance, elevationGain) || !allPositive(duration, distance)) {

                return alert("Number must be positive numbers")

            }

            // if workout cycling , create cycling object

            workout = new Cycling(distance, duration, [lat, lng], elevationGain)

            // Add newObject to workout Array
            this.#workouts.push(workout)
            console.log('this is for cycling')
        }


        // Render workout in the list
        this._renderWorkout(workout)

        //Hide form and clear fields
        this._hideForm()

        // render workout marker
        this._renderWorkoutMarker(workout)

        // save in local storage
        this._setLocalStorage()

        // get data from local storage
        // this._getLocalStorage()

    }

    _moveToPopUp(e) {

        // event delegation

        const workoutEl = e.target.closest(".workout")
        console.log(workoutEl)

        if (!workoutEl) return

        //find id from workouts and store it in const workout  bridge between workouts element in our array and html element id which is data-id

        const workout = this.#workouts.find(work => work.id == workoutEl.dataset.id)

        // grap cordinates now and set zoom
        console.log(workout.coords)

        //this.#map.setView(coordinates,zoomlevel no, option)
        this.#map.setView(workout.coords, this.#mapZoom, { animate: true, pan: { duration: 1 } })
    }


    _renderWorkoutMarker(workout) {

        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(L.popup({ maxWidth: 300, minWidth: 100, autoClose: false, closeOnClick: false, className: `${workout.type}-popup` })).setPopupContent(`${workout.type == "running" ? "🏃‍♂️" : "🚴"} ${workout.description}`)
            .openPopup();

    }
    _setLocalStorage() {
        //1. first set the data in local storage
        localStorage.setItem('workouts', JSON.stringify(this.#workouts))

        //2. Display it on UI

    }
    _getLocalStorage() {

        //getitem get one arguement
        const data = JSON.parse(localStorage.getItem('workouts'));

        if (!data) return

        // equal our data with our this.#workouts.
        this.#workouts = data

        //3 now forEach loop to render each workout in our renderWorkout method
        this.#workouts.forEach((workout) => this._renderWorkout(workout))

        // renderWorkoutMarker wont work here because the map is not loaded so take it when map is loaded

    }

}

const app = new App()