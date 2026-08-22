import re

file_path = "transaction.controller.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

reset_func = """
export const resetTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Find all Penjualan transactions to revert stock
    const penjualanTxs = await prisma.transaction.findMany({
      where: { userId, type: 'Penjualan' }
    });

    for (const tx of penjualanTxs) {
      if (tx.metadata) {
        try {
          const metaObj = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;
          if (metaObj.productId && metaObj.jumlah) {
            const qty = parseInt(String(metaObj.jumlah).replace(/\D/g, ''), 10);
            if (qty > 0) {
              await prisma.product.update({
                where: { id: Number(metaObj.productId) },
                data: { stock: { increment: qty } }
              }).catch(e => console.error('Failed to revert stock during reset:', e));
            }
          }
        } catch (e) {}
      }
    }

    await prisma.transaction.deleteMany({
      where: { userId }
    });

    res.json({ message: 'All transactions reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset transactions', error });
  }
};
"""

content = content + "\n" + reset_func

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

route_path = "../routes/transaction.routes.ts"
with open(route_path, "r", encoding="utf-8") as f:
    route_content = f.read()

route_content = route_content.replace(
    "import { getTransactions, getTransactionById, createTransaction, deleteTransaction, updateTransaction } from '../controllers/transaction.controller';",
    "import { getTransactions, getTransactionById, createTransaction, deleteTransaction, updateTransaction, resetTransactions } from '../controllers/transaction.controller';"
)

route_content = route_content.replace(
    "router.get('/', verifyToken, getTransactions);",
    "router.delete('/reset', verifyToken, resetTransactions);\nrouter.get('/', verifyToken, getTransactions);"
)

with open(route_path, "w", encoding="utf-8") as f:
    f.write(route_content)

print("Backend reset route added")
