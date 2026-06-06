import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';

export async function ensureUserProfile(user) {
  const ref = doc(db, COLLECTIONS.USERS, user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };

  const profile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    companyName: '',
    logoUrl: '',
    theme: 'light',
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
  return { id: user.uid, ...profile };
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function addCustomTemplate(uid, template) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    customTemplates: arrayUnion(template),
    updatedAt: serverTimestamp(),
  });
}

export async function removeCustomTemplate(uid, template) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    customTemplates: arrayRemove(template),
    updatedAt: serverTimestamp(),
  });
}
