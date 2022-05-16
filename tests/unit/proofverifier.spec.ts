import { shallowMount } from '@vue/test-utils';
import ProofVerifier from '@/components/ProofVerifier.vue';
import inputProof from './proofs/blockHeaderProof.json';

describe('ProofVerifier.vue', () => {
  it('accepted a input hash and proof', async () => {
    const inputHash = '644976a986652ed1bfb87ba326ca7dc60163fdf393c945edbb336462ad18a2ce';

    const wrapper = shallowMount(ProofVerifier, {
      props: {
        inputProof,
        inputHash
      }
    });
  });
});
