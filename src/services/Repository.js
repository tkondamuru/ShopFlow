const useMock = true;

const fetchFromMock = async (endpoint) => {
  const response = await import(`../data/${endpoint}.json`);
  return response.default;
};

const fetchFromAPI = async (endpoint) => {
  const response = await fetch(`https://api.example.com/${endpoint}`);
  return response.json();
};

export const Repository = {
  getData: async (endpoint) => {
    return useMock ? fetchFromMock(endpoint) : fetchFromAPI(endpoint);
  }
};