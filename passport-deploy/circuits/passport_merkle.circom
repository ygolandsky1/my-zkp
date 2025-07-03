pragma circom 2.0.0;

include "./poseidon.circom";
include "./merkle.circom";

template PassportMerkle(depth) {
    signal input agent_id;
    signal input path_elements[depth];
    signal input path_index[depth];
    signal input root_from_registry;

    signal output out;

    component hash_leaf = Poseidon(1);
    hash_leaf.inputs[0] <== agent_id;

    component merkle_path = MerkleProof(depth);
    for (var i = 0; i < depth; i++) {
        merkle_path.pathElements[i] <== path_elements[i];
        merkle_path.pathIndices[i] <== path_index[i];
    }

    merkle_path.leaf <== hash_leaf.out;
    merkle_path.root <== root_from_registry;

    out <== merkle_path.out;
}

component main = PassportMerkle(3);
