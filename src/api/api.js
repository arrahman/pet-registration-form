import axios from "axios";

// Define base URL for API
const API_BASE_URL = "http://127.0.0.1:8000/api";

export const api = {
  getPetTypes() {
    return axios.get(`${API_BASE_URL}/pet-types`);
  },
  getBreedsByPetType(petTypeId) {
    return axios.get(`${API_BASE_URL}/pet-type/${petTypeId}/breeds`);
  },
  createPet(petData) {
    return axios.post(`${API_BASE_URL}/pet`, petData, {
      headers: { "Content-Type": "application/json" },
    });
  },
  getPets() {
    return axios.get(`${API_BASE_URL}/pets`);
  },
};
