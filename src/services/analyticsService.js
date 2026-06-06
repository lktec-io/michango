import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
}

/** Builds the last `monthCount` month buckets ending with the current month. */
function buildMonthBuckets(monthCount) {
  const now = new Date();
  const buckets = [];
  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()] });
  }
  return buckets;
}

/**
 * Computes dashboard/report analytics for an owner by aggregating their
 * events, contributors, cards, downloads and shares client-side.
 */
export async function getOwnerAnalytics(ownerId, monthCount = 6) {
  const [eventsSnap, contributorsSnap, cardsSnap, downloadsSnap, sharesSnap] = await Promise.all([
    getDocs(query(collection(db, COLLECTIONS.EVENTS), where('ownerId', '==', ownerId))),
    getDocs(query(collection(db, COLLECTIONS.CONTRIBUTORS), where('ownerId', '==', ownerId))),
    getDocs(query(collection(db, COLLECTIONS.CARDS), where('ownerId', '==', ownerId))),
    getDocs(query(collection(db, COLLECTIONS.DOWNLOADS), where('ownerId', '==', ownerId))).catch(() => ({ docs: [] })),
    getDocs(query(collection(db, COLLECTIONS.SHARES), where('ownerId', '==', ownerId))).catch(() => ({ docs: [] })),
  ]);

  const events = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const contributors = contributorsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const cards = cardsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const totalContributions = contributors.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const downloadedCards = cards.filter((c) => (c.downloadCount || 0) > 0).length;
  const sharedCards = cards.filter((c) => (c.shareCount || 0) > 0).length;
  const activeEvents = events.filter((e) => e.status === 'active').length;

  const buckets = buildMonthBuckets(monthCount);
  const bucketIndex = new Map(buckets.map((b, idx) => [b.key, idx]));

  const monthlyContributors = buckets.map((b) => ({ month: b.label, count: 0 }));
  const monthlyContributions = buckets.map((b) => ({ month: b.label, amount: 0 }));

  contributors.forEach((c) => {
    const date = toDate(c.createdAt);
    if (!date) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const idx = bucketIndex.get(key);
    if (idx === undefined) return;
    monthlyContributors[idx].count += 1;
    monthlyContributions[idx].amount += Number(c.amount) || 0;
  });

  const eventPerformance = events
    .map((e) => ({
      eventName: e.eventName,
      contributors: e.totalContributors || 0,
      amount: e.totalAmount || 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  return {
    totals: {
      totalContributors: contributors.length,
      totalContributions,
      downloadedCards,
      sharedCards,
      activeEvents,
      totalEvents: events.length,
      totalCards: cards.length,
    },
    monthlyContributors,
    monthlyContributions,
    eventPerformance,
    downloads: downloadsSnap.docs?.length || 0,
    shares: sharesSnap.docs?.length || 0,
  };
}
