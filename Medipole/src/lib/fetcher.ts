/**
 * SWR Fetcher Utility
 *
 * This module provides a standardized fetcher function for SWR data fetching.
 * It handles API responses consistently and throws errors for failed requests.
 */

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  // Handle HTTP errors
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Failed to fetch data" }));
    throw new Error(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`
    );
  }

  return res.json();
};

/**
 * Custom fetcher with authentication support
 *
 * @param url - API endpoint URL
 * * @param token - Optional authentication token
 * @returns Promise with parsed JSON response
 */
export const authenticatedFetcher = async (url: string, token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Failed to fetch data" }));
    throw new Error(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`
    );
  }

  return res.json();
};

/**
 * POST request fetcher for mutations
 *
 * @param url - API endpoint URL
 * @param data - Data to send in request body
 * @returns Promise with parsed JSON response
 */
export const postFetcher = async (url: string, data: any) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Failed to create resource" }));
    throw new Error(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`
    );
  }

  return res.json();
};

/**
 * PUT request fetcher for updates
 *
 * @param url - API endpoint URL
 * @param data - Data to send in request body
 * @returns Promise with parsed JSON response
 */
export const putFetcher = async (url: string, data: any) => {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Failed to update resource" }));
    throw new Error(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`
    );
  }

  return res.json();
};

/**
 * DELETE request fetcher
 *
 * @param url - API endpoint URL
 * @returns Promise with parsed JSON response
 */
export const deleteFetcher = async (url: string) => {
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Failed to delete resource" }));
    throw new Error(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`
    );
  }

  return res.json();
};
