import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { generateCardId } from '../utils/codeGenerator';
import { linkContributorToCard } from './contributorService';

const cardsRef = collection(db, COLLECTIONS.CARDS);

/**
 * Generates a personalized card document for a contributor.
 * @returns {Promise<string>} the card id (used in the public /card/:cardId URL)
 */
export async function generateCard({ ownerId, eventId, contributor, templateId }) {
  const cardId = generateCardId();

  await setDoc(doc(cardsRef, cardId), {
    ownerId,
    eventId,
    contributorId: contributor.id,
    contributorName: contributor.fullName,
    contributorPhone: contributor.phone,
    amount: contributor.amount,
    invitationCode: contributor.invitationCode,
    templateId: templateId || 'modern-minimal',
    status: 'generated',
    downloadCount: 0,
    shareCount: 0,
    createdAt: serverTimestamp(),
  });

  await linkContributorToCard(contributor.id, cardId);

  return cardId;
}

export async function getCard(cardId) {
  const snap = await getDoc(doc(cardsRef, cardId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getCardsByEvent(eventId) {
  const q = query(cardsRef, where('eventId', '==', eventId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCardsByOwner(ownerId) {
  const q = query(cardsRef, where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function recordDownload(cardId, eventId, format, ownerId) {
  await updateDoc(doc(cardsRef, cardId), {
    downloadCount: increment(1),
    status: 'downloaded',
  });
  await addDoc(collection(db, COLLECTIONS.DOWNLOADS), {
    cardId,
    eventId,
    ownerId,
    format,
    createdAt: serverTimestamp(),
  });
}

export async function recordShare(cardId, eventId, channel = 'whatsapp', ownerId) {
  await updateDoc(doc(cardsRef, cardId), {
    shareCount: increment(1),
    status: 'shared',
  });
  await addDoc(collection(db, COLLECTIONS.SHARES), {
    cardId,
    eventId,
    ownerId,
    channel,
    createdAt: serverTimestamp(),
  });
}
