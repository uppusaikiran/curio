// Example Netlify serverless function
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Curio API!',
      timestamp: new Date().toISOString(),
    }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Update for production
    },
  };
}; 