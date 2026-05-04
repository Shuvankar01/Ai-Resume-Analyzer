import api from './api';

export const resumeService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  analyze: async (resumeId, jobDescription) => {
    const formData = new FormData();
    formData.append('job_description', jobDescription);
    
    // 1. Start Job
    const startResponse = await api.post(`/resumes/${resumeId}/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    const jobId = startResponse.data.id;
    
    // 2. Poll for Completion
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const statusResponse = await api.get(`/jobs/${jobId}`);
          const job = statusResponse.data;
          
          if (job.status === 'done') {
            resolve(job.result);
          } else if (job.status === 'failed') {
            reject(new Error(job.error || 'Analysis failed'));
          } else {
            // Wait 2 seconds and poll again
            setTimeout(poll, 2000);
          }
        } catch (err) {
          reject(err);
        }
      };
      
      poll();
    });
  },
  
  getReport: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}/report`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  getDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  }
};
