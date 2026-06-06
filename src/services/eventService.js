import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';

const eventsRef = collection(db, COLLECTIONS.EVENTS);

export async function createEvent(ownerId, data) {
  const docRef = await addDoc(eventsRef, {
    ownerId,
    eventName: data.eventName,
    brideName: data.brideName,
    groomName: data.groomName,
    eventDate: data.eventDate,
    location: data.location,
    description: data.description || '',
    bannerUrl: data.bannerUrl || '',
    bannerPublicId: data.bannerPublicId || '',
    templateUrl: data.templateUrl || '',
    templatePublicId: data.templatePublicId || '',
    templateId: data.templateId || 'modern-minimal',
    status: 'active',
    totalContributors: 0,
    totalAmount: 0,
    totalCards: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEvent(eventId, data) {
  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId));
}

export async function getEvent(eventId) {
  const snap = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getEventsByOwner(ownerId) {
  const q = query(eventsRef, where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getRecentEvents(ownerId, count = 5) {
  const q = query(
    eventsRef,
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function incrementEventStats(eventId, deltas) {
  const ref = doc(db, COLLECTIONS.EVENTS, eventId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = snap.data();
  await updateDoc(ref, {
    totalContributors: Math.max(0, (current.totalContributors || 0) + (deltas.totalContributors || 0)),
    totalAmount: Math.max(0, (current.totalAmount || 0) + (deltas.totalAmount || 0)),
    totalCards: Math.max(0, (current.totalCards || 0) + (deltas.totalCards || 0)),
    updatedAt: serverTimestamp(),
  });
}
