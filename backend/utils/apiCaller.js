const axios = require('axios');

const apiCaller = async (endpoint, params) => {
    try{
        const response = await axios.get(endpoint, { params });
        return response.data;
    } catch (error) {
        console.error(`Error calling ${endpoint}:`, error.message);
        throw new Error('Failed to fetch data from the API');
    }
};

module.exports = apiCaller;