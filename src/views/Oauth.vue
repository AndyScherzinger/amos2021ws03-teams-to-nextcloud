<template>
  <p> hi </p>
</template>

<script>
export default {
    name: 'Oauth',
    data () {
        return {
            client_id: '',
            client_secret: ''
        }
    },
    async mounted() {
        console.log(window.location);
        let params = new URLSearchParams(window.location.search)
        let response = await fetch(`http://nextcloud.url/index.php/apps/oauth2/api/v1/token?grant_type=authorization_code&client_id=${this.client_id}&client_secret=${this.client_secret}&redirect_uri=${process.env.BASE_URL}&code=${params.get('code')}`, {mode: 'no-cors', method: 'POST'})
        console.log(response)

    }
}
</script>

<style>

</style>
