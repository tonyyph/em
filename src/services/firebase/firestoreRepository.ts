import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where
} from "firebase/firestore";
import type { Cycle } from "@/domain/entities/cycle";
import type { OvulationLog } from "@/domain/entities/ovulation";
import type { Pregnancy } from "@/domain/entities/pregnancy";
import type { SymptomLog } from "@/domain/entities/symptom";
import { getFirestoreDb } from "./config";

type WithId<T> = T & { id: string };
type CollectionName = "cycles" | "symptoms" | "ovulation_logs" | "pregnancy";

const fetchByUser = async <T>(collectionName: CollectionName, userId: string, orderField = "date") => {
  const db = getFirestoreDb();
  const snapshot = await getDocs(
    query(collection(db, collectionName), where("userId", "==", userId), orderBy(orderField, "asc"))
  );

  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as WithId<T>);
};

const upsert = async <T extends { id?: string }>(collectionName: CollectionName, value: T) => {
  const db = getFirestoreDb();
  const { id, ...payload } = value;
  if (id) {
    await setDoc(doc(db, collectionName, id), payload, { merge: true });
    return id;
  }

  const ref = await addDoc(collection(db, collectionName), payload);
  return ref.id;
};

export const firestoreRepository = {
  cycles: {
    list: (userId: string) => fetchByUser<Cycle>("cycles", userId, "startDate"),
    upsert: (cycle: Cycle) => upsert("cycles", cycle),
    remove: (id: string) => deleteDoc(doc(getFirestoreDb(), "cycles", id))
  },
  symptoms: {
    list: (userId: string) => fetchByUser<SymptomLog>("symptoms", userId),
    upsert: (symptom: SymptomLog) => upsert("symptoms", symptom),
    remove: (id: string) => deleteDoc(doc(getFirestoreDb(), "symptoms", id))
  },
  ovulationLogs: {
    list: (userId: string) => fetchByUser<OvulationLog>("ovulation_logs", userId),
    upsert: (log: OvulationLog) => upsert("ovulation_logs", log),
    remove: (id: string) => deleteDoc(doc(getFirestoreDb(), "ovulation_logs", id))
  },
  pregnancy: {
    list: (userId: string) => fetchByUser<Pregnancy>("pregnancy", userId),
    upsert: (pregnancy: Pregnancy) => upsert("pregnancy", pregnancy),
    remove: (id: string) => deleteDoc(doc(getFirestoreDb(), "pregnancy", id))
  }
};
