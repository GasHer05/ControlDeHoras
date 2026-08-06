import { db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const COLLECTION_NAME = "config";
const DOC_ID = "general";

const DEFAULT_CONFIG = {
  ivaRate: 22,
};

export const getConfig = async () => {
  const docRef = doc(db, COLLECTION_NAME, DOC_ID);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return { ...DEFAULT_CONFIG };
  }
  return { ...DEFAULT_CONFIG, ...docSnap.data() };
};

export const updateConfig = async (configData) => {
  const docRef = doc(db, COLLECTION_NAME, DOC_ID);
  await setDoc(docRef, configData, { merge: true });
  return getConfig();
};
