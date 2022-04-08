<template>
  <div class="position-relative">
    <slot />
    <transition name="kontera-fade">
      <div class="loader d-flex" v-if="isLoading || complete">
        <div class="d-flex flex-grow-1 flex-column justify-content-center align-items-center">
          <div class="loader-bg"></div>
          <div :style="{ transform: `scale(${scale}`, margin: `${scale * 1}rem` }">
            <div class="circle-loader" :class="{ 'load-complete': complete || hasError, error: hasError }"></div>
            <div class="checkmark draw none" :class="{ 'd-block': complete && !hasError }"></div>
            <div class="errormark draw none" :class="{ 'd-block': hasError }"></div>
          </div>
          <div v-if="!complete && !hasError" class="slot-text">
            <slot name="loading" />
          </div>
          <div v-if="complete && !hasError" class="slot-text">
            <slot name="success" />
          </div>
          <div v-if="hasError" class="slot-text">
            <slot name="error" v-bind:error="error" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    isLoading: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    complete: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    error: {
      type: String as PropType<string | null>,
      default: null
    },
    scale: {
      type: Number as PropType<number>,
      default: 2
    }
  },

  setup(props) {
    return {
      hasError: computed(() => {
        return props.error !== null;
      })
    };
  }
});
</script>

<style scoped lang="scss">
$loader-size: 3em;
$check-height: $loader-size/2;
$check-width: $check-height/2;
$check-left: ($loader-size/6 + $loader-size/12);
$check-thickness: 3px;
$check-color: var(--bs-success);
$error-color: var(--bs-danger);

$error-left: $loader-size/6;
$error-right: ($loader-size/12 + $loader-size/6);

.loader {
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  position: absolute;
  border: 1px solid transparent;
}

.loader-bg {
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  position: absolute;
  background: white;
  opacity: 0.5;
}

.slot-text {
  padding-top: 1rem;
  z-index: 10;
}

.circle-loader {
  padding-bottom: $loader-size/2;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-left-color: var(--bs-primary);
  animation: loader-spin 1.2s infinite linear;
  position: relative;
  display: inline-block;
  vertical-align: top;
  border-radius: 50%;
  width: $loader-size;
  height: $loader-size;
}

.load-complete {
  -webkit-animation: none;
  animation: none;
  border-color: $check-color;
  transition: border 500ms ease-out;

  &.error {
    border-color: $error-color;
  }
}

.none {
  display: none;
}

.errormark {
  display: none;

  &.draw:after,
  &.draw:before {
    animation-duration: 800ms;
    animation-timing-function: ease;
    animation-name: checkmark;
    transform: scaleX(-1) rotate(135deg);
  }

  &.draw:after {
    transform: scaleX(-1) rotate(45deg);
  }

  &:after {
    opacity: 1;
    height: $check-height;
    width: $check-width;
    transform-origin: right top;
    border-left: $check-thickness solid $error-color;
    content: '';
    left: -$loader-size/12;
    top: $check-height;
    position: absolute;
  }

  &:before {
    opacity: 1;
    height: $check-height;
    width: $check-width;
    transform-origin: left top;
    border-right: $check-thickness solid $error-color;
    content: '';
    left: $loader-size/6;
    top: $check-height;
    position: absolute;
  }
}

.checkmark {
  display: none;

  &.draw:after {
    animation-duration: 800ms;
    animation-timing-function: ease;
    animation-name: checkmark;
    transform: scaleX(-1) rotate(135deg);
  }

  &:after {
    opacity: 1;
    height: $check-height;
    width: $check-width;
    transform-origin: left top;
    border-right: $check-thickness solid $check-color;
    border-top: $check-thickness solid $check-color;
    content: '';
    left: $check-left;
    top: $check-height;
    position: absolute;
  }
}

@keyframes loader-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes checkmark {
  0% {
    height: 0;
    width: 0;
    opacity: 1;
  }
  20% {
    height: 0;
    width: $check-width;
    opacity: 1;
  }
  40% {
    height: $check-height;
    width: $check-width;
    opacity: 1;
  }
  100% {
    height: $check-height;
    width: $check-width;
    opacity: 1;
  }
}
</style>
