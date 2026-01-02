const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class LoanApplicationAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async createApplication(applicationData) {
    try {
      const response = await fetch(`${this.baseURL}/loans/applications`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(applicationData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create application');
      }

      return data;
    } catch (error) {
      console.error('Create application error:', error);
      throw error;
    }
  }

  async updateApplication(applicationId, applicationData) {
    try {
      const response = await fetch(`${this.baseURL}/loans/applications/${applicationId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(applicationData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update application');
      }

      return data;
    } catch (error) {
      console.error('Update application error:', error);
      throw error;
    }
  }

  async submitApplication(applicationId) {
    try {
      const response = await fetch(`${this.baseURL}/loans/applications/${applicationId}/submit`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      return data;
    } catch (error) {
      console.error('Submit application error:', error);
      throw error;
    }
  }

  async uploadDocument(applicationId, documentType, file) {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}/loans/applications/${applicationId}/documents/${documentType}`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document');
      }

      return data;
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  }

  async getApplications(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${this.baseURL}/loans/applications?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get applications');
      }

      return data;
    } catch (error) {
      console.error('Get applications error:', error);
      throw error;
    }
  }

  async getApplication(applicationId) {
    try {
      const response = await fetch(`${this.baseURL}/loans/applications/${applicationId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get application');
      }

      return data;
    } catch (error) {
      console.error('Get application error:', error);
      throw error;
    }
  }

  async saveDraft(applicationId, applicationData) {
    try {
      const response = await fetch(`${this.baseURL}/loans/applications/${applicationId}/save-draft`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(applicationData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save draft');
      }

      return data;
    } catch (error) {
      console.error('Save draft error:', error);
      throw error;
    }
  }
}

export default new LoanApplicationAPI();