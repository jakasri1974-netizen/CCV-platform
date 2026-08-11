const crypto = require("crypto");

/**
 * Combine two hex node hashes via SHA-256
 */
function combineHashes(firstHex, secondHex) {
  const cleanFirst = String(firstHex || "").replace(/^0x/i, "");
  const cleanSecond = String(secondHex || "").replace(/^0x/i, "");
  
  const combinedBuffer = Buffer.from(cleanFirst + cleanSecond, "hex");
  const hashHex = crypto.createHash("sha256").update(combinedBuffer).digest("hex");
  return "0x" + hashHex;
}

/**
 * Build complete Merkle Tree from an array of SHA-256 certificate hashes.
 * Duplicate odd last leaf/node per Merkle Tree standard.
 * @param {Array<string>} leafHashes
 * @returns {Object} { layers: Array<Array<string>>, root: string }
 */
function buildMerkleTree(leafHashes) {
  if (!leafHashes || leafHashes.length === 0) {
    const emptyRoot = "0x" + "0".repeat(64);
    return { layers: [[]], root: emptyRoot };
  }

  // Format all leaf hashes consistently
  let currentLayer = leafHashes.map((h) => {
    let clean = String(h || "").trim();
    if (!clean.startsWith("0x")) clean = "0x" + clean;
    return clean.toLowerCase();
  });

  const layers = [currentLayer];

  while (currentLayer.length > 1) {
    const nextLayer = [];
    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i];
      // Duplicate last node if odd count
      const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
      const parentHash = combineHashes(left, right);
      nextLayer.push(parentHash);
    }
    layers.push(nextLayer);
    currentLayer = nextLayer;
  }

  return {
    layers,
    root: currentLayer[0],
  };
}

/**
 * Generate Merkle Proof array for a candidate leaf hash in the tree
 * @param {Object} tree - Tree object returned by buildMerkleTree
 * @param {string} targetHash - Leaf hash
 * @returns {Array<{ position: 'left'|'right', data: string }>}
 */
function getMerkleProof(tree, targetHash) {
  if (!tree || !tree.layers || tree.layers.length === 0) return [];
  
  let formattedTarget = String(targetHash || "").trim();
  if (!formattedTarget.startsWith("0x")) formattedTarget = "0x" + formattedTarget;
  formattedTarget = formattedTarget.toLowerCase();

  const leaves = tree.layers[0];
  let index = leaves.indexOf(formattedTarget);

  if (index === -1) {
    return [];
  }

  const proof = [];

  for (let layerIndex = 0; layerIndex < tree.layers.length - 1; layerIndex++) {
    const currentLayer = tree.layers[layerIndex];
    const isRightNode = index % 2 === 1;
    const pairIndex = isRightNode ? index - 1 : index + 1;

    let siblingHash;
    if (pairIndex < currentLayer.length) {
      siblingHash = currentLayer[pairIndex];
    } else {
      // If pair index out of bounds (odd layer), sibling is self
      siblingHash = currentLayer[index];
    }

    proof.push({
      position: isRightNode ? "left" : "right",
      data: siblingHash,
    });

    index = Math.floor(index / 2);
  }

  return proof;
}

/**
 * Verify Merkle Proof against candidate Merkle Root
 * @param {string} leafHash
 * @param {Array<{ position: 'left'|'right', data: string }>} proof
 * @param {string} expectedRoot
 * @returns {boolean}
 */
function verifyMerkleProof(leafHash, proof, expectedRoot) {
  if (!leafHash || !expectedRoot) return false;

  let current = String(leafHash).trim();
  if (!current.startsWith("0x")) current = "0x" + current;
  current = current.toLowerCase();

  let targetRoot = String(expectedRoot).trim();
  if (!targetRoot.startsWith("0x")) targetRoot = "0x" + targetRoot;
  targetRoot = targetRoot.toLowerCase();

  if (!proof || proof.length === 0) {
    return current === targetRoot;
  }

  for (const step of proof) {
    let sibling = String(step.data).trim();
    if (!sibling.startsWith("0x")) sibling = "0x" + sibling;
    sibling = sibling.toLowerCase();

    if (step.position === "left") {
      current = combineHashes(sibling, current);
    } else {
      current = combineHashes(current, sibling);
    }
  }

  return current.toLowerCase() === targetRoot.toLowerCase();
}

module.exports = {
  combineHashes,
  buildMerkleTree,
  getMerkleProof,
  verifyMerkleProof,
};
