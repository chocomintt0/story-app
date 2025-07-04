// Story Service for API interactions - Pure Vanilla JavaScript
export class StoryService {
    constructor() {
      this.baseURL = "https://story-api.dicoding.dev/v1"
      this.stories = []
      this.authToken = localStorage.getItem("authToken")
    }
  
    async register(userData) {
      try {
        console.log("Registering user:", userData)
  
        const response = await fetch(`${this.baseURL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            password: userData.password,
          }),
        })
  
        const result = await response.json()
        console.log("Register response:", result)
  
        if (!response.ok) {
          throw new Error(result.message || "Registration failed")
        }
  
        return result
      } catch (error) {
        console.error("Registration error:", error)
        throw error
      }
    }
  
    async login(credentials) {
      try {
        console.log("Logging in user:", credentials.email)
  
        const response = await fetch(`${this.baseURL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        })
  
        const result = await response.json()
        console.log("Login response:", result)
  
        if (!response.ok) {
          throw new Error(result.message || "Login failed")
        }
  
        // Store auth token
        this.authToken = result.loginResult.token
        localStorage.setItem("authToken", this.authToken)
        localStorage.setItem("userName", result.loginResult.name)
  
        return result
      } catch (error) {
        console.error("Login error:", error)
        throw error
      }
    }
  
    logout() {
      this.authToken = null
      localStorage.removeItem("authToken")
      localStorage.removeItem("userName")
    }
  
    isAuthenticated() {
      return !!this.authToken
    }
  
    async getAllStories() {
      try {
        console.log("Fetching stories with token:", this.authToken ? "Token exists" : "No token")
  
        const response = await fetch(`${this.baseURL}/stories`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
          },
        })
  
        const result = await response.json()
        console.log("Stories response:", result)
  
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch stories")
        }
  
        // Validate response structure
        if (result && result.listStory && Array.isArray(result.listStory)) {
          this.stories = result.listStory
        } else {
          console.warn("Unexpected API response structure, using mock data")
          this.stories = this.getMockStories()
        }
  
        return this.stories
      } catch (error) {
        console.error("Error fetching stories:", error)
        // Return mock data if API fails
        this.stories = this.getMockStories()
        return this.stories
      }
    }
  
    async getStoryById(id) {
      try {
        const response = await fetch(`${this.baseURL}/stories/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
          },
        })
  
        const result = await response.json()
  
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch story")
        }
  
        return result.story
      } catch (error) {
        console.error("Error fetching story:", error)
        // Fallback to find in local stories
        return this.stories.find((story) => story.id === id)
      }
    }
  
    async addStory(storyData) {
      try {
        console.log("Adding story:", storyData)
  
        const formData = new FormData()
        formData.append("description", storyData.description)
  
        // Ensure lat/lon are numbers
        const lat = Number.parseFloat(storyData.latitude)
        const lon = Number.parseFloat(storyData.longitude)
  
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error("Invalid location coordinates")
        }
  
        formData.append("lat", lat.toString())
        formData.append("lon", lon.toString())
  
        if (storyData.imageUrl && storyData.imageUrl.startsWith("data:")) {
          try {
            const response = await fetch(storyData.imageUrl)
            const blob = await response.blob()
            formData.append("photo", blob, "story-photo.jpg")
          } catch (error) {
            console.error("Error processing image:", error)
            throw new Error("Failed to process image")
          }
        } else {
          throw new Error("No valid image provided")
        }
  
        const response = await fetch(`${this.baseURL}/stories`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
          body: formData,
        })
  
        const result = await response.json()
        console.log("Add story response:", result)
  
        if (!response.ok) {
          throw new Error(result.message || "Failed to add story")
        }
  
        // Refresh stories list
        await this.getAllStories()
        return result
      } catch (error) {
        console.error("Error adding story:", error)
        throw error
      }
    }
  
    getMockStories() {
      return [
        {
          id: "story-1",
          name: "Sample Story 1",
          description: "This is a sample story from Jakarta. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          photoUrl: "https://picsum.photos/400/300?random=1",
          createdAt: "2024-01-15T10:30:00.000Z",
          lat: -6.2088,
          lon: 106.8456,
        },
        {
          id: "story-2",
          name: "Sample Story 2",
          description:
            "Another sample story from Bandung. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          photoUrl: "https://picsum.photos/400/300?random=2",
          createdAt: "2024-01-14T15:45:00.000Z",
          lat: -6.9175,
          lon: 107.6191,
        },
        {
          id: "story-3",
          name: "Sample Story 3",
          description: "A beautiful story from Yogyakarta. Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
          photoUrl: "https://picsum.photos/400/300?random=3",
          createdAt: "2024-01-13T08:20:00.000Z",
          lat: -7.7956,
          lon: 110.3695,
        },
      ]
    }
  }
  