const formatError = (err, customMessage) => {
    // Safety check
    if (!err) {
        return {
            type: "unknown",
            message: customMessage || "Unexpected error occurred",
        };
    }

    if (!navigator.onLine) {
        return {
            type: "network",
            message: "Check your internet connection",
        };
    }

    // Server not reachable (VERY IMPORTANT FIX)
    if (!err.response) {
        return {
            type: "server",
            message: "Server is not responding. Please try again later.",
        };
    }

    const status = err.response.status;

    // Auth errors
    if (status === 401 || status === 403) {
        return {
            type: "auth",
            message: customMessage || "You are not authorized",
        };
    }

    // Not found
    if (status === 404) {
        return {
            type: "not_found",
            message: customMessage || "Requested resource not found",
        };
    }

    // Server error
    if (status >= 500) {
        return {
            type: "server",
            message: customMessage || "Server error occurred",
        };
    }

    // General error
    return {
        type: "general",
        message:
            customMessage ||
            err.response.data?.message ||
            "Something went wrong",
    };
};

export default formatError;