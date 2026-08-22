import NodeCache from 'node-cache';

// Cache in-memory dengan default Time-To-Live (TTL) 1 jam (3600 detik)
export const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Fungsi pembantu untuk menghapus semua cache yang berhubungan dengan user tertentu.
 * Harus dipanggil setiap kali terjadi perubahan data (Create/Update/Delete)
 * pada Transaksi, Produk, atau Profil Bisnis.
 */
export const invalidateUserCache = (userId: number | string) => {
  const keys = cache.keys();
  // Format key yang kita pakai selalu mengandung "_user_{userId}_"
  const keysToDelete = keys.filter(key => key.includes(`_user_${userId}_`));
  
  if (keysToDelete.length > 0) {
    cache.del(keysToDelete);
    console.log(`[Cache Invalidation] Deleted ${keysToDelete.length} keys for user ${userId}`);
  }
};
