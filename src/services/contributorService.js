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
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { generateInvitationCode } from '../utils/codeGenerator';

const contributorsRef = collection(db, COLLECTIONS.CONTRIBUTORS);

export async function addContributor(ownerId, eventId, data) {
  const docRef = await addDoc(contributorsRef, {
    ownerId,
    eventId,
    fullName: data.fullName,
    phone: data.phone,
    amount: Number(data.amount) || 0,
    invitationCode: data.invitationCode || generateInvitationCode(),
    notes: data.notes || '',
    cardId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateContributor(contributorId, data) {
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (payload.amount !== undefined) payload.amount = Number(payload.amount) || 0;
  await updateDoc(doc(db, COLLECTIONS.CONTRIBUTORS, contributorId), payload);
}

export async function deleteContributor(contributorId) {
  await deleteDoc(doc(db, COLLECTIONS.CONTRIBUTORS, contributorId));
}

export async function getContributor(contributorId) {
  const snap = await getDoc(doc(db, COLLECTIONS.CONTRIBUTORS, contributorId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getContributorsByEvent(eventId, ownerId) {
  // Filtering on both eventId and ownerId (rather than eventId alone) lets Firestore's
  // security rules statically prove `resource.data.ownerId == request.auth.uid` for every
  // possible result — a query that only filtered on eventId would be denied outright.
  const q = query(
    contributorsRef,
    where('eventId', '==', eventId),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getContributorsByOwner(ownerId) {
  const q = query(contributorsRef, where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function linkContributorToCard(contributorId, cardId) {
  await updateDoc(doc(db, COLLECTIONS.CONTRIBUTORS, contributorId), {
    cardId,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Adds many contributors in batches (Firestore batch limit is 500 writes).
 * @returns {Promise<string[]>} ids of created contributor documents
 */
export async function bulkAddContributors(ownerId, eventId, rows) {
  const ids = [];
  const chunkSize = 450;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    chunk.forEach((row) => {
      const ref = doc(contributorsRef);
      ids.push(ref.id);
      batch.set(ref, {
        ownerId,
        eventId,
        fullName: row.name,
        phone: row.phone,
        amount: Number(row.amount) || 0,
        invitationCode: generateInvitationCode(),
        notes: '',
        cardId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  return ids;
}
