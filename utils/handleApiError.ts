export function handleApiError(error: any) {
  const message: string =
    error?.response?.data?.message ||
    error?.message ||
    'Unexpected error occurred'

  alert(message)
}


// Now: “random cart request” flow (so you can visualize)
// Example: user clicks “Add to cart”.

// Frontend code:

// await axios.post('/api/cart/add', { variant_id, qty: 1 })


// What happens under the hood:

// Request interceptor runs:

// Reads access_token from Zustand

// Adds header: Authorization: Bearer <access_token>

// Backend receives request:

// If access token valid → returns 200 (success)

// If access token expired → returns 401 with message "invalid or expired access token"

// Response interceptor sees that specific error:

// Calls /api/auth/refresh with:

// body { refresh_token: <from Zustand> }

// headers User-Agent, X-Platform, X-Device-Fingerprint

// Backend returns new access + new refresh

// Store is updated

// Original /api/cart/add request is retried once automatically

// User sees “added to cart” without noticing anything

// If refresh fails (expired refresh token, fingerprint mismatch, session not found):

// interceptor clears the store (logout)

// your UI will show login button again

// That’s the exact behavior you asked for.

// One last note (important with your backend)
// Your refresh endpoint can return "session fingerprint mismatch". If your device_id keeps changing, refresh will fail randomly. That’s why the stable getDeviceId() helper above is mandatory—never generate a new UUID per request.


