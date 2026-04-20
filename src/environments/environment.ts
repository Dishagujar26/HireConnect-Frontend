export const environment = {
  production: false,
  // [Disha Gujar] : All API calls go through the API Gateway on port 8080
  authServiceBaseUrl: 'http://localhost:8080/api/v1/auth',
  paymentServiceBaseUrl: 'http://localhost:8080/api/payments'
};