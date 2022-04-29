<template>
  <div class="dropdown-select" :class="{'disabled-active': current.disabled}" ref="dropdownElement">
    <button class="dropdown-link btn btn-secondary" type="button" :class="{disabled}" data-bs-toggle="dropdown">
      <span class="current-value">{{ current.name }}</span>
      <span class="material-icons">expand_more</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-dark">
      <li v-for="(item, index) in options" :key="index" @click="dropDownClick(item)">
        <a class="dropdown-item" :class="classList(item)">{{ item.name }}</a>
      </li>
    </ul>
  </div>
</template>

<script>

import {onMounted, ref} from "vue";
import useResizeObserver from "@/composables/useResizeObserver";

export default {
  name: "DropDownSelect",
  props: {
    options: {
      type: Array,
      required: true,
      validator(value) {
        return !value.find(i => (
            !Object.prototype.hasOwnProperty.call(i, 'name') ||
            !Object.prototype.hasOwnProperty.call(i, 'value')
        ))
      }
    },
    defaultText: {
      default: 'Не выбрано'
    },
    modelValue: {
      type: [Number, String]
    },
    disabled: {
      type: Boolean
    }
  },
  emits: ['update:modelValue', 'change'],
  setup() {
    /** @type {Ref<HTMLElement|Element>}*/
    const dropdownElement = ref()
    const resizeObserver = useResizeObserver()

    onMounted(() => resizeObserver.handleResize(document.body, bodyRect => {
      const dropdownRect = dropdownElement.value.getBoundingClientRect()
      const dropdownMenu = dropdownElement.value.querySelector(".dropdown-menu")

      dropdownMenu.style.maxHeight = `${bodyRect.bottom - dropdownRect.bottom - 5}px`
      dropdownMenu.style.maxWidth = `${dropdownElement.value.parentElement.clientWidth - 20}px`
    }))

    return {dropdownElement}
  },
  computed: {
    current() {
      return this.options.find(i => i.value === this.modelValue)
          || {name: this.defaultText, value: undefined}
    }
  },
  methods: {
    dropDownClick({value, disabled = false}) {
      if (!disabled) {
        this.$emit('update:modelValue', value)
      }
    },
    classList(option) {
      return {
        active: option === this.current,
        disabled: option.disabled || false
      }
    },
  },
  watch:{
    current(){
      this.$emit('change')
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/theme";

.dropdown-select {
  display: flex;
  position: relative;
  width: 100%;

  .dropdown-link {
    display: flex;
    flex-flow: row nowrap;
    position: relative;
  }

  .dropdown-menu {
    overflow: hidden auto;
    min-width: 100%;

    &::-webkit-scrollbar {width: 6px}
    &::-webkit-scrollbar-thumb {background-color: #999}
    &::-webkit-scrollbar-track {background-color: #4d4d4d}

    .dropdown-item {
      cursor: pointer;
      user-select: none;
      width: 100%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}


.dropdown-link {
  width: 100%;
  //max-width: 400px;
  background: #666;
  padding-right: 35px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-color: #4d4d4d;
  text-align: left;

  &:hover, &:active, &:focus {
    background: #666;
    box-shadow: 0 0;
    border-color: #4d4d4d;
  }

  .disabled-active & {
    color: $gray-500;
  }

  .current-value{
      cursor: pointer;
      user-select: none;
      max-width: 100%;
      width: 100%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
  }
}



.btn-secondary {
  .material-icons {
    position: absolute;
    right: 10px;
    font-size: 1.5rem;
    transition: 300ms;
  }

  &.btn.disabled{
    border-color: #444;
  }

  &[aria-expanded="true"] .material-icons {
    transform: rotate(180deg);
  }
}

.selected {
  background: #999;
  color: #ccc;
}
</style>