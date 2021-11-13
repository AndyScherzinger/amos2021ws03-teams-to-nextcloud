<template>
<div>
  <b-button
  @click.prevent="initLogin"
  >
  Login Nextcloud
  </b-button>
  <b-alert
    :show="loggedIn"
    variant="success"
    dismissible>
    Login success
  </b-alert>
</div>
</template>

<script>
export default {
  data () {
    return {
        loggedIn: false,
        intervalId: null,
    }
  }, 
  methods:{
    initLogin(){
        window.open(`${process.env.VUE_APP_BACKEND_BASE_URL}/login`, '_self')
    }
  }

}
</script>

<style>

</style>
