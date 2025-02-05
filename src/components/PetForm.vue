<template>
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
        <div class="card p-4 shadow-lg border-0"
            style="width: 100%; max-width: 600px; background-color: white; border-radius: 15px;">
            <div class="text-center mb-4">
                <span class="step active">🐾</span>
                <span class="step">🐾</span>
                <span class="step">🐾</span>
                <span class="step">🐾</span>
            </div>

            <h2 class="text-primary text-center">Tell us about your pet</h2>

            <form @submit.prevent="submitForm">
                <div class="mb-3">
                    <label class="form-label">What is your pet’s name?</label>
                    <input type="text" class="form-control" v-model="pet.name" required />
                    <small v-if="errors.name" class="text-danger">{{ errors.name }}</small>
                </div>

                <div class="mb-3">
                    <label class="form-label">What type of pet?</label>
                    <select class="form-select" v-model="pet.petTypeId" @change="updateBreeds">
                        <option v-for="petType in petTypes" :key="petType.id" :value="petType.id">{{ petType.name }}
                        </option>
                    </select>
                    <small v-if="errors.petTypeId" class="text-danger">{{ errors.petTypeId }}</small>
                </div>

                <div class="mb-3">
                    <label class="form-label">What breed are they?</label>
                    <div class="input-group">
                        <select class="form-select" v-model="pet.breedId" :disabled="isCantFindClicked">
                            <option v-for="breed in breeds" :key="breed.id" :value="breed.id">{{ breed.name }}</option>
                        </select>
                        <button class="btn btn-outline-secondary" type="button" @click="toggleCantFind">Can't
                            find?</button>
                    </div>

                    <div v-if="isCantFindClicked" class="mt-2">
                        <label class="form-label">Choose One</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" v-model="alternativeBreed" value="unknown" />
                            <label class="form-check-label">I don’t know</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" v-model="alternativeBreed" value="mix" />
                            <label class="form-check-label">It’s a mix</label>
                        </div>
                        <input v-if="alternativeBreed === 'mix'" type="text" class="form-control mt-2"
                            v-model="mixBreedDetails" placeholder="Collie, Poodle, Lab" />
                        <small v-if="errors.breedId" class="text-danger">{{ errors.breedId }}</small>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Do you know their date of birth?</label>
                    <div class="btn-group w-100" role="group">
                        <input type="radio" class="btn-check" id="dob-yes" value="yes" v-model="knowDOB">
                        <label class="btn btn-outline-primary" for="dob-yes">Yes</label>

                        <input type="radio" class="btn-check" id="dob-no" value="no" v-model="knowDOB">
                        <label class="btn btn-outline-primary" for="dob-no">No</label>
                    </div>
                </div>

                <!-- Conditionally show input fields -->
                <div v-if="knowDOB === 'yes'" class="mb-3">
                    <label class="form-label">Birthdate</label>
                    <div class="row">
                        <div class="col"><input type="text" class="form-control" v-model="dob.year" placeholder="yyyy">
                        </div>
                        <div class="col"><input type="text" class="form-control" v-model="dob.month" placeholder="mm">
                        </div>
                        <div class="col"><input type="text" class="form-control" v-model="dob.day" placeholder="dd">
                        </div>
                    </div>
                    <small v-if="errors.dateOfBirth" class="text-danger">{{ errors.dateOfBirth }}</small>

                </div>

                <div v-if="knowDOB === 'no'" class="mb-3">
                    <label class="form-label">Approximate Age</label>
                    <select class="form-select" v-model="pet.age">
                        <option value="1">1 Year</option>
                        <option value="2">2 Years</option>
                        <option value="3">3 Years</option>
                    </select>
                    <small v-if="errors.dateOfBirth" class="text-danger">{{ errors.dateOfBirth }}</small>
                </div>

                <div class="mb-3">
                    <label class="form-label">What gender are they?</label>
                    <div class="btn-group w-100" role="group">
                        <input type="radio" class="btn-check" id="gender-male" value="Male" v-model="pet.gender">
                        <label class="btn btn-outline-primary" for="gender-male">Male</label>

                        <input type="radio" class="btn-check" id="gender-female" value="Female" v-model="pet.gender">
                        <label class="btn btn-outline-primary" for="gender-female">Female</label>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 mt-3">Register</button>
            </form>
        </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" tabindex="-1"
        role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Pet Registered Successfully</h5>
                    <button type="button" class="btn-close" @click="closeModal"></button>
                </div>
                <div class="modal-body">
                    <p><strong>Name:</strong> {{ registeredPet.name }}</p>
                    <p><strong>Type:</strong> {{ registeredPet.type }}</p>
                    <p><strong>Breed:</strong> {{ registeredPet.breed }}</p>
                    <p><strong>Gender:</strong> {{ registeredPet.gender }}</p>
                    <p><strong>Age:</strong> {{ getAge(registeredPet.dateOfBirth) }}</p>
                    <p v-if="registeredPet.isDangerous" class="text-danger fw-bold">⚠️ This pet is considered
                        dangerous!</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { formatDistanceToNow } from 'date-fns';
