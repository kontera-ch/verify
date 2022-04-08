<template>
  <div class="flex-grow-1 pt-4">
    <div class="row py-4 justify-content-center">
      <div class="col-xs-12 col-lg-6">
        <div
          class="dropzone card shadow"
          v-on:drop="handleDrop($event, inputFileUpload)"
          v-on:dragenter.prevent.stop="dragging.original = true"
          v-on:dragover.prevent.stop="dragging.original = true"
          v-on:dragleave.prevent.stop="dragging.original = false"
          v-bind:class="{ dragging: dragging.original }"
        >
          <div class="d-flex flex-grow-1 justify-content-center align-items-center" v-if="!inputFile">
            <div>
              <label for="file">Original-Datei</label>
              <input class="form-control form-control" id="file" @change="inputFileUpload($event.target.files)" type="file" placeholder="Hi" />
            </div>
          </div>
          <template v-else>
            <div class="card-header">
              <div class="card-header-title text-muted small py-2">
                Original Datei
                <a class="text-underline text-primary small float-end" role="button" @click="inputFile = null">Zurücksetzen</a>
              </div>
            </div>
            <div class="card-body">
              <div class="card-header-title text-muted small">Hash</div>
              <div v-if="inputFileHash">
                <code>{{ inputFileHash }}</code>
              </div>

              <div class="card-header-title text-muted small pt-2">Name</div>

              <div v-if="inputFile">
                {{ inputFile.name }}
              </div>

              <div class="card-header-title text-muted small pt-2">Grösse</div>

              <div v-if="inputFile">{{ Math.round(inputFile.size / 1024) }}kb</div>
            </div>
          </template>
        </div>
      </div>

      <div class="col-xs-12 col-lg-6">
        <div
          class="dropzone card shadow"
          v-on:drop="handleDrop($event, inputProofUpload)"
          v-on:dragenter.prevent.stop="dragging.proof = true"
          v-on:dragover.prevent.stop="dragging.proof = true"
          v-on:dragleave.prevent.stop="dragging.proof = false"
          :class="{ dragging: dragging.proof }"
        >
          <div class="d-flex flex-grow-1 justify-content-center align-items-center" v-if="!proof">
            <div>
              <label for="proof">Proof-Datei</label>
              <input class="form-control form-control" id="proof" @change="inputProofUpload($event.target.files)" type="file" />
            </div>
          </div>

          <div v-if="proof">
            <div class="card-header">
              <div class="card-header-title text-muted small py-2">
                Proof Datei
                <a
                  class="text-underline text-primary small float-end"
                  role="button"
                  @click="
                    proof = null;
                    proofFileError = null;
                  "
                >
                  Zurücksetzen
                </a>
              </div>
            </div>

            <div class="card-body">
              <div class="card-header-title text-muted small">Hash</div>

              <div>
                <code>{{ proof.hashAsHex }}</code>
              </div>

              <div class="card-header-title text-muted small pt-2">Network</div>

              <div>
                {{ proof.network }}
                <NetworkBadge :network="proof.network" />
              </div>

              <div class="card-header-title text-muted small pt-2">Zeitstempel</div>

              <div>
                {{ proof.timestamp }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ProofVerifier v-if="inputFileHash && proof" :input-hash="inputFileHash" :input-proof="proof" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import NetworkBadge from '@/components/NetworkBadge.vue';
import ProofVerifier from '@/components/ProofVerifier.vue';
import TezosBlockHeaderProof, { SerializedTezosBlockHeaderProof } from '@/lib/kontera/proof/TezosBlockHeaderProof';

export default defineComponent({
  components: {
    NetworkBadge,
    ProofVerifier
  },

  setup() {
    // validity
    const validInputFile = ref(false);
    const validProofFile = ref(false);

    // original file
    const inputFile = ref<File | null>(null);
    const inputFileHash = ref<string | null>(null);
    const originalInputFileLoader = ref(false);

    // proof file
    const proof = ref<any>(null);
    const proofFileLoader = ref(false);
    const proofFileError = ref<string | null>(null);

    const operations = ref<any[]>([]);

    const nerdMode = ref(false);
    const showLoader = ref(false);

    const isVerified = ref<boolean>();
    const error = ref<any>(null);

    const hashFile = async function (inputFileBuffer: ArrayBuffer) {
      if (!window.crypto) {
        throw new Error('window.crypto is not supported');
      }

      const fileHashBuffer = await window.crypto.subtle.digest('SHA-256', inputFileBuffer);
      const hashArray = Array.from(new Uint8Array(fileHashBuffer)); // convert buffer to byte array
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string

      return hashHex;
    };

    const inputFileUpload = async function (files: FileList) {
      originalInputFileLoader.value = true;

      inputFile.value = files[0];
      const arrayBuffer = await inputFile.value.arrayBuffer();
      const hash = await hashFile(arrayBuffer);

      inputFileHash.value = hash;
      validInputFile.value = true;

      originalInputFileLoader.value = false;
    };

    const inputProofUpload = async function (files: FileList) {
      proofFileError.value = null;
      proofFileLoader.value = true;

      const arrayBuffer = await files[0].arrayBuffer();

      try {
        const blob = new Blob([arrayBuffer], { type: 'text/plain; charset=utf-8' });
        const proofJson: SerializedTezosBlockHeaderProof = JSON.parse(await blob.text());

        proof.value = TezosBlockHeaderProof.fromJSON(proofJson);

        validProofFile.value = true;
      } catch (err) {
        proofFileError.value = 'VERIFIER_ERROR.INVALID_PROOF_FILE';
      } finally {
        proofFileLoader.value = false;
      }
    };

    const dragging = ref({ original: false, proof: false });

    const handleDrop = (event: DragEvent, inputUpload: (files: FileList) => void) => {
      event.preventDefault();
      event.stopPropagation();

      dragging.value.original = false;
      dragging.value.proof = false;

      if (event.dataTransfer) {
        inputUpload(event.dataTransfer.files);
      }
    };

    return {
      inputFileUpload,
      inputProofUpload,
      inputFileHash,
      operations,
      showLoader,
      originalInputFileLoader,
      proofFileLoader,
      error,
      isVerified,
      nerdMode,

      // original
      inputFile,

      // validity
      validInputFile,
      validProofFile,

      // proof
      proofFileError,
      proof,

      // drag and drop
      handleDrop,
      dragging
    };
  }
});
</script>

<style lang="scss">
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
</style>
