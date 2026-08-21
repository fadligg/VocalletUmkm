import re

file_path = "transaction.controller.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# For createTransaction
create_logic = """
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        trx_id,
        type,
        date: new Date(date),
        amount,
        payment_method,
        description,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : '{}',
      },
    });

    // SYNC STOCK FOR PENJUALAN
    if (type === 'Penjualan' && metadata) {
      const metaObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      if (metaObj.productId && metaObj.jumlah) {
        const qty = parseInt(String(metaObj.jumlah).replace(/\D/g, ''), 10);
        if (qty > 0) {
          await prisma.product.update({
            where: { id: Number(metaObj.productId) },
            data: { stock: { decrement: qty } }
          }).catch(err => console.error("Failed to decrement stock:", err));
        }
      }
    }
"""

content = re.sub(
    r'const transaction = await prisma\.transaction\.create\(\{[\s\S]*?\}\);',
    create_logic.strip(),
    content
)

# For deleteTransaction
delete_logic = """
    const existing = await prisma.transaction.findFirst({ where: { id: Number(id), userId } });
    if (!existing) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    // SYNC STOCK FOR PENJUALAN (RESTORE STOCK)
    if (existing.type === 'Penjualan' && existing.metadata) {
      try {
        const metaObj = JSON.parse(existing.metadata);
        if (metaObj.productId && metaObj.jumlah) {
          const qty = parseInt(String(metaObj.jumlah).replace(/\D/g, ''), 10);
          if (qty > 0) {
            await prisma.product.update({
              where: { id: Number(metaObj.productId) },
              data: { stock: { increment: qty } }
            }).catch(err => console.error("Failed to increment stock:", err));
          }
        }
      } catch(e) {}
    }

    await prisma.transaction.delete({
"""

content = re.sub(
    r"const existing = await prisma\.transaction\.findFirst\(\{ where: \{ id: Number\(id\), userId \} \}\);\s*if \(\!existing\) \{\s*res\.status\(404\)\.json\(\{ message: 'Transaction not found' \}\);\s*return;\s*\}\s*await prisma\.transaction\.delete\(\{",
    delete_logic.strip() + "\n",
    content
)

# For updateTransaction
update_logic = """
    const existing = await prisma.transaction.findUnique({ where: { id: Number(id) } });
    
    const transaction = await prisma.transaction.update({
      where: { id: Number(id) },
      data: {
        trx_id,
        type,
        date: new Date(date),
        amount,
        payment_method,
        description,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : '{}',
      },
    });

    // SYNC STOCK FOR PENJUALAN UPDATE
    if (existing && existing.type === 'Penjualan' && existing.metadata) {
       // Restore old stock
       try {
         const oldMeta = JSON.parse(existing.metadata);
         if (oldMeta.productId && oldMeta.jumlah) {
           const oldQty = parseInt(String(oldMeta.jumlah).replace(/\D/g, ''), 10);
           if (oldQty > 0) {
             await prisma.product.update({
               where: { id: Number(oldMeta.productId) },
               data: { stock: { increment: oldQty } }
             }).catch(e => console.error(e));
           }
         }
       } catch(e) {}
    }

    if (type === 'Penjualan' && metadata) {
       // Deduct new stock
       try {
         const newMeta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
         if (newMeta.productId && newMeta.jumlah) {
           const newQty = parseInt(String(newMeta.jumlah).replace(/\D/g, ''), 10);
           if (newQty > 0) {
             await prisma.product.update({
               where: { id: Number(newMeta.productId) },
               data: { stock: { decrement: newQty } }
             }).catch(e => console.error(e));
           }
         }
       } catch(e) {}
    }
"""

content = re.sub(
    r'const transaction = await prisma\.transaction\.update\(\{[\s\S]*?\}\);',
    update_logic.strip(),
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Backend stock sync updated")