import { api } from ".././api/api.js";

export default {
    data() {
        return {
            pet: {
                name: "",
                petTypeId: null,
                breedId: null,
                age: null,
                gender: "Male",
            },
            petTypes: [],
            breeds: [],
            knowDOB: "no",
            dob: { year: "", month: "", day: "" },
            isCantFindClicked: false,
            alternativeBreed: "",
            mixBreedDetails: "",
            errors: {},
            showModal: false,
            registeredPet: {},
        };
    },
    methods: {
        async loadPetTypes() {
            try {
                const response = await api.getPetTypes();
                this.petTypes = response.data;
            } catch (error) {
                console.error("Error fetching pet types:", error);
            }
        },
        async updateBreeds() {
            const response = await api.getBreedsByPetType(this.pet.petTypeId);
            this.breeds = response.data;
            this.pet.breedId = this.breeds.length > 0 ? this.breeds[0].id : null;
        },
        toggleCantFind() {
            this.isCantFindClicked = !this.isCantFindClicked;
            if (this.isCantFindClicked) {
                this.pet.breedId = null;
                console.log(this.pet);
            }
        },
        getAge(dateOfBirth) {
            if (!dateOfBirth) return "";
            return formatDistanceToNow(new Date(dateOfBirth), { addSuffix: false });
        },
        closeModal() {
            this.showModal = false;
        },
        async submitForm() {

            if (!this.validateForm()) {
                return;
            }

            let dateOfBirth = '';
            let breedName = this.isCantFindClicked ? (this.alternativeBreed === "mix" ? this.mixBreedDetails : 'unknown') : this.breeds[0].name;
            if (this.knowDOB == 'yes') {
                dateOfBirth = this.dob.year + '-' + this.dob.month + '-' + this.dob.day
            }

            const petData = {
                ...this.pet,
                dateOfBirth,
                breedName,
            };
            try {
                const response = await api.createPet(petData);

                this.registeredPet = response.data;
                this.showModal = true;
                this.errors = {};

            } catch (error) {
                console.error("Error registering pet:", error);
                if (error.response && error.response.data) {
                    this.errors = {};
                    error.response.data.forEach(err => {
                        this.errors[err.property] = err.message;
                    });
                } else {
                    alert("Failed to register pet.");
                }
            }
        },

        validateForm() {
            this.errors = {};
            
            if (!this.pet.name.trim()) {
                this.errors.name = "Pet name is required.";
            }
            if (!this.pet.petTypeId) {
                this.errors.petTypeId = "Pet type must be selected.";
            }
            return Object.keys(this.errors).length === 0;
        },
    },
    mounted() {
        this.loadPetTypes();
    },
};
</script>

<style>
.card {
    border-radius: 15px;
}

.text-danger {
    font-size: 0.875rem;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>