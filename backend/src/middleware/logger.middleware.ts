import { Request, Response, NextFunction } from 'express';

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Format the current time for readability
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
  
  // Clone body to avoid mutating the original request, and mask sensitive fields like password
  let safeBody = { ...req.body };
  if (safeBody.password) {
    safeBody.password = '***MASKED***';
  }

  // Define colors for console output
  const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m"
  };

  const methodColor = 
    req.method === 'GET' ? colors.green : 
    req.method === 'POST' ? colors.cyan : 
    req.method === 'PUT' ? colors.yellow : 
    req.method === 'DELETE' ? colors.red : colors.magenta;

  console.log(`\n${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.yellow}[${timestamp}]${colors.reset} ➡️  ${methodColor}${req.method}${colors.reset} ${req.originalUrl}`);
  
  if (Object.keys(req.query).length > 0) {
    console.log(`🔍 Query:`, req.query);
  }
  
  if (Object.keys(safeBody).length > 0) {
    console.log(`📦 Body:`, safeBody);
  }

  // Hook into response finish event to log the result
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? colors.red : colors.green;
    
    console.log(`${colors.yellow}[${timestamp}]${colors.reset} ⬅️  ${methodColor}${req.method}${colors.reset} ${req.originalUrl} - ${statusColor}Status: ${res.statusCode}${colors.reset} (${duration}ms)`);
    console.log(`${colors.cyan}================================================================${colors.reset}`);
  });

  next();
};
