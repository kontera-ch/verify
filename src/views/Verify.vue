<template>
  <div class="flex-grow-1 pt-4">
    <Loading :isLoading="showLoader" class="pt-4" :scale="2">
      <div class="row py-4">
        <div class="col">
          <div>
            <label for="file" class="form-label" :class="{ 'text-success': validInputFile }">Original Datei</label>
            <input class="form-control form-control-lg" id="file" :class="{ 'is-valid': validInputFile }" @change="inputFileUpload" type="file" />
          </div>
        </div>

        <div class="col">
          <div>
            <label for="proof" class="form-label" :class="{ 'text-success': validProofFile }">Proof Datei</label>
            <input class="form-control form-control-lg" id="proof" :class="{ 'is-valid': validProofFile }" @change="inputProofUpload" type="file" />
          </div>
        </div>
      </div>

      <div class="row d-flex flex-row">
        <div class="col flex-grow-1 pe-3">
          <div v-if="inputFileHash" class="card h-100 shadow">
            <div class="card-body">
              <div class="card-header-title text-muted small">Originaldatei</div>

              <div class="pt-0" v-if="inputFileHash">
                <div>Hash: {{ inputFileHash }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col flex-grow-1 ps-3">
          <div v-if="proofJson" class="card h-100 shadow" :class="{ 'border-success': proofIsValid }">
            <div class="card-body">
              <div class="card-header-title text-muted small">Proof</div>

              <div class="pt-0" v-if="proofJson">
                <div>
                  Hash: {{ proofJson.hash }}
                  <span class="badge badge-success" v-if="inputFileHash === proofJson.hash">Korrekter Proof</span>
                </div>
                <div>Network: {{ proofJson.network }}</div>
                <div>Timestamp: {{ proofJson.timestamp }}</div>

                <hr />

                <div>
                  Berechneter Block:
                  <a :href="`https://www.tzkt.io/${blockHash(computedOperations[computedOperations.length - 1].after)}/operations`">
                    {{ blockHash(computedOperations[computedOperations.length - 1].after) }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-grid py-4">
        <button class="btn d-block text-white btn-success" @click="checkValidity" v-if="proofJson && inputFileHash">Prüfen</button>
      </div>

      <div v-if="proofIsValid" class="card bg-success h-100 shadow" :class="{ 'border-success': proofIsValid }">
        <div class="card-body text-white">Proof wurde erfolgreich verifiziert. Diese Datei hat am {{ proofJson.timestamp }} existiert und ist seither unverändert.</div>
      </div>

      <div v-if="error" class="alert alert-warning mt-4">
        {{ error }}
      </div>

      <div v-if="nerdMode" class="alert alert-success mt-4 small">
        Nerd Mode
        <div v-for="op in computedOperations" :key="`operation-${op.previous}`">
          <div class="row py-2" v-if="op.operation.type === 'blake2b'">
            <div class="col-2">blake2b</div>
            <div class="col-10">
              <code>{{ op.after }}</code>
            </div>
          </div>

          <div class="row py-2" v-if="op.operation.type === 'join'">
            <div class="col-2">join</div>
            <div class="col-10">
              <div>
                Prepend:
                <code>{{ op.operation.prepend }}</code>
              </div>
              <div>
                Append:
                <code>{{ op.operation.append }}</code>
              </div>
              <div>
                Output:
                <code>{{ op.after }}</code>
              </div>
            </div>
          </div>
        </div>

        <div class="row" v-if="computedOperations.length > 0">
          <div class="col-2">b58check encoding + tezos block prefix</div>

          <div class="col-10">
            <a :href="`https://www.tzkt.io/${blockHash(computedOperations[computedOperations.length - 1].after)}/operations`">
              Block {{ blockHash(computedOperations[computedOperations.length - 1].after) }}
            </a>
          </div>
        </div>
      </div>
    </Loading>
  </div>

  <div class="py-2 align-self-end">
    <a class="small text-muted" @click="nerdMode = !nerdMode" role="button">Nerd Mode</a>
  </div>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, defineComponent, ref } from 'vue';
import TezosBlockHeaderProof from '../lib/kontera/proof/TezosBlockHeaderProof';
import { TezosNetworkConfig } from '@/services/TezosNetworkConfig';
import { buf2hex, b58cencode } from '@taquito/utils';
import { OperationTemplate } from '@/lib/kontera/proof/operations/Operation';

export default defineComponent({
  components: {
    Loading: defineAsyncComponent(() => import('@/components/Loading.vue'))
  },

  setup() {
    // validity
    const validInputFile = ref(false);
    const validProofFile = ref(false);

    const proof = ref<any>(null);
    const inputFileHash = ref('');
    const operations = ref<any[]>([]);

    const nerdMode = ref(false);
    const showLoader = ref(false);
    const isVerified = ref<boolean>();
    const proofIsValid = ref<boolean | null>(null);
    const error = ref<any>(null);

    const proofJson = ref<any | null>(null);

    const hashFile = async function (inputFileBuffer: ArrayBuffer) {
      if (!window.crypto) {
        throw new Error('window.crypto is not supported');
      }

      const fileHashBuffer = await window.crypto.subtle.digest('SHA-256', inputFileBuffer);
      const hashArray = Array.from(new Uint8Array(fileHashBuffer)); // convert buffer to byte array
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string

      return hashHex;
    };

    const inputFileUpload = async function (event: any) {
      showLoader.value = true;

      const files = event.target.files;
      const arrayBuffer = await files[0].arrayBuffer();
      const hash = await hashFile(arrayBuffer);

      inputFileHash.value = hash;
      validInputFile.value = true;

      showLoader.value = false;
    };

    const inputProofUpload = async function (event: any) {
      showLoader.value = true;

      const files = event.target.files;
      const arrayBuffer = await files[0].arrayBuffer();

      try {
        const blob = new Blob([arrayBuffer], { type: 'text/plain; charset=utf-8' });
        proofJson.value = JSON.parse(await blob.text());
        validProofFile.value = true;
      } catch (err) {
        error.value = 'VERIFIER_ERROR.INVALID_PROOF_FILE';
      } finally {
        showLoader.value = false;
      }
    };

    const checkValidity = async function () {
      proofIsValid.value = false;
      showLoader.value = true;

      const tezosBlockHeaderProof = TezosBlockHeaderProof.fromJSON({
        hash: proofJson.value.hash,
        operations: proofJson.value.operations,
        network: proofJson.value.network,
        timestamp: proofJson.value.timestamp,
        version: proofJson.value.version
      });

      try {
        if (buf2hex(Buffer.from(tezosBlockHeaderProof.hash)) !== inputFileHash.value) {
          throw 'VERIFIER_ERROR.PROOF_DOES_NOT_MATCH_FILE';
        }

        proofIsValid.value = await tezosBlockHeaderProof.verify(TezosNetworkConfig.rpc(tezosBlockHeaderProof.network));
      } catch (err) {
        proofIsValid.value = false;
        error.value = err;
      } finally {
        isVerified.value = true;
        showLoader.value = false;
      }
    };

    const computedOperations = computed(() => {
      if (!proofJson.value) {
        return [];
      }

      const tezosBlockHeaderProof = TezosBlockHeaderProof.fromJSON({
        hash: proofJson.value.hash,
        operations: proofJson.value.operations,
        network: proofJson.value.network,
        timestamp: proofJson.value.timestamp,
        version: proofJson.value.version
      });

      const operations: { previous: string; operation: OperationTemplate; after: string }[] = [];

      tezosBlockHeaderProof.operations.reduce((currentHash, operation) => {
        const newHash = operation.commit(currentHash);
        operations.push({ previous: buf2hex(Buffer.from(currentHash)), operation: operation.toJSON(), after: buf2hex(Buffer.from(newHash)) });
        return newHash;
      }, tezosBlockHeaderProof.hash);

      return operations;
    });

    const blockHash = function (hash: string) {
      return b58cencode(hash, new Uint8Array([1, 52]));
    };

    return {
      inputFileUpload,
      inputProofUpload,
      inputFileHash,
      operations,
      proof,
      showLoader,
      error,
      isVerified,
      proofJson,
      computedOperations,
      blockHash,
      proofIsValid,
      nerdMode,
      checkValidity,

      // validity
      validInputFile,
      validProofFile
    };
  }
});
</script>

<style lang="scss">
.card {
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
</style>
