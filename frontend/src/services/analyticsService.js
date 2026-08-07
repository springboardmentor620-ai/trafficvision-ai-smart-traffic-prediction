import axios from "axios";

const API = "http://127.0.0.1:8000/analytics";

export const getDashboardSummary = async () => {

  const response = await axios.get(
    `${API}/summary`
  );

  return response.data;

};

export const getSeverityDistribution = async () => {

  const response = await axios.get(
    `${API}/severity`
  );

  return response.data;

};

export const getWeatherDistribution = async () => {

  const response = await axios.get(
    `${API}/weather`
  );

  return response.data;

};

export const getTopCongestedAreas = async () => {

  const response = await axios.get(
    `${API}/top-areas`
  );

  return response.data;

};

export const getMonthlyTrend = async () => {

  const response = await axios.get(
    `${API}/monthly`
  );

  return response.data;

};