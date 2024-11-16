import axios from "axios";

const APP_ID = "299a7dd3-dd26-4465-b3c1-10b77026f0d2";
const API_BASE = "https://nillion-storage-apis-v0.onrender.com";
let USER_ID;
let USER_SEED;

export const initializeNillion = (userSeed: string) => {
  USER_SEED = userSeed;
  console.log("Nillion initialized with seed:", userSeed);
};

export const createUser = async () => {
  if (!USER_SEED) throw new Error("USER_SEED not initialized");
  const response = await axios.post(`${API_BASE}/api/user`, {
    nillion_seed: USER_SEED,
  });
  USER_ID = response.data.nillion_user_id;
  return response.data;
};

export const storeGameBlob = async (gameBlob: string) => {
  if (!USER_SEED) throw new Error("USER_SEED not initialized");
  const response = await axios.post(`${API_BASE}/api/apps/${APP_ID}/secrets`, {
    secret: {
      nillion_seed: USER_SEED,
      secret_value: gameBlob,
      secret_name: "saveGame",
    },
    permissions: {
      retrieve: [],
      update: [],
      delete: [],
      compute: {},
    },
  });
  console.log("Game blob stored at:", response.data);
  return response.data;
};

export const retrieveGameBlob = async () => {
  if (!USER_SEED) throw new Error("USER_SEED not initialized");

  try {
    // First create/get user
    if (!USER_ID) {
      const user = await createUser();
      USER_ID = user.nillion_user_id;
      console.log("Created/Retrieved user:", USER_ID);
    }

    // Get store IDs
    const storeIdsResponse = await axios.get(`${API_BASE}/api/apps/${APP_ID}/store_ids`);
    const data = storeIdsResponse.data;
    console.log("Store IDs response:", data);

    const filteredStoreIds = data.store_ids.filter(
      (store) => store.nillion_user_id === USER_ID && store.secret_name === "saveGame"
    );
    console.log("Filtered Store IDs:", filteredStoreIds);

    if (!filteredStoreIds.length) {
      throw new Error("No saved game found");
    }

    const storeID = filteredStoreIds[0].store_id;
    console.log("Using Store ID:", storeID);

    // Add error handling for the retrieve request
    try {
      const retrieveUrl = `${API_BASE}/api/secret/retrieve/${storeID}?retrieve_as_nillion_user_seed=${USER_SEED}&secret_name=saveGame`;
      console.log("Retrieve URL:", retrieveUrl);

      const retrievedResponse = await axios.get(retrieveUrl);
      console.log("Retrieved Response:", retrievedResponse.data);

      return retrievedResponse.data;
    } catch (retrieveError) {
      console.error("Error during retrieve:", retrieveError.response?.data || retrieveError);
      throw new Error(`Failed to retrieve data: ${retrieveError.response?.data?.message || retrieveError.message}`);
    }
  } catch (error) {
    console.error("Error in retrieveGameBlob:", error.response?.data || error);
    throw error;
  }
};
// Updated example usage
// async function example() {
//   const user = await createUser();
//   console.log("User Nillion ID:", user.nillion_user_id);
//   USER_ID = user.nillion_user_id;

//   const testBlob = "testBlob";
//   await storeGameBlob(testBlob);
//   console.log("Stored Game Blob");

//   const retrievedGameBlob = await retrieveGameBlob();
//   console.log("Retrieved Game Blob:", retrievedGameBlob);
// }

// example();
