<template>
    <b-button variant="primary" @click.prevent="oauthStart">
        <b-icon icon="arrow-bar-right"/> Login
    </b-button>
</template>

<script>
export default {
    name: 'Login',
    data () {
        return{
            client_id: '',
            client_secret: ''
        }
    },
    methods:{
        oauthStart(){
            window.open(`http://nextcloud.url/index.php/apps/oauth2/authorize?client_id=${this.client_id}&response_type=code&redirect_url=${process.env.BASE_URL}%2Flogin`, '_blank', 'noopener');
        }
    }
}
</script>

<style>

</style>
