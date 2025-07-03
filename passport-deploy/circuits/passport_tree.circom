pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template PassportTree(depth) {
    signal input agent_id;
    signal input path_elements[depth];
    signal input path_indices[depth];
    signal input root_from_registry;

    signal output out;

    // We need an array to store the hash at each level of the tree.
    // The size is depth + 1 to include the initial leaf hash.
    signal hashes_per_level[depth + 1];

    // Hash the leaf and store it as the first element (level 0).
    component hash_leaf = Poseidon(1);
    hash_leaf.inputs[0] <== agent_id;
    hashes_per_level[0] <== hash_leaf.out;

    // Declare component arrays outside the loop
    component hashers[depth];
    signal left[depth];
    signal right[depth];

    for (var i = 0; i < depth; i++) {
        hashers[i] = Poseidon(2);

        // Constrain path_indices to be a bit (0 or 1)
        path_indices[i] * (1 - path_indices[i]) === 0;

        // The inputs to the hasher at level 'i' come from the output of the previous level, hashes_per_level[i].
        left[i] <== path_indices[i] * (path_elements[i] - hashes_per_level[i]) + hashes_per_level[i];
        right[i] <== path_indices[i] * (hashes_per_level[i] - path_elements[i]) + path_elements[i];

        hashers[i].inputs[0] <== left[i];
        hashers[i].inputs[1] <== right[i];

        // The output of the hasher at level 'i' is stored in the next position in our array.
        hashes_per_level[i+1] <== hashers[i].out;
    }

    // Compare the final calculated hash to the provided root.
    // The final hash is the last element in our hashes_per_level array.
    component checkEqual = IsEqual();
    checkEqual.in[0] <== hashes_per_level[depth];
    checkEqual.in[1] <== root_from_registry;

    out <== checkEqual.out;
}

component main = PassportTree(3);

