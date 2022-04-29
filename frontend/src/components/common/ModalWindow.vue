<template>
  <div :id="id" ref="modal" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button data-role="cancel"
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close">
          </button>
        </div>
        <div class="modal-body">
          <p>
            <slot name="message"></slot>
          </p>
        </div>
        <div class="modal-footer">
          <button data-role="cancel"
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal">
            <slot name="button-text-cancel"></slot>
          </button>
          <button v-if="isDialog" data-role="ok"
                  type="button"
                  class="btn btn-primary"
                  data-bs-dismiss="modal">
            <slot name="button-text-ok"></slot>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {Modal} from 'bootstrap'
export default {
  name: 'ModalDialogWindow',
  props: {
    id: {
      type: String,
      default(){
        return "modalWindow"
      }
    },
    type: {
      type: String,
      validator(value){
        return ['alert', 'dialog'].indexOf(value) !== -1
      }
    },
    name: {
      type: String,
      default(){
        return "modalWindow"
      }
    }
  },
  computed:{
    typeProp(){
      return this.type;
    },
    isAlert(){
      return this.typeProp === 'alert';
    },
    isDialog(){
      return this.typeProp === 'dialog';
    },
    modal(){
      return new Modal(
          this.$refs.modal,
          {
            keyboard: false,
          },
      )
    }
  },
  emits: ['modalResult'],
  methods:{
    setEvents(){
      this.$refs.modal.querySelectorAll("[data-role='ok']")
      .forEach((item) => {
        item.addEventListener('click', this.eventHandlerSuccess);
      });

      this.$refs.modal.querySelectorAll("[data-role='cancel']")
      .forEach((item) => {
        item.addEventListener('click', this.eventHandlerFail);
      });
    },
    removeEvents(){
      this.$refs.modal.querySelectorAll("[data-role='cancel']")
      .forEach((item) => {
        item.removeEventListener('click', this.eventHandlerSuccess);
      });

      this.$refs.modal.querySelectorAll("[data-role='cancel']")
      .forEach((item) => {
        item.removeEventListener('click', this.eventHandlerFail);
      });
    },
    eventHandlerSuccess(){
      this.$emit('modalResult', {
        result: true,
        name: this.name
      });
    },
    eventHandlerFail(){
      this.$emit('modalResult', {
        result: false,
        name: this.name
      });
    },
    show () {
      this.removeEvents();
      this.result = false;
      this.setEvents();
      this.modal.show();
    },
    hide(){
      this.modal.hide();
    }
  },
  mounted(){

  },

};
</script>

<style scoped>
.modal-body p{
  color: #000000;
}
</style>