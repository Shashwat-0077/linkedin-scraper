import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../types/api.js';

/**
 * Global error handler middleware
 */
export function errorHandler(err: Error, req: Request, res: Response<ApiResponse>, next: NextFunction) {
    console.error('Error:', err);

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal server error',
        timestamp: new Date().toISOString(),
    });
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response) {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
    });
}
