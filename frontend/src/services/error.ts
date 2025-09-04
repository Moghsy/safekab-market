export class ApiError extends Error {
    public status: number;
    public validationErrors?: Array<{ field: string; message: string }>;

    constructor(message: string, status: number, validationErrors?: Array<{ field: string; message: string }>) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.validationErrors = validationErrors;
    }
}

export interface ErrorResponse {
    status: number;
    error: string;
    message: string;
    path: string;
    timestamp: string;
    validation_errors?: Array<{
        field: string;
        message: string;
    }>;
}