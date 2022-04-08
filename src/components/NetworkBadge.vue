<template>
  <span
    class="badge"
    :class="{
      'bg-success': networkObj.type === NetworkType.MAINNET,
      'bg-danger': networkObj.type === NetworkType.TESTNET,
      'bg-warning': networkObj.type === NetworkType.UNSUPPORTED
    }"
  >
    {{ networkObj.name }}
  </span>
</template>

<script lang="ts">
import { TezosNetworkConfig, NetworkType } from '@/services/TezosNetworkConfig';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    network: {
      required: true,
      type: String as PropType<string>
    }
  },

  setup(props) {
    const networkObj = computed(() => {
      if (TezosNetworkConfig.networks[props.network]) {
        return TezosNetworkConfig.networks[props.network]!;
      }

      return {
        name: 'Unsupported',
        rpc: '',
        type: NetworkType.UNSUPPORTED
      };
    });

    return {
      NetworkType,
      networkObj
    };
  }
});
</script>
