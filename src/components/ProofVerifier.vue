<template>
  <div class="row">
    <div class="col-lg-6">
      <button class="btn d-block text-white btn-success" @click="checkValidity()" :disabled="!inputProof || !inputHash">Prüfen</button>
    </div>
  </div>

  <div class="pt-4" v-if="inputProof && inputHash">
    <div v-if="proofIsValid === true" class="card h-100 shadow" :class="{ 'border-success': proofIsValid, 'border-danger': notMainnet }">
      <div class="card-body">
        <div v-if="notMainnet" class="text-danger pb-2 fw-bold">Dieser Proof wurde auf einem Test-Netzwerk generiert und hat daher keine Gültigkeit.</div>

        Proof wurde erfolgreich verifiziert. Diese Datei hat am {{ inputProof.timestamp }} existiert und blieb seither unverändert. Der dazugehörige Block ist
        <a :href="`https://www.tzkt.io/${blockHash(computedOperations[computedOperations.length - 1].after)}/operations`">
          {{ blockHash(computedOperations[computedOperations.length - 1].after) }}
        </a>
      </div>
    </div>

    <div v-if="proofError" class="alert alert-warning mt-4">
      {{ proofError }}
    </div>

    <template v-if="nerdMode">
      <div class="card mt-4 small">
        <div class="card-header">
          <div class="card-header-title text-muted small py-2">Nerd Mode</div>
        </div>

        <div class="card-body">
          <div class="row py-2">
            <div class="col-2">hash</div>
            <div class="col-10">
              <code>
                <span class="highlight-previous">{{ inputProof.hashAsHex }}</span>
              </code>
            </div>
          </div>

          <div v-for="op in computedOperations" :key="`operation-${op.previous}`">
            <div class="row py-2" v-if="op.operation.type === 'blake2b'">
              <div class="col-2">blake2b</div>
              <div class="col-10">
                <code>
                  <span class="highlight-previous">{{ op.after }}</span>
                </code>
              </div>
            </div>

            <div class="row py-2" v-if="op.operation.type === 'join'">
              <div class="col-2">join</div>
              <div class="col-10">
                <code>
                  <span class="highlight-prepend">{{ op.operation.prepend }}</span>
                  <span class="highlight-previous">{{ op.previous }}</span>
                  <span class="highlight-append">{{ op.operation.append }}</span>
                </code>
              </div>
            </div>
          </div>

          <div class="row py-2">
            <div class="col-2">b58check encoding + tezos block prefix</div>
            <div class="col-10">
              <code>{{ blockHash(computedOperations[computedOperations.length - 1].after) }}</code>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <div class="py-2 align-self-end">
    <a class="small text-muted" @click="nerdMode = !nerdMode" role="button">Nerd Mode</a>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import TezosBlockHeaderProof from '../lib/kontera/proof/TezosBlockHeaderProof';
import { NetworkType, TezosNetworkConfig } from '@/services/TezosNetworkConfig';
import { buf2hex, b58cencode } from '@taquito/utils';
import { OperationTemplate } from '@/lib/kontera/proof/operations/Operation';

export default defineComponent({
  props: {
    inputProof: {
      type: Object as PropType<TezosBlockHeaderProof>
    },

    inputHash: {
      type: String as PropType<string>
    }
  },

  setup(props) {
    const nerdMode = ref(false);
    const showLoader = ref(false);

    const proofIsValid = ref<boolean | null>(null);
    const proofError = ref<string | null>(null);

    const isVerified = ref<boolean>();
    const error = ref<any>(null);

    const checkValidity = async function () {
      if (!props.inputProof) {
        return;
      }

      showLoader.value = true;

      proofIsValid.value = false;
      proofError.value = null;

      try {
        if (props.inputProof.hashAsHex !== props.inputHash) {
          throw new Error('VERIFIER_ERROR.PROOF_DOES_NOT_MATCH_FILE');
        }

        proofIsValid.value = await props.inputProof.verify(TezosNetworkConfig.rpc(props.inputProof.network).rpc);
      } catch (err) {
        proofIsValid.value = false;
        proofError.value = (err as Error).message;
      } finally {
        isVerified.value = true;
        showLoader.value = false;
      }
    };

    const computedOperations = computed(() => {
      if (!props.inputProof) {
        return [];
      }

      const operations: { previous: string; operation: OperationTemplate; after: string }[] = [];

      props.inputProof.operations.reduce((currentHash, operation) => {
        const newHash = operation.commit(currentHash);
        operations.push({ previous: buf2hex(Buffer.from(currentHash)), operation: operation.toJSON(), after: buf2hex(Buffer.from(newHash)) });
        return newHash;
      }, props.inputProof.hash);

      return operations;
    });

    const blockHash = function (hash: string) {
      return b58cencode(hash, new Uint8Array([1, 52]));
    };

    const notMainnet = computed(() => {
      if (!props.inputProof) {
        return false;
      }

      return TezosNetworkConfig.networks[props.inputProof.network]?.type === NetworkType.TESTNET;
    });

    return {
      showLoader,
      error,
      isVerified,
      computedOperations,
      blockHash,
      proofIsValid,
      checkValidity,
      proofError,
      notMainnet,
      nerdMode
    };
  }
});
</script>

<style lang="scss">
@import '../assets/variables';

.card {
  .card-header {
    background: white;
  }

  .card-header-title-text {
    transition: transform 350ms ease, opacity 100ms ease !important;
    opacity: 0.8;
  }

  .fa-caret-down {
    transition: transform 350ms ease, opacity 100ms ease !important;
    opacity: 0.5;
  }

  &:hover {
    .fa-caret-down,
    .card-header-title-text {
      opacity: initial;
    }
  }
}

.dropzone {
  background: white;
  min-height: 300px;
}

.dragging {
  background-color: var(--bs-success);
  color: white;
}

.highlight-prepend {
  color: black;
  background-color: $lighter-green;
}

.highlight-previous {
  color: black;
  background-color: white;
}

.highlight-append {
  color: black;
  background-color: $lighter-green;
}
</style>
