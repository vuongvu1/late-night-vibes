const baseURL = import.meta.env.VITE_BE_URL;

export const getStory = async () => {
  try {
    const response = await fetch(`${baseURL}/story`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle the error here
    console.error("Error fetching story:", error);
  }

  return null;
};
