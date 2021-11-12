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
        window.open(`${process.env.VUE_APP_BACKEND_BASE_URL}/login`, '_blank', 'popup,noopener')
        this.intervalId = setInterval(() => { 
            console.log('intervalId: ', this.intervalId)
            console.log('loggedIn: ', this.loggedIn)
            fetch(`${process.env.VUE_APP_BACKEND_BASE_URL}/user`, {credentials: 'same-origin'})
                .then((response)=>{
                    console.log('is response ok?', response.ok)
                    if(response.ok){
                        console.log("ok response")
                        clearInterval(this.intervalId);
                        this.loggedIn = true;
                    }
                })
        }, 5000)

    }
  }

}
</script>

<style>

</style>
