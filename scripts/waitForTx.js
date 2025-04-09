const {
    EXPLORER,
} = process.env

const { log } = console

/**
 * Print pretty logging for transactions
 * @param {string} txDescription
 * @param {import("ethers").ContractTransaction} tx
 */

async function waitForTx(txDescription, tx) {
    if (EXPLORER) {
        log("Follow %s: %s/tx/%s", txDescription, EXPLORER, tx.hash)
    } else {
        log("Waiting for %s, hash: %s", txDescription, tx.hash)
    }
    const tr = await tx.wait()
    log("Transaction receipt: ", tr)
}
exports.waitForTx = waitForTx
