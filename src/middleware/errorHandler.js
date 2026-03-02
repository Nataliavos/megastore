export const errorHandler = (err, req, res, next) => {
  console.error('❌ Uncontrolled error', err.message);
  const status = err.status ?? 500;
  res.status(status).json({ error: err.message ?? 'Internal Server Error' });
};
