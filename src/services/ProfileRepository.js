import { API_BASE_URL } from './Repository';
import * as SecureStore from 'expo-secure-store';

// Helper function to get JWT token
const getJwtToken = async () => {
  return await SecureStore.getItemAsync('jwt_token');
};

// Helper function to make authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API call failed: ${response.status}`);
  }
  
  return response;
};

class ProfileRepository {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Get all available security questions
  async getAllSecurityQuestions() {
    try {
      console.log('getAllSecurityQuestions');
      console.log(`${this.baseUrl}api/security/all_questions`);
      const response = await authenticatedFetch(`${this.baseUrl}api/security/all_questions`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching security questions:', error);
      throw error;
    }
  }

  // Get user's security profile
  async getUserSecurityProfile(username) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}api/security/${username}/profile`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user security profile:', error);
      throw error;
    }
  }

  // Update user's email
  async updateUserEmail(username, email) {
    try {
      const response = await authenticatedFetch(`${this.baseUrl}api/security/${username}/email`, {
        method: 'PUT',
        body: JSON.stringify({ email }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error updating user email:', error);
      throw error;
    }
  }

  // Update user's password
  async updateUserPassword(username, password) {
    try {
      console.log('updateUserPassword');
      console.log(`${this.baseUrl}api/security/${username}/password`);
      console.log(password);
      const response = await authenticatedFetch(`${this.baseUrl}api/security/${username}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
  }

  // Update user's security questions
  async updateSecurityQuestions(username, data) {
    try {
      console.log('updateSecurityQuestions');
      console.log(`${this.baseUrl}api/security/${username}/updatequestions`);
      console.log(data);
      const response = await authenticatedFetch(`${this.baseUrl}api/security/${username}/updatequestions`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error('Error updating security questions:', error);
      throw error;
    }
  }
}

export default ProfileRepository; 