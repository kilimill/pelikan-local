<template>
  <div class="scrollable-decoration" :class="{scrolling}">
    <div class="scrollable-container" ref="container"
         @wheel.passive="wheel($event.deltaY)"
         @scroll.prevent.stop="wheel(0)">
      <div class="scrollable-content" ref="content">
        <slot></slot>
      </div>
    </div>
    <div class="scroll-holder" ref="scrollbar" @mousedown="mouseDownEvent">
      <div class="scroll-track" :style="{height: `${scrollSize}px`, marginTop: `${scrollOffset}px`}"></div>
    </div>
  </div>
</template>

<script>
/** @type {ResizeObserver} */
let resizeObserver = undefined,
    /** @type {function} */
    documentMouseUp = undefined,
    /** @type {function} */
    documentMouseMovie = undefined,
    /** @type {function} */
    containerMouseScroll = undefined,
    /** @type {DOMRect} */
    scrollBounding = undefined

const range = (value, min, max) => value > min ? value < max ? value : max : min

export default {
  name: "ScrollableDecorator",
  emits: ['scroll'],
  data: () => ({
    containSize: 0,
    contentSize: 0,
    scrollSize: 0,
    scrollOffset: 0,

    // При событиях клика и перетаскивания
    mouseScroll: {
      dragging: false, // Перетаскивание мышкой трека
      mouseY: undefined
    },
  }),
  computed: {
    scrolling() {
      return this.contentSize > this.containSize
    },
  },
  mounted() {
    resizeObserver = new ResizeObserver(entries => entries.forEach(entry => {
      if (entry.contentBoxSize) {
        this.calculateOverflow()
      }
    }))

    resizeObserver.observe(this.$refs.container)
    resizeObserver.observe(this.$refs.content)
    this.calculateOverflow()

    document.addEventListener('mousemove', documentMouseMovie = (e => this.mouseMoveEvent(e)))
    document.addEventListener('mouseup', documentMouseUp = (e => this.mouseUpEvent(e)))
    this.$refs.container.addEventListener('scroll', containerMouseScroll = (event => {
      event.scrollPercent = this.getScrollPercent()
      this.$emit(event.type, event)
    }))
  },

  beforeUnmount() {
    resizeObserver.unobserve(this.$refs.container)
    resizeObserver.unobserve(this.$refs.content)
    document.removeEventListener('mousemove', documentMouseMovie)
    document.removeEventListener('mousemove', documentMouseUp)
    this.$refs.container.removeEventListener('scroll', containerMouseScroll)
  },

  methods: {
    /**
     * @param {Number} delta
     **/
    wheel(delta) {
      this.$refs.container.scroll(0, this.$refs.container.scrollTop + delta)
      this.scrollOffset =
          (this.$refs.container.offsetHeight / 100) *
          (this.$refs.container.scrollTop / this.$refs.container.scrollHeight * 100)
    },

    calculateOverflow() {
      this.containSize = this.$refs.container.offsetHeight
      this.contentSize = this.$refs.content.offsetHeight

      if (this.containSize && this.contentSize) {
        this.scrollSize =
            (this.$refs.container.offsetHeight / 100) *
            (this.containSize / this.contentSize * 100)
      } else this.scrollSize = 0
    },

    /**
     * Scroll event
     * @param {MouseEvent} event
     */
    mouseDownEvent(event) {
      let boundingBox = this.$refs.scrollbar.getBoundingClientRect(),
          scrollStart = event.y - boundingBox.top + window.pageYOffset
      scrollBounding = boundingBox
      this.mouseScroll.dragging = true
      this.mouseScroll.mouseY = scrollStart

      if (event.target === this.$refs.scrollbar) { // Перетаскивание началось вне зоны трека
        let percent = scrollStart / boundingBox.height * 100 - this.scrollSize / boundingBox.height * 100 / 2
        this.$refs.container.scrollTop = 0
        this.wheel(this.$refs.container.scrollHeight / 100 * percent)
      }
    },

    mouseUpEvent() {
      if (this.mouseScroll.dragging) {
        this.mouseScroll.dragging = false
        scrollBounding = undefined
      }
    },

    /**
     * @param {MouseEvent} event
     */
    mouseMoveEvent(event) {
      if (this.mouseScroll.dragging) {
            let mousePosition = range(event.y - scrollBounding.top + window.pageYOffset, 0, scrollBounding.height),
                stepPercent = (mousePosition - this.mouseScroll.mouseY) / scrollBounding.height * 100
        this.wheel(this.$refs.container.scrollHeight  / 100 * stepPercent)
        this.mouseScroll.mouseY = mousePosition
      }
    },

    /**
     * @return {number}
     */
    getScrollHeight() {
      return this.$refs.container.scrollHeight - this.$refs.container.offsetHeight;
    },

    hasScrollbar() {
      return this.getScrollHeight() > 0
    },

    /**
     * Get scroll percentage
     * @return {number}
     */
    getScrollPercent() {
      return this.hasScrollbar() ? this.$refs.container.scrollTop / this.getScrollHeight() * 100 : 100
    },

    /**
     * Scroll to the specified percentage
     * @param percent
     */
    scrollTo(percent) {
      this.wheel(this.getScrollHeight() / 100 * (this.getScrollPercent() + range(percent, 0, 100)))
    }
  }
}
</script>

<style scoped lang="scss">
$scroll-width: 5px;
$scroll-color: rgba(0, 0, 0, 0.33);
$track-color: rgba(255, 255, 255, 0.33);

.scrollable-decoration {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-height: 100%;
  padding-right: 0;
  overflow: hidden;
  position: relative;
  z-index: 1;

  .scroll-holder {
    background-color: $scroll-color;
    display: none;
    position: absolute;
    z-index: 2;
    top: 0;
    right: 0;
    bottom: 0;
    width: $scroll-width;
    user-select: none;

    .scroll-track {
      background-color: $track-color;
      width: 100%;
    }
  }

  &.scrolling {
    padding-right: $scroll-width;

    .scroll-holder {
      display: block
    }
  }

  .scrollable-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
    max-height: 100%;
  }
}
</style>