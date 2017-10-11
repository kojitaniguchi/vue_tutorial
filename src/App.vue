<template>
  <div>
   <p v-if="msg.length > 0">
    {{msg}}
   <p v-else>
    no text
   </p>
   <input type="text" v-model="msg">
   <button @click="clear()">clear</button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello World!'
    }
  },
  methods: {
    clear () {
      this.msg = ''
    }
  }
}
</script>
