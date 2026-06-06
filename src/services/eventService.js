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
  increment,
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
  const update = { updatedAt: serverTimestamp() };
  if (deltas.totalContributors) update.totalContributors = increment(deltas.totalContributors);
  if (deltas.totalAmount) update.totalAmount = increment(deltas.totalAmount);
  if (deltas.totalCards) update.totalCards = increment(deltas.totalCards);
  await updateDoc(ref, update);
}
